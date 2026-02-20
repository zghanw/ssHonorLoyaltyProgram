from app.database import SessionLocal
from app.models import Staff
from app.auth import hash_password

def seed():
    db = SessionLocal()
    try:
        # Admin
        admin = db.query(Staff).filter(Staff.username == "admin").first()
        if admin:
            print("Admin user found. Resetting password...")
            admin.password_hash = hash_password("admin123")
        else:
            print("Creating admin user...")
            admin = Staff(
                username="admin",
                password_hash=hash_password("admin123"),
                role="admin"
            )
            db.add(admin)
        
        # Staff
        staff = db.query(Staff).filter(Staff.username == "staff").first()
        if staff:
            print("Staff user found. Resetting password...")
            staff.password_hash = hash_password("staff123")
        else:
            print("Creating staff user...")
            staff = Staff(
                username="staff",
                password_hash=hash_password("staff123"),
                role="staff"
            )
            db.add(staff)
            
        db.commit()
        print("Credentials updated:")
        print("admin / admin123")
        print("staff / staff123")
            
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed()
