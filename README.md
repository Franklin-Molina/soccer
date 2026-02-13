# 🏟️ Cancha App - Sports Court Booking System

A full-stack application for managing and booking sports courts. It features a Django REST Framework backend, a React (Vite) frontend, and a PostgreSQL database.

## 🛠️ Tech Stack

*   **Backend:** Python 3.11, Django 5, DRF, SimpleJWT.
*   **Frontend:** React, TypeScript, Vite, TailwindCSS.
*   **Database:** PostgreSQL 15.
*   **Infrastructure:** Docker & Docker Compose.

---

## ⚙️ Configuration (Required)

Before running the project (Docker or Manual), you must configure the environment variables.

1.  **Backend Configuration:**
    Navigate to the `backend/` folder, copy the example file, and fill in your details:
    ```bash
    cd backend
    cp .env.example .env
    # Edit .env and set your Google Keys and DB_PASSWORD
    ```

2.  **Frontend Configuration:**
    Navigate to the `frontend/` folder, copy the example file, and fill in your details:
    ```bash
    cd frontend
    cp .env.example .env
    # Edit .env and ensure VITE_API_URL points to your backend
    ```

---

## 🐳 Option 1: Running with Docker (Recommended)

This is the easiest way. It sets up the Database, Backend, and Frontend automatically.

### 1. Build and Start
Run the following command in the **root** directory:
```bash
docker compose up --build
```
> *Note: Database migrations run automatically when the container starts.*

### 2. Create an Admin User
Once the containers are running, open a new terminal and run:
```bash
docker compose exec backend python manage.py createsuperuser
```

### 3. Access the App
*   **Frontend:** [http://localhost:3000](http://localhost:3000)
*   **Backend API:** [http://localhost:8000/api/](http://localhost:8000/api/)
*   **Admin Panel:** [http://localhost:8000/admin/](http://localhost:8000/admin/)

> *Note: If you want stop the container run: `docker compose down`.*
---

## 💻 Option 2: Manual Local Setup

Use this method for debugging or if you want to run services individually without Docker.

### Prerequisites
*   Local PostgreSQL database running.
*   Python 3.11+ installed.
*   Node.js installed.

### 1. Database Setup
Ensure you have a local PostgreSQL database named `cancha`.

### 2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# IMPORTANT: Override the DB host to localhost for this session
export DB_HOST=localhost  # Windows PowerShell: $env:DB_HOST="localhost"

# Run Migrations and Start
python manage.py migrate
python manage.py runserver
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## ❓ FAQ & Troubleshooting

### Why can't I connect to the database in Manual Mode?
In `backend/.env`, the `DB_HOST` is set to `db` (for Docker). When running manually, your computer doesn't know what "db" is.
**Fix:** Run `export DB_HOST=localhost` in your terminal before running `python manage.py runserver`, or temporarily change the `.env` file.

### How do I connect DBeaver to the Docker Database?
*   **Host:** `localhost`
*   **Port:** `5432`
*   **Database:** `cancha`
*   **User/Pass:** (The values inside `backend/.env`)

### How to apply changes?
*   **Code Changes:** Just save the file. Both Backend and Frontend support hot-reloading.
*   **New Libraries:** If you modify `requirements.txt` or `package.json`, you must run `docker compose up --build`.

---

## 📁 Project Structure

```text
/
├── docker-compose.yml
├── backend/
│   ├── .env              <-- Create this!
│   ├── .env.example
│   ├── Dockerfile
│   └── manage.py
└── frontend/
    ├── .env              <-- Create this!
    ├── .env.example
    ├── Dockerfile
    └── vite.config.ts
```
