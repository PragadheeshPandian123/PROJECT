from flask import Blueprint, request, jsonify
from flask_cors import cross_origin
from models import Venue
from mongoengine.errors import NotUniqueError, ValidationError

venue_bp = Blueprint("venue_bp", __name__, url_prefix="/api/venues")

# Get all venues (read-only)
@venue_bp.route("/", methods=["GET"])
@cross_origin()  # allow CORS for this route
def get_all_venues():
    venues = Venue.objects()
    result = []
    for v in venues:
        result.append({
            "id": str(v.id),
            "venue_name": v.venue_name,
            "venue_description": v.venue_description,
            "image_url": v.image_url,
            "phone_number": v.phone_number,
            "mail_id": v.mail_id,
        })
    return jsonify({"success": True, "venues": result})

# Add new venue (admin only)
@venue_bp.route("/", methods=["POST", "OPTIONS"])
@cross_origin()
def add_venue():
    # Handle preflight
    if request.method == "OPTIONS":
        return jsonify({"message": "CORS preflight OK"}), 200

    try:
        data = request.json
        venue = Venue(
            venue_name=data.get("venue_name"),
            venue_description=data.get("venue_description"),
            image_url=data.get("image_url"),
            phone_number=data.get("phone_number"),
            mail_id=data.get("mail_id"),
        )
        venue.save()
        return jsonify({"success": True, "message": "Venue added successfully"}), 201

    except NotUniqueError:
        return jsonify({"success": False, "message": "Venue name already exists"}), 400
    except ValidationError as e:
        return jsonify({"success": False, "message": str(e)}), 400
    except Exception as e:
        return jsonify({"success": False, "message": f"Error: {str(e)}"}), 500
