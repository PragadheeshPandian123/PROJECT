from flask import Blueprint, request, jsonify
from models import Participant, EventRegistration, Event
from mongoengine import DoesNotExist
from datetime import datetime
from flask_cors import cross_origin

reg_bp = Blueprint("reg_bp", __name__, url_prefix="/api/registrations")

# -------------------------
# Register endpoint - FIXED
# -------------------------
@reg_bp.route("/register", methods=["POST"])
@cross_origin()
def register_event():
    data = request.get_json() or {}
    event_id = data.get("event_id")

    if not event_id:
        return jsonify({"success": False, "error": "event_id is required"}), 400

    try:
        event = Event.objects.get(id=event_id)
    except DoesNotExist:
        return jsonify({"success": False, "error": "Event not found"}), 404

    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    phone = data.get("phone", "").strip()
    reg_no = data.get("reg_no", "").strip().upper()
    department = data.get("department", "").strip()
    year = data.get("year", "").strip()

    if not name or not email:
        return jsonify({"success": False, "error": "Name and Email are required"}), 400

    # Check or create participant
    participant = Participant.objects(email=email).first()
    
    if not participant:
        participant = Participant(
            name=name,
            email=email,
            phone=phone,
            reg_no=reg_no,
            department=department,
            year=year
        )
        participant.save()

    # Check duplicate registration
    existing = EventRegistration.objects(event_id=event, participant_id=participant).first()
    if existing:
        return jsonify({"success": False, "error": "You have already registered for this event"}), 409

    # Save registration
    reg = EventRegistration(
        event_id=event,
        participant_id=participant,
        registration_time=datetime.utcnow(),
        status="Registered"
    )
    reg.save()

    # Update event registration count
    event.registrations_count = EventRegistration.objects(event_id=event).count()
    event.save()

    return jsonify({
        "success": True,
        "message": "Registration successful!",
        "registration_id": str(reg.id)
    }), 201


# -------------------------
# List participants by event
# -------------------------
@reg_bp.route("/participants", methods=["GET"])
@cross_origin()
def list_participants():
    event_id = request.args.get("event_id")
    if event_id:
        try:
            event = Event.objects.get(id=event_id)
            regs = EventRegistration.objects(event_id=event)
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
        except DoesNotExist:
            return jsonify({"success": False, "error": "Event not found"}), 404

    # all participants
    parts = Participant.objects()
    out = [{
        "participant_id": str(p.id),
        "name": p.name,
        "email": p.email,
        "phone": p.phone,
        "reg_no": p.reg_no,
        "department": p.department,
        "year": p.year,
        "created_at": p.created_at.isoformat()
    } for p in parts]
    return jsonify({"success": True, "participants": out}), 200


# -------------------------
# Single participant CRUD
# -------------------------
@reg_bp.route("/participants/<participant_id>", methods=["GET", "PUT", "DELETE"])
@cross_origin()
def handle_participant(participant_id):
    if request.method == "GET":
        try:
            p = Participant.objects.get(id=participant_id)
            return jsonify({
                "success": True,
                "participant": {
                    "participant_id": str(p.id),
                    "name": p.name,
                    "email": p.email,
                    "phone": p.phone,
                    "reg_no": p.reg_no,
                    "department": p.department,
                    "year": p.year,
                    "created_at": p.created_at.isoformat()
                }
            }), 200
        except DoesNotExist:
            return jsonify({"success": False, "error": "Participant not found"}), 404

    if request.method == "PUT":
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

    if request.method == "DELETE":
        try:
            participant = Participant.objects.get(id=participant_id)
            EventRegistration.objects(participant_id=participant).delete()
            participant.delete()
            return jsonify({"success": True, "message": "Participant and related registrations deleted"}), 200
        except DoesNotExist:
            return jsonify({"success": False, "error": "Participant not found"}), 404


# -------------------------
# List / Get / Update / Delete Registrations
# -------------------------
@reg_bp.route("/", methods=["GET"])
@cross_origin()
def list_registrations():
    event_id = request.args.get("event_id")
    qs = EventRegistration.objects
    if event_id:
        try:
            event = Event.objects.get(id=event_id)
            qs = qs(event_id=event)
        except DoesNotExist:
            return jsonify({"success": False, "error": "Event not found"}), 404
    
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


@reg_bp.route("/<reg_id>", methods=["GET", "PUT", "DELETE"])
@cross_origin()
def handle_registration(reg_id):
    if request.method == "GET":
        try:
            r = EventRegistration.objects.get(id=reg_id)
            p = r.participant_id
            return jsonify({
                "success": True,
                "registration": {
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
                }
            }), 200
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
            event = r.event_id
            r.delete()
            
            # Update event registration count
            if event:
                event.registrations_count = EventRegistration.objects(event_id=event).count()
                event.save()
            
            return jsonify({"success": True, "message": "Registration deleted"}), 200
        except DoesNotExist:
            return jsonify({"success": False, "error": "Registration not found"}), 404