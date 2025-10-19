# routes/registration_routes.py
from flask import Blueprint, request, jsonify
from models import Participant, EventRegistration, Event, User, Venue
from mongoengine import DoesNotExist
from datetime import datetime
import re
import gspread
import os
from flask_cors import cross_origin

reg_bp = Blueprint("reg_bp", __name__, url_prefix="/api/registrations")

# util: extract sheet id from a full URL (Google form/spreadsheet)
def extract_sheet_id(url_or_id):
    # try to find common spreadsheet id pattern
    if not url_or_id:
        return None
    # url may be like https://docs.google.com/spreadsheets/d/<ID>/...
    m = re.search(r"/d/([a-zA-Z0-9-_]+)", url_or_id)
    if m:
        return m.group(1)
    # else assume provided is already a sheet id
    if re.match(r"^[a-zA-Z0-9-_]+$", url_or_id):
        return url_or_id
    return None

# -------------------------
# Endpoint: check new registrations from sheet and insert into DB
# Body: { "event_id": "<id>", "organizer_id": "<userId>", "service_account_json": "path/optional" }
# If service_account_json omitted the server should use environment/config path.
# -------------------------
@reg_bp.route("/check-new", methods=["POST", "OPTIONS"])
@cross_origin()
def check_new_registrations():
    if request.method == "OPTIONS":
        return jsonify({"ok": True}), 200

    data = request.get_json() or {}
    event_id = data.get("event_id")
    caller_organizer_id = data.get("organizer_id")  # frontend should send current user id
    # optional sheet id override
    sheet_id_override = data.get("sheet_id")

    if not event_id:
        return jsonify({"success": False, "error": "event_id required"}), 400

    try:
        event = Event.objects.get(id=event_id)
    except DoesNotExist:
        return jsonify({"success": False, "error": "Event not found"}), 404

    # simple permission check: organizer must match
    try:
        if caller_organizer_id and str(event.organizer_id.id) != str(caller_organizer_id):
            return jsonify({"success": False, "error": "Not authorized for this event"}), 403
    except Exception:
        # if event.organizer_id missing or unexpected, continue (or block)
        pass

    # find sheet id: prefer override then event.gspreadsheet_link
    sheet_source = sheet_id_override or getattr(event, "gspreadsheet_link", None)
    sheet_id = extract_sheet_id(sheet_source)
    if not sheet_id:
        return jsonify({"success": False, "error": "No spreadsheet ID found for event"}), 400

    # service account file - configure path to your JSON
    # SA_FILE = os.getenv("GOOGLE_SA_FILE", "sample.json")  # put your filename or set env var
    try:
        gc = gspread.service_account(filename="sample.json")
        sheet = gc.open_by_key(sheet_id)
        worksheet = sheet.sheet1
    except Exception as e:
        return jsonify({"success": False, "error": f"Google Sheets access error: {str(e)}"}), 500

    # read header row and rows
    try:
        headers = [h.strip() for h in worksheet.row_values(1)]
        rows = worksheet.get_all_records()  # list of dicts
    except Exception as e:
        return jsonify({"success": False, "error": f"Error reading sheet: {str(e)}"}), 500

    # normalized header mapping to column index (1-based for update_cell)
    header_to_index = {headers[i].strip(): i + 1 for i in range(len(headers))}

    # define column names we expect (try multiple variants)
    def get_field_from_row(row, possible_keys):
        for k in possible_keys:
            # keys in row might have trailing spaces - try trimmed keys
            for rk in list(row.keys()):
                if rk.strip().lower() == k.strip().lower():
                    return row[rk]
        return None

    # counters & result lists
    inserted_participants = 0
    inserted_registrations = 0
    duplicates = []
    skipped = []
    updated_rows = []

    # iterate rows
    for idx, row in enumerate(rows):
        row_number = idx + 2  # sheet row (header=1)
        # get normalized status if present
        status = get_field_from_row(row, ["Status", "status", "Processed"]) or ""
        if isinstance(status, str) and status.strip().lower() in ("processed", "deleted", "skipped"):
            skipped.append({"row": row_number, "reason": f"status={status}"})
            continue

        # fields mapping - try multiple header names
        name = get_field_from_row(row, ["Name", "Full Name", "name"])
        email = get_field_from_row(row, ["Email", "Email ", "email", "E-mail"])
        phone = get_field_from_row(row, ["Phone", "Phone Number", "Mobile", "phone"])
        reg_no = get_field_from_row(row, ["Reg No", "Reg_No", "RegNo", "Registration Number", "reg_no"])
        department = get_field_from_row(row, ["Department", "Dept", "department"])
        year = get_field_from_row(row, ["Year", "year"])
        timestamp_str = get_field_from_row(row, ["Timestamp", "Time", "timestamp"])

        # basic validation
        if not email and not reg_no:
            skipped.append({"row": row_number, "reason": "no email/reg_no"})
            continue

        # parse timestamp
        submitted_at = None
        if timestamp_str:
            for fmt in ("%d/%m/%Y %H:%M:%S", "%m/%d/%Y %H:%M:%S", "%Y-%m-%d %H:%M:%S"):
                try:
                    submitted_at = datetime.strptime(timestamp_str, fmt)
                    break
                except Exception:
                    submitted_at = None
        if submitted_at is None:
            submitted_at = datetime.utcnow()

        # --- Insert or find Participant ---
        try:
            participant = None
            if email:
                participant = Participant.objects(email=email).first()
            if not participant and reg_no:
                participant = Participant.objects(reg_no=reg_no).first()

            if not participant:
                participant = Participant(
                    name=name or "",
                    email=email or "",
                    phone=phone or "",
                    reg_no=reg_no or "",
                    department=department or "",
                    year=str(year) if year is not None else ""
                )
                participant.save()
                inserted_participants += 1

            # --- Insert EventRegistration if not exists ---
            # check duplicate registration for same event & participant
            existing_reg = EventRegistration.objects(event_id=event, participant_id=participant).first()
            if existing_reg:
                duplicates.append({"row": row_number, "email": email, "reason": "duplicate registration"})
                # mark processed in sheet as Duplicate
                if "Status" in header_to_index:
                    worksheet.update_cell(row_number, header_to_index["Status"], "Duplicate")
                continue

            reg_doc = EventRegistration(
                event_id=event,
                participant_id=participant,
                registration_time=submitted_at,
                status="Registered"
            )
            reg_doc.save()
            inserted_registrations += 1

            # mark processed in sheet
            if "Status" in header_to_index:
                worksheet.update_cell(row_number, header_to_index["Status"], "Processed")
            updated_rows.append(row_number)

        except Exception as e:
            skipped.append({"row": row_number, "error": str(e)})
            # try to mark row as Error
            if "Status" in header_to_index:
                try:
                    worksheet.update_cell(row_number, header_to_index["Status"], "Error")
                except:
                    pass
            continue

    summary = {
        "success": True,
        "inserted_participants": inserted_participants,
        "inserted_registrations": inserted_registrations,
        "duplicates": duplicates,
        "skipped": skipped,
        "updated_rows": updated_rows
    }

    return jsonify(summary), 200

# List participants or filter by event_id (returns participant rows)
@reg_bp.route("/participants", methods=["GET"])
@cross_origin()
def list_participants():
    event_id = request.args.get("event_id")
    if event_id:
        # return participants for that event by joining registrations
        regs = EventRegistration.objects(event_id=event_id)
        out = []
        for r in regs:
            p = r.participant_id
            out.append({
                "registration_id": str(r.id),
                "participant_id": str(p.id),
                "name": p.name,
                "email": p.email,
                "phone": p.phone,
                "reg_no": p.reg_no,
                "department": p.department,
                "year": p.year,
                "registration_time": r.registration_time.isoformat(),
                "status": r.status,
                "team_name": r.team_name,
                "additional_info": r.additional_info
            })
        return jsonify({"success": True, "rows": out}), 200
    else:
        parts = Participant.objects()
        out = []
        for p in parts:
            out.append({
                "participant_id": str(p.id),
                "name": p.name,
                "email": p.email,
                "phone": p.phone,
                "reg_no": p.reg_no,
                "department": p.department,
                "year": p.year,
                "created_at": p.created_at.isoformat()
            })
        return jsonify({"success": True, "participants": out}), 200

# Get single participant
@reg_bp.route("/participants/<participant_id>", methods=["GET"])
@cross_origin()
def get_participant(participant_id):
    try:
        p = Participant.objects.get(id=participant_id)
        return jsonify({"success": True, "participant": {
            "participant_id": str(p.id),
            "name": p.name,
            "email": p.email,
            "phone": p.phone,
            "reg_no": p.reg_no,
            "department": p.department,
            "year": p.year,
            "created_at": p.created_at.isoformat()
        }}), 200
    except DoesNotExist:
        return jsonify({"success": False, "error": "Participant not found"}), 404

# Edit participant
@reg_bp.route("/participants/<participant_id>", methods=["PUT"])
@cross_origin()
def update_participant(participant_id):
    data = request.get_json() or {}
    try:
        p = Participant.objects.get(id=participant_id)
        p.update(
            set__name=data.get("name", p.name),
            set__email=data.get("email", p.email),
            set__phone=data.get("phone", p.phone),
            set__reg_no=data.get("reg_no", p.reg_no),
            set__department=data.get("department", p.department),
            set__year=str(data.get("year", p.year))
        )
        return jsonify({"success": True, "message": "Participant updated"}), 200
    except DoesNotExist:
        return jsonify({"success": False, "error": "Participant not found"}), 404
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400

# Delete participant (and cascade remove registrations)
@reg_bp.route("/participants/<participant_id>", methods=["DELETE"])
@cross_origin()
def delete_participant(participant_id):
    try:
        # Fetch participant
        participant = Participant.objects.get(id=participant_id)
    except DoesNotExist:
        return jsonify({"success": False, "error": "Participant not found"}), 404

    # Fetch all registrations for this participant
    registrations = EventRegistration.objects(participant_id=participant)

    # Try to update the Google Sheet for each registration
    for reg in registrations:
        event = reg.event_id
        sheet_link = getattr(event, "gspreadsheet_link", None)
        sheet_id = extract_sheet_id(sheet_link)
        if sheet_id:
            try:
                gc = gspread.service_account(filename="sample.json")
                sheet = gc.open_by_key(sheet_id)
                worksheet = sheet.sheet1

                # Read all rows and find matching participant
                rows = worksheet.get_all_records()
                headers = worksheet.row_values(1)
                header_to_index = {h.strip(): i + 1 for i, h in enumerate(headers)}

                for idx, row in enumerate(rows):
                    email_in_sheet = (row.get("Email") or row.get("Email ") or "").strip().lower()
                    reg_no_in_sheet = (row.get("Reg No") or row.get("Reg_No") or "").strip().lower()
                    if email_in_sheet == (participant.email or "").strip().lower() or \
                       reg_no_in_sheet == (participant.reg_no or "").strip().lower():
                        row_number = idx + 2  # sheet row number (header = 1)
                        if "Status" in header_to_index:
                            status_col = header_to_index["Status"]
                            worksheet.update_cell(row_number, status_col, "Deleted")
                        break  # stop after marking
            except Exception as e:
                print(f"Could not mark participant as deleted in sheet: {e}")
                # continue anyway

    # Delete registrations in MongoDB
    registrations.delete()
    # Delete participant in MongoDB
    participant.delete()

    return jsonify({"success": True, "message": "Participant and registrations deleted"}), 200


# List registrations (with participant metadata)
@reg_bp.route("/", methods=["GET"])
@cross_origin()
def list_registrations():
    event_id = request.args.get("event_id")
    qs = EventRegistration.objects
    if event_id:
        qs = qs(event_id=event_id)
    regs = qs.order_by('-registration_time')
    out = []
    for r in regs:
        p = r.participant_id
        out.append({
            "registration_id": str(r.id),
            "event_id": str(r.event_id.id) if r.event_id else None,
            "participant_id": str(p.id),
            "name": p.name,
            "email": p.email,
            "phone": p.phone,
            "reg_no": p.reg_no,
            "department": p.department,
            "year": p.year,
            "registration_time": r.registration_time.isoformat(),
            "status": r.status,
            "team_name": r.team_name,
            "additional_info": r.additional_info
        })
    return jsonify({"success": True, "registrations": out}), 200

# Get/Update/Delete single registration
@reg_bp.route("/<reg_id>", methods=["GET","PUT","DELETE"])
@cross_origin()
def handle_registration(reg_id):
    if request.method == "GET":
        try:
            r = EventRegistration.objects.get(id=reg_id)
            p = r.participant_id
            return jsonify({"success": True, "registration": {
                "registration_id": str(r.id),
                "event_id": str(r.event_id.id),
                "participant_id": str(p.id),
                "name": p.name,
                "email": p.email,
                "phone": p.phone,
                "registration_time": r.registration_time.isoformat(),
                "status": r.status,
                "team_name": r.team_name,
                "additional_info": r.additional_info
            }}), 200
        except DoesNotExist:
            return jsonify({"success": False, "error": "Registration not found"}), 404

    if request.method == "PUT":
        data = request.get_json() or {}
        try:
            r = EventRegistration.objects.get(id=reg_id)
            r.update(
                set__status=data.get("status", r.status),
                set__team_name=data.get("team_name", r.team_name),
                set__additional_info=data.get("additional_info", r.additional_info)
            )
            return jsonify({"success": True, "message": "Registration updated"}), 200
        except DoesNotExist:
            return jsonify({"success": False, "error": "Registration not found"}), 404

    if request.method == "DELETE":
        try:
            r = EventRegistration.objects.get(id=reg_id)
            r.delete()
            return jsonify({"success": True, "message": "Registration deleted"}), 200
        except DoesNotExist:
            return jsonify({"success": False, "error": "Registration not found"}), 404
