
# FraudShield — Fraud Detection & DAO Identity Defense

An educational full-stack demo featuring a colorful HTML/CSS/JavaScript dashboard, Flask REST API, and SQLite transaction history.

## Project structure

- `frontend/` — HTML, CSS, and JavaScript
- `backend/` — Flask API and SQLite database
- `.gitignore` — excludes local secrets and generated files

## Requirements

- Python 3.10+
- VS Code
- A browser
- Live Server extension (recommended)

## Run the backend

From the project root in PowerShell:

```powershell
py -m venv backend\.venv
backend\.venv\Scripts\python.exe -m pip install -r backend\requirements.txt
backend\.venv\Scripts\python.exe backend\app.py
```

The API runs at `http://127.0.0.1:5000`.

## Run the frontend

Open `frontend/index.html` with VS Code Live Server.

The frontend and backend must both be running.

## API endpoints

- `GET /api/health` — backend status
- `POST /api/analyze` — assess and save a transaction
- `GET /api/transactions` — retrieve recent transactions

## Important

The risk scoring is illustrative and not a validated fraud detection system. Do not use it to approve, decline, or block real financial transactions. This demo does not perform real identity verification.
