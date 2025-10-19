from flask import Blueprint, request, jsonify
from models import Event, User, Venue
from mongoengine import DoesNotExist
from datetime import datetime

event_bp = Blueprint('event_bp', __name__, url_prefix='/api/events')


# ------------------------
# Get all events for an organizer
# ------------------------
@event_bp.route('/organizer/<organizer_id>', methods=['GET'])
def get_my_events(organizer_id):
    try:
        organizer = User.objects.get(id=organizer_id)
        events = Event.objects(organizer_id=organizer)
        events_list = []
        for event in events:
            events_list.append({
                "id": str(event.id),
                "title": event.title,
                "description": event.description,
                "category": event.category,
                "venue": event.venue,
                "venue_id": str(event.venue_id.id),
                "date": event.date,
                "start_time": event.start_time,
                "end_time": event.end_time,
                "max_participants": event.max_participants,
                "registrations_count": event.registrations_count,
                "status": event.status,
                "gform_link": event.gform_link,
                "gspreadsheet_link": event.gspreadsheet_link,
                "image_url": event.image_url,
                "phone_number": event.phone_number,
                "mail_id": event.mail_id,
            })
        return jsonify(events_list), 200
    except DoesNotExist:
        return jsonify({"error": "Organizer not found"}), 404


# ------------------------
# Create new event
# ------------------------
# ------------------------
# Create new event (robust version)
# ------------------------
@event_bp.route('/', methods=['POST'])
def create_event():
    data = request.get_json()

    # Required fields
    required_fields = ["organizer_id", "title", "venue_id", "date", "start_time", "end_time", "max_participants"]

    # Check if any required field is missing or empty
    missing_fields = [field for field in required_fields if field not in data or not data[field]]
    if missing_fields:
        return jsonify({
            "success": False,
            "error": f"Missing required fields: {', '.join(missing_fields)}"
        }), 400

    try:
        # Fetch organizer and venue
        organizer = User.objects.get(id=data['organizer_id'])
        venue = Venue.objects.get(id=data['venue_id'])

        # Convert max_participants to int safely
        try:
            max_participants = int(data['max_participants'])
        except ValueError:
            return jsonify({"success": False, "error": "max_participants must be a number"}), 400

        # Create event
        event = Event(
            organizer_id=organizer,
            title=data['title'],
            description=data.get('description', ''),
            category=data.get('category', ''),
            venue_id=venue,
            venue=venue.venue_name,  # string display
            date=data['date'],
            start_time=data['start_time'],
            end_time=data['end_time'],
            max_participants=max_participants,
            status=data.get('status', 'Green'),
            gform_link=data.get('gform_link', ''),
            gspreadsheet_link=data.get('gspreadsheet_link', ''),
            image_url=data.get('image_url', ''),
            phone_number=data.get('phone_number', organizer.reg_no),
            mail_id=data.get('mail_id', organizer.email)
        )

        event.save()
        return jsonify({
            "success": True,
            "message": "Event created successfully",
            "event_id": str(event.id)
        }), 201

    except DoesNotExist:
        return jsonify({"success": False, "error": "Organizer or Venue not found"}), 404
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# PUT /api/events/<event_id>
@event_bp.route('/<event_id>', methods=['PUT'])
def update_event(event_id):
    data = request.get_json()
    try:
        event = Event.objects.get(id=event_id)

        # Update fields if present in request
        event.title = data.get('title', event.title)
        event.description = data.get('description', event.description)
        event.category = data.get('category', event.category)
        event.date = data.get('date', event.date)
        event.start_time = data.get('start_time', event.start_time)
        event.end_time = data.get('end_time', event.end_time)
        event.max_participants = data.get('max_participants', event.max_participants)
        event.status = data.get('status', event.status)
        event.gform_link = data.get('gform_link', event.gform_link)
        event.gspreadsheet_link = data.get('gspreadsheet_link', event.gspreadsheet_link)
        event.image_url = data.get('image_url', event.image_url)
        event.phone_number = data.get('phone_number', event.phone_number)
        event.mail_id = data.get('mail_id', event.mail_id)

        # Update venue if provided
        if data.get('venue_id'):
            venue = Venue.objects.get(id=data['venue_id'])
            event.venue_id = venue
            event.venue = venue.venue_name

        event.updated_at = datetime.utcnow()
        event.save()
        return jsonify({"message": "Event updated successfully"}), 200

    except Event.DoesNotExist:
        return jsonify({"error": "Event not found"}), 404
    except Venue.DoesNotExist:
        return jsonify({"error": "Venue not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# DELETE /api/events/<event_id>
@event_bp.route('/<event_id>', methods=['DELETE'])
def delete_event(event_id):
    try:
        event = Event.objects.get(id=event_id)
        event.delete()
        return jsonify({"message": "Event deleted successfully"}), 200
    except Event.DoesNotExist:
        return jsonify({"error": "Event not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# Get a single event by event ID
@event_bp.route('/<event_id>', methods=['GET'])
def get_event(event_id):
    try:
        event = Event.objects.get(id=event_id)
        event_data = {
            "id": str(event.id),
            "title": event.title,
            "description": event.description,
            "category": event.category,
            "venue": event.venue,
            "venue_id": str(event.venue_id.id),
            "date": event.date,
            "start_time": event.start_time,
            "end_time": event.end_time,
            "max_participants": event.max_participants,
            "registrations_count": event.registrations_count,
            "status": event.status,
            "gform_link": event.gform_link,
            "gspreadsheet_link": event.gspreadsheet_link,
            "image_url": event.image_url,
            "phone_number": event.phone_number,
            "mail_id": event.mail_id,
        }
        return jsonify({"success": True, "event": event_data}), 200
    except DoesNotExist:
        return jsonify({"success": False, "error": "Event not found"}), 404
