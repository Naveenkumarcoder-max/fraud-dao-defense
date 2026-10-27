
import os
import sqlite3
from datetime import datetime, timezone
from pathlib import Path

from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

app = Flask(__name__)

# Local development only. Restrict origins before deployment.
CORS(app, resources={
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
})

DATABASE = BASE_DIR / "fraudshield.db"


def get_db():
    connection = sqlite3.connect(DATABASE)
    connection.row_factory = sqlite3.Row
    return connection


def initialize_database():
    with get_db() as db:
        db.execute("""
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
                recommendation TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
        """)


def assess_risk(data):
    """Illustrative rules for development, not a validated fraud model."""
    amount = data["amount"]
    failed_attempts = data["failed_attempts"]
    device = data["device"]
    location = data["location"]

    score = 5
    reasons = []

    if amount >= 100000:
        score += 35
        reasons.append("High transaction amount.")
    elif amount >= 50000:
        score += 20
        reasons.append("Elevated transaction amount.")
    elif amount >= 20000:
        score += 10
        reasons.append("Transaction exceeds the demo amount threshold.")

    if device == "new":
        score += 20
        reasons.append("New device reported.")

    if location == "unusual":
        score += 25
        reasons.append("Unusual location reported.")

    if failed_attempts >= 5:
        score += 25
        reasons.append("Five or more failed attempts.")
    elif failed_attempts >= 3:
        score += 15
        reasons.append("Multiple failed attempts.")
    elif failed_attempts > 0:
        score += 5
        reasons.append("Failed attempt reported.")

    score = min(score, 100)

    if score >= 70:
        level = "high"
        recommendation = "Flag for investigation and additional verification."
    elif score >= 35:
        level = "medium"
        recommendation = "Request additional verification or analyst review."
    else:
        level = "low"
        recommendation = "Continue standard checks; no major demo signals detected."

    if not reasons:
        reasons.append("No elevated signals detected by the demo rules.")

    return {
        "risk_score": score,
        "risk_level": level,
        "reasons": reasons,
        "recommendation": recommendation,
    }


@app.get("/api/health")
def health():
    return jsonify({
        "status": "ok",
        "service": "FraudShield API",
        "database": "SQLite",
        "mode": "development demo",
    })


@app.post("/api/analyze")
def analyze_transaction():
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({"error": "A JSON request body is required."}), 400

    transaction_id = data.get("transaction_id")
    transaction_type = data.get("transaction_type", "UPI")
    device = data.get("device", "known")
    location = data.get("location", "usual")
    amount = data.get("amount")
    failed_attempts = data.get("failed_attempts", 0)

    if not isinstance(transaction_id, str) or not transaction_id.strip():
        return jsonify({"error": "transaction_id is required."}), 400

    transaction_id = transaction_id.strip()

    if len(transaction_id) > 64:
        return jsonify({"error": "transaction_id must be 64 characters or fewer."}), 400

    if isinstance(amount, bool) or not isinstance(amount, (int, float)):
        return jsonify({"error": "amount must be a number."}), 400

    if amount <= 0 or amount > 1_000_000_000:
        return jsonify({"error": "amount is outside the allowed demo range."}), 400

    if isinstance(failed_attempts, bool) or not isinstance(failed_attempts, int):
        return jsonify({"error": "failed_attempts must be an integer."}), 400

    if not 0 <= failed_attempts <= 100:
        return jsonify({"error": "failed_attempts must be between 0 and 100."}), 400

    if device not in ("known", "new"):
        return jsonify({"error": "device must be 'known' or 'new'."}), 400

    if location not in ("usual", "unusual"):
        return jsonify({"error": "location must be 'usual' or 'unusual'."}), 400

    if transaction_type not in ("UPI", "Card", "Bank Transfer", "Wallet"):
        return jsonify({"error": "Unsupported transaction_type."}), 400

    result = assess_risk({
        "amount": amount,
        "failed_attempts": failed_attempts,
        "device": device,
        "location": location,
    })

    created_at = datetime.now(timezone.utc).isoformat()

    try:
        with get_db() as db:
            db.execute("""
                INSERT INTO transactions (
                    transaction_id, amount, transaction_type,
                    failed_attempts, device, location,
                    risk_score, risk_level, recommendation, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                transaction_id,
                amount,
                transaction_type,
                failed_attempts,
                device,
                location,
                result["risk_score"],
                result["risk_level"],
                result["recommendation"],
                created_at,
            ))
    except sqlite3.IntegrityError:
        return jsonify({
            "error": "This transaction ID already exists in the demo database."
        }), 409
    except sqlite3.Error:
        app.logger.exception("Database operation failed")
        return jsonify({"error": "Unable to save the analysis."}), 500

    return jsonify({
        "transaction_id": transaction_id,
        **result,
        "created_at": created_at,
        "disclaimer": (
            "Illustrative rule-based result, not a validated fraud prediction."
        ),
    }), 201


@app.get("/api/transactions")
def list_transactions():
    try:
        with get_db() as db:
            rows = db.execute("""
                SELECT transaction_id, amount, transaction_type,
                       risk_score, risk_level, recommendation, created_at
                FROM transactions
                ORDER BY id DESC
                LIMIT 100
            """).fetchall()

        return jsonify({
            "transactions": [dict(row) for row in rows],
            "count": len(rows),
        })
    except sqlite3.Error:
        app.logger.exception("Unable to read transactions")
        return jsonify({"error": "Unable to retrieve transactions."}), 500


initialize_database()

if __name__ == "__main__":
    debug = os.getenv("FLASK_DEBUG", "false").lower() == "true"
    app.run(host="127.0.0.1", port=5000, debug=debug)
