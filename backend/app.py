from flask import Flask, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS
from datetime import datetime
from bson import ObjectId
from models import User, Venue, Event
from mongoengine import connect
from routes.event_routes import event_bp
from routes.venue_routes import venue_bp
from routes.registration_routes import reg_bp
app = Flask(__name__)

CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}}, supports_credentials=True)
# Connect to MongoDB

connect(
    db="college_event",
    host="mongodb://localhost:27017/college_event"
)
app.register_blueprint(event_bp)
app.register_blueprint(venue_bp)
app.register_blueprint(reg_bp)
def convert_year_to_int(year):
    if year=='1st year':
        return 1
    elif year=='2nd year':
        return 2
    elif year=='3rd year':
        return 3
    elif year=='4th year':
        return 4

def convert_int_to_year(year):
    if year==1:
        return "1st year"
    elif year==2:
        return "2nd year"
    elif year==3:
        return "3rd year"
    elif year==4:
        return "4th year"
# -------------------------
# Sign Up API
# -------------------------
@app.route("/api/signup", methods=["POST"])
def signup():
    data = request.json
    reg_no=data.get("reg_no")
    name=data.get("name")
    email = data.get("email")
    password = data.get("password")
    role = data.get("role")  # 'admin', 'organizer', 'student'
    department=data.get("department")
    year=convert_year_to_int(data.get("year"))

    if not reg_no or not name or not email or not password or not role or not department or not year:
        return jsonify({"success": False, "message": "All fields are required"})

    # Check if user already exists
    if User.objects(email=email).first() or User.objects(reg_no=reg_no).first():

        return jsonify({"success": False, "message": "User already exists"})
    # Hash the password
    hashed_password = generate_password_hash(password)

    # Insert new user

    user = User(
    reg_no=reg_no,
    name=name,
    email=email,
    password=hashed_password,
    role=role,
    department=department,
    year=year
    )
    user.save()

    print(user.to_json())
    return jsonify({"success": True, "message": "User registered successfully"})


# -------------------------
# Sign In API
# -------------------------
@app.route("/api/login", methods=["POST"])
def login():
    data = request.json
    reg_no=data.get("reg_no")
    email = data.get("email")
    password = data.get("password")

    user = User.objects(email=email).first()
    if not user:
        print("User not found")
        return jsonify({"success": False, "message": "User not found"})

    if check_password_hash(user.password , password):
        print(f"User Signed In \n Email: {user.email}")
        return jsonify({"success": True, "role": user.role , "user_id":str(user.id) , "name":user.name})
    else:
        print(f"User Found but Invalid Password \n Email: {user}")
        return jsonify({"success": False, "message": "Invalid password"})
    

#---------------------------
# Show all users to admin
#----------------------------
# GET all users
@app.route("/api/users", methods=["GET"])
def get_users():
    users = User.objects().exclude('password')  # exclude passwords
    users_data = []
    for user in users:
        users_data.append({
            "_id": str(user.id),
            "reg_no": user.reg_no,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "department": user.department,
            "year": convert_int_to_year(user.year),
            "created_at": user.created_at.strftime("%Y-%m-%d %H:%M:%S")
        })
    return jsonify(users_data)

# POST: Add new user
@app.route("/api/users", methods=["POST"])
def add_user():
    data = request.json
    reg_no = data.get("reg_no")
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    role = data.get("role")
    department = data.get("department")
    year = convert_year_to_int(data.get("year"))

    if not reg_no or not name or not email or not password or not role or not department or not year:
        return jsonify({"success": False, "message": "All fields are required"})

    if User.objects(email=email).first() or User.objects(reg_no=reg_no).first():
        return jsonify({"success": False, "message": "User already exists"})

    user = User(
        reg_no=reg_no,
        name=name,
        email=email,
        password=generate_password_hash(password),
        role=role,
        department=department,
        year=year
    )
    user.save()
    return jsonify({"success": True, "message": "User added successfully"})

# PUT: Edit user (with optional trailing slash)
@app.route("/api/users/<user_id>", methods=["PUT"])
@app.route("/api/users/<user_id>/", methods=["PUT"])
def edit_user(user_id):
    data = request.json
    update_data = {
        "reg_no": data.get("reg_no"),
        "name": data.get("name"),
        "email": data.get("email"),
        "role": data.get("role"),
        "department": data.get("department"),
        "year": convert_year_to_int(data.get("year"))
    }

    if data.get("password"):
        update_data["password"] = generate_password_hash(data["password"])

    try:
        user = User.objects.get(id=ObjectId(user_id))
    except Exception:
        return jsonify({"success": False, "message": "User not found"})

    for key, value in update_data.items():
        if value is not None:
            setattr(user, key, value)

    user.save()
    return jsonify({"success": True, "message": "User updated successfully"})

# DELETE: Delete user (with optional trailing slash)
@app.route("/api/users/<user_id>", methods=["DELETE"])
@app.route("/api/users/<user_id>/", methods=["DELETE"])
def delete_user(user_id):
    try:
        user = User.objects.get(id=ObjectId(user_id))
    except Exception:
        return jsonify({"success": False, "message": "User not found"})

    user.delete()
    return jsonify({"success": True, "message": "User deleted successfully"})

# GET single user
@app.route("/api/users/<user_id>", methods=["GET"])
@app.route("/api/users/<user_id>/", methods=["GET"])
def get_user(user_id):
    try:
        user = User.objects.get(id=ObjectId(user_id))
    except Exception:
        return jsonify({"success": False, "message": "User not found"}), 404

    user_data = {
        "_id": str(user.id),
        "reg_no": user.reg_no,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "department": user.department,
        "year": convert_int_to_year(user.year),
        "created_at": user.created_at.strftime("%Y-%m-%d %H:%M:%S")
    }
    return jsonify(user_data)


# -------------------------
# Run the server
# -------------------------
if __name__ == "__main__":
    try:
        app.run(host="localhost", port=5000, debug=True)
    except KeyboardInterrupt:
        print("\nServer stopped by user")

