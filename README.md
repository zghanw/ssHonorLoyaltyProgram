# HONOR Loyalty Management System

A comprehensive internal web application for managing customer loyalty, points, and gift redemptions. Built for staff to easily track customer activities and manage the rewards catalog.

## 🚀 Features

-   **Dashboard Overview**: Real-time statistics on total customers, points distributed, redemptions, and active gifts.
-   **Customer Management**: Add new customers, view points balance, and track transaction history.
-   **Gift Catalog**: Manage redeemable items (add, edit, delete) with stock tracking.
    -   *Note: Gifts with linked redemptions cannot be deleted to preserve data integrity.*
-   **Redemption System**: Process gift redemptions for customers using their accumulated points.
-   **Secure Authentication**: Role-based access control (Admin/Staff) using JWT authentication.

## 🛠️ Tech Stack

### Frontend
-   **React** (Vite)
-   **Tailwind CSS** (Styling)
-   **Lucide React** (Icons)
-   **React Router DOM** (Navigation)
-   **React Hot Toast** (Notifications)

### Backend
-   **FastAPI** (Python Web Framework)
-   **SQLAlchemy** (ORM)
-   **PostgreSQL** (Database)
-   **Pydantic** (Data Validation)
-   **Passlib & Bcrypt** (Security/Hashing)

## 📋 Prerequisites

Ensure you have the following installed:
-   **Node.js** (v18+)
-   **Python** (v3.10+)
-   **PostgreSQL** database running locally or remotely

## ⚙️ Installation & Setup

### 1. Database Setup
Ensure you have a PostgreSQL database created (e.g., `loyalty_db`).

### 2. Backend Setup
Navigate to the `backend` directory:
```bash
cd backend
```

Create and activate a virtual environment:
```bash
# Windows
python -m venv venv
.\venv\Scripts\Activate.ps1

# Mac/Linux
python3 -m venv venv
source venv/bin/activate
```

Install dependencies:
```bash
pip install -r requirements.txt
```

Create a `.env` file in the `backend` directory with your database connection string and secret key:
```env
DATABASE_URL=postgresql://user:password@localhost/loyalty_db
SECRET_KEY=your_super_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=480
```

Run the seed script to create default users:
```bash
python seed.py
```

Start the backend server:
```bash
python -m uvicorn app.main:app --reload
```
*The API will be available at `http://127.0.0.1:8000`*

### 3. Frontend Setup
Open a new terminal and navigate to the project root (where `package.json` is located):
```bash
cd loyaltyprogram
```

Install dependencies:
```bash
npm install
```

Start the development server:
```bash
npm run dev
```
*The application will run at `http://localhost:3000`*

## 🔐 Default Credentials

Use the following credentials to log in:

| Role  | Username | Password   |
| :---- | :------- | :--------- |
| Admin | `admin`  | `admin123` |
| Staff | `staff`  | `staff123` |

## 🧪 Testing

-   **Manual Testing**: Log in with the default credentials to explore the dashboard, add customers, and manage gifts.
-   **API Documentation**: Visit `http://127.0.0.1:8000/docs` to view the interactive Swagger UI for the backend API.
