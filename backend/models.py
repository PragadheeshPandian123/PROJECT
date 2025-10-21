from mongoengine import (
    Document,
    StringField,
    EmailField,
    IntField,
    DateTimeField,
    ReferenceField,
    URLField,
    ObjectIdField,
    DictField
)
from datetime import datetime


# ✅ USERS COLLECTION
class User(Document):
    reg_no = StringField(required=True, unique=True)
    name = StringField(required=True)
    email = EmailField(required=True, unique=True)
    password = StringField(required=True)
    role = StringField(required=True)  # admin, organizer, student etc.
    department = StringField(required=True)
    year = IntField(required=True)
    phone_number = StringField()
    created_at = DateTimeField(default=datetime.utcnow)

    meta = {
        'collection': 'users'
    }


# ✅ VENUE COLLECTION
class Venue(Document):
    venue_name = StringField(required=True, unique=True)
    venue_description = StringField()
    image_url = URLField()
    phone_number = StringField()
    mail_id = EmailField()
    
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)

    meta = {
        'collection': 'venues'
    }


# ✅ EVENTS COLLECTION
class Event(Document):
    organizer_id = ReferenceField(User, required=True)  # FK to User
    title = StringField(required=True)
    description = StringField()
    category = StringField()

    venue_id = ReferenceField(Venue, required=True)
    venue = StringField(required=True)  # For dropdown selection display

    date = StringField(required=True)  # You can also use DateTimeField
    start_time = StringField(required=True)
    end_time = StringField(required=True)

    max_participants = IntField(required=True)
    registrations_count = IntField(default=0)

    status = StringField(choices=('Green', 'Yellow', 'Red'))

    image_url = URLField()

    phone_number = StringField()
    mail_id = EmailField()

    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)

    meta = {
        'collection': 'events'
    }


class Participant(Document):
    name = StringField(required=True)
    email = StringField(required=True, unique=True)
    phone = StringField()
    reg_no = StringField()
    department = StringField()
    year = StringField()  # string or int; keep string for safety
    created_at = DateTimeField(default=datetime.utcnow)

    meta = {"collection": "participants"}

class EventRegistration(Document):
    event_id = ReferenceField('Event', required=True)
    participant_id = ReferenceField(Participant, required=True)
    registration_time = DateTimeField(default=datetime.utcnow)
    status = StringField(default="Registered", choices=("Registered","Attended","Cancelled","Waitlisted"))
    team_name = StringField()
    additional_info = DictField()  # shirt size, comments etc.

    meta = {"collection": "event_registrations"}