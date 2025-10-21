from flask import Blueprint, request, jsonify
from models import User, Event, EventRegistration, Participant
from mongoengine import DoesNotExist
from datetime import datetime
from bson import ObjectId

student_bp = Blueprint('student_bp', __name__, url_prefix='/api/student')


# ============================================
# Get all registered events for a student
# ============================================
@student_bp.route('/registered-events/<student_id>', methods=['GET'])
def get_registered_events(student_id):
    """
    Get all events that a student has registered for
    """
    try:
        student = User.objects.get(id=student_id)
    except DoesNotExist:
        return jsonify({"success": False, "error": "Student not found"}), 404

    try:
        # ✅ Step 1: Get participant by email
        participant = Participant.objects(email=student.email).first()

        if not participant:
            return jsonify({"success": True, "events": []}), 200

        # ✅ Step 2: Query registrations by ReferenceField
        registrations = EventRegistration.objects(participant_id=participant)
        
        events_list = []
        for reg in registrations:
            event = reg.event_id
            events_list.append({
                "registration_id": str(reg.id),
                "event_id": str(event.id),
                "title": event.title,
                "description": event.description,
                "category": event.category,
                "venue": event.venue,
                "date": event.date,
                "start_time": event.start_time,
                "end_time": event.end_time,
                "max_participants": event.max_participants,
                "registrations_count": event.registrations_count,
                "status": event.status,
                "image_url": event.image_url,
                "phone_number": event.phone_number,
                "mail_id": event.mail_id,
                "registration_status": reg.status,
                "registration_time": reg.registration_time.isoformat()
            })
        
        return jsonify({"success": True, "events": events_list}), 200
    
    except Exception as e:
        print(e)
        return jsonify({"success": False, "error": str(e)}), 500

    
    # ============================================
# Get all events (for students to browse)
# ============================================
@student_bp.route('/all-events', methods=['GET'])
def get_all_events():
    """
    Get all available events for students to view and register
    """
    try:
        events = Event.objects()
        
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
                "image_url": event.image_url,
                "phone_number": event.phone_number,
                "mail_id": event.mail_id,
                "created_at": event.created_at.isoformat()
            })
        
        return jsonify({"success": True, "events": events_list}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ============================================
# Update student profile (add phone_number field)
# ============================================
@student_bp.route('/profile/<user_id>', methods=['PUT'])
def update_student_profile(user_id):
    """
    Update student profile information
    """
    data = request.get_json()
    
    try:
        user = User.objects.get(id=user_id)
    except DoesNotExist:
        return jsonify({"success": False, "message": "User not found"}), 404

    try:
        # Update allowed fields
        if "name" in data:
            user.name = data["name"]
        if "phone_number" in data:
            user.phone_number = data["phone_number"]
        if "department" in data:
            user.department = data["department"]
        if "year" in data:
            # Convert year string to int if needed
            year_str = data["year"]
            if isinstance(year_str, str):
                year_map = {
                    "1st year": 1, "2nd year": 2,
                    "3rd year": 3, "4th year": 4
                }
                user.year = year_map.get(year_str, user.year)
            else:
                user.year = year_str
        
        user.save()
        
        return jsonify({"success": True, "message": "Profile updated successfully"}), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500