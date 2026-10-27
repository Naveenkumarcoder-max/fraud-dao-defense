
import os
import sqlite3
from datetime import datetime, timezone
from pathlib import Path

from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

DATABASE_PATH = BASE_DIR / "fraudshield.db"

app = Flask(__name__)

# Permit requests from the local frontend development servers.
CORS(
    app,
    resources={
        r"/api/*": {
            "origins": [
                "http://127.0.0.1:5500",
                "http://localhost:5500",
                "http://127.0.0.1:5501",
                "http://localhost:5501",
                "http://127.0.0.1:5000",
                "http://localhost:5000",
            ]
        }
    },
)


def get_db():
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def initialize_database():
    with get_db() as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS transactions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                transaction_id TEXT NOT NULL UNIQUE,
                amount REAL NOT NULL,
                transaction_type TEXT NOT NULL,
                failed_attempts INTEGER NOT NULL,
                device TEXT NOT NULL,
                location TEXT NOT NULL,
                risk_score INTEGER NOT NULL,
                risk_level TEXT NOT NULL,
                decision TEXT NOT NULL,
                reasons TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
            """
        )


def assess_transaction(data):
    score = 0
    reasons = []

    amount = float(data["amount"])
    failed_attempts = int(data["failed_attempts"])
    device = data["device"]
    location = data["location"]

    if amount >= 50000:
        score += 25
        reasons.append("High transaction amount.")
    elif amount >= 20000:
        score += 12
        reasons.append("Elevated transaction amount.")

    if failed_attempts >= 5:
        score += 30
        reasons.append("Multiple failed attempts.")
    elif failed_attempts >= 3:
        score += 18
        reasons.append("Several failed attempts.")

    if device == "new":
        score += 20
        reasons.append("Transaction uses a new device.")

    if location == "unusual":
        score += 25
        reasons.append("Transaction uses an unusual location.")

    score = min(score, 100)

    if score >= 60:
        level = "High"
        decision = "Review required"
    elif score >= 30:
        level = "Medium"
        decision = "Additional verification suggested"
    else:
        level = "Low"
        decision = "Low risk under demo rules"

    if not reasons:
        reasons.append("No configured risk indicators were triggered.")

    return score, level, decision, reasons


@app.get("/api/health")
def health():
    return jsonify({
        "status": "ok",
        "message": "Backend connected",
        "database": "SQLite",
    })


@app.post("/api/analyze")
def analyze():
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({"error": "A JSON request body is required."}), 400

    transaction_id = str(data.get("transaction_id", "")).strip()
    transaction_type = data.get("transaction_type")
    device = data.get("device")
    location = data.get("location")

    if not transaction_id:
        return jsonify({"error": "Transaction ID is required."}), 400

    if len(transaction_id) > 80:
        return jsonify({"error": "Transaction ID must be 80 characters or fewer."}), 400

    if transaction_type not in {"UPI", "Card", "Bank Transfer", "Wallet"}:
        return jsonify({"error": "Invalid transaction type."}), 400

    if device not in {"known", "new"}:
        return jsonify({"error": "Device must be known or new."}), 400

    if location not in {"usual", "unusual"}:
        return jsonify({"error": "Location must be usual or unusual."}), 400

    try:
        amount = float(data.get("amount"))
        failed_attempts = int(data.get("failed_attempts"))
    except (TypeError, ValueError, OverflowError):
        return jsonify({
            "error": "Amount and failed attempts must be valid numbers."
        }), 400

    if not (0 < amount <= 1_000_000_000):
        return jsonify({"error": "Amount must be greater than zero and within the allowed limit."}), 400

    if not (0 <= failed_attempts <= 100):
        return jsonify({"error": "Failed attempts must be between 0 and 100."}), 400

    score, level, decision, reasons = assess_transaction({
        "amount": amount,
        "failed_attempts": failed_attempts,
        "device": device,
        "location": location,
    })

    created_at = datetime.now(timezone.utc).isoformat(timespec="seconds")

    try:
        with get_db() as connection:
            connection.execute(
                """
                INSERT INTO transactions (
                    transaction_id, amount, transaction_type,
                    failed_attempts, device, location,
                    risk_score, risk_level, decision, reasons, created_at
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    transaction_id,
                    amount,
                    transaction_type,
                    failed_attempts,
                    device,
                    location,
                    score,
                    level,
                    decision,
                    " ".join(reasons),
                    created_at,
                ),
            )
    except sqlite3.IntegrityError:
        return jsonify({
            "error": "This transaction ID already exists. Please use a unique ID."
        }), 409

    return jsonify({
        "transaction_id": transaction_id,
        "amount": amount,
        "transaction_type": transaction_type,
        "risk_score": score,
        "risk_level": level,
        "decision": decision,
        "reasons": reasons,
        "created_at": created_at,
    }), 201


@app.get("/api/transactions")
def transactions():
    with get_db() as connection:
        rows = connection.execute(
            """
            SELECT transaction_id, amount, transaction_type,
                   risk_score, risk_level, decision, created_at
            FROM transactions
            ORDER BY id DESC
            LIMIT 100
            """
        ).fetchall()

    return jsonify({
        "transactions": [dict(row) for row in rows]
    })


initialize_database()

if __name__ == "__main__":
    debug = os.getenv("FLASK_DEBUG", "false").lower() == "true"
    app.run(host="127.0.0.1", port=5000, debug=debug)
