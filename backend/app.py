
import csv
import io
import json
import os
import sqlite3
from datetime import datetime, timezone
from pathlib import Path

from flask import Flask, jsonify, request, Response
from flask_cors import CORS

app = Flask(__name__)

CORS(
    app,
    origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500",
        "http://127.0.0.1:5501",
        "http://localhost:5501",
        "http://127.0.0.1:5000",
        "http://localhost:5000",
    ],
)

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "fraudshield.db"

VALID_TYPES = {"UPI", "Card", "Bank Transfer", "Wallet"}
VALID_DEVICES = {"known", "new"}
VALID_LOCATIONS = {"usual", "unusual"}
VALID_RISK_LEVELS = {"Low", "Medium", "High"}
VALID_DECISIONS = {"Approved", "Review", "Blocked"}


def connect_db():
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def initialize_db():
    """Create the table and add new columns to an existing database."""
    with connect_db() as db:
        db.execute("""
            CREATE TABLE IF NOT EXISTS transactions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                transaction_id TEXT UNIQUE NOT NULL,
                amount REAL NOT NULL,
                transaction_type TEXT NOT NULL,
                failed_attempts INTEGER NOT NULL DEFAULT 0,
                device TEXT NOT NULL DEFAULT 'known',
                location TEXT NOT NULL DEFAULT 'usual',
                risk_score INTEGER NOT NULL DEFAULT 0,
                risk_level TEXT NOT NULL DEFAULT 'Low',
                decision TEXT NOT NULL DEFAULT 'Approved',
                reasons TEXT NOT NULL DEFAULT '[]',
                review_status TEXT NOT NULL DEFAULT 'New',
                review_note TEXT NOT NULL DEFAULT '',
                reviewed_at TEXT,
                created_at TEXT NOT NULL
            )
        """)

        # Safe, additive migration for databases created by earlier versions.
        columns = {
            row["name"]
            for row in db.execute("PRAGMA table_info(transactions)").fetchall()
        }

        migrations = {
            "failed_attempts": "INTEGER NOT NULL DEFAULT 0",
            "device": "TEXT NOT NULL DEFAULT 'known'",
            "location": "TEXT NOT NULL DEFAULT 'usual'",
            "risk_score": "INTEGER NOT NULL DEFAULT 0",
            "risk_level": "TEXT NOT NULL DEFAULT 'Low'",
            "decision": "TEXT NOT NULL DEFAULT 'Approved'",
            "reasons": "TEXT NOT NULL DEFAULT '[]'",
            "review_status": "TEXT NOT NULL DEFAULT 'New'",
            "review_note": "TEXT NOT NULL DEFAULT ''",
            "reviewed_at": "TEXT",
        }

        for column, definition in migrations.items():
            if column not in columns:
                db.execute(
                    f"ALTER TABLE transactions ADD COLUMN {column} {definition}"
                )


def transaction_to_dict(row):
    result = dict(row)
    try:
        result["reasons"] = json.loads(result.get("reasons") or "[]")
    except (TypeError, json.JSONDecodeError):
        result["reasons"] = []
    return result


def error(message, status=400):
    return jsonify({"error": message}), status


def calculate_risk(data):
    """Illustrative rules only; not a trained or validated fraud model."""
    score = 0
    reasons = []

    amount = float(data["amount"])
    failed_attempts = int(data["failed_attempts"])
    device = data["device"]
    location = data["location"]

    if amount >= 100000:
        score += 35
        reasons.append("Very high transaction amount")
    elif amount >= 50000:
        score += 25
        reasons.append("High transaction amount")
    elif amount >= 20000:
        score += 10
        reasons.append("Elevated transaction amount")

    if failed_attempts >= 5:
        score += 30
        reasons.append("Multiple failed attempts")
    elif failed_attempts >= 3:
        score += 20
        reasons.append("Several failed attempts")
    elif failed_attempts >= 1:
        score += 5
        reasons.append("At least one failed attempt")

    if device == "new":
        score += 15
        reasons.append("Unrecognized device")

    if location == "unusual":
        score += 20
        reasons.append("Unusual transaction location")

    score = min(score, 100)

    if score >= 60:
        risk_level = "High"
        decision = "Blocked"
    elif score >= 30:
        risk_level = "Medium"
        decision = "Review"
    else:
        risk_level = "Low"
        decision = "Approved"

    if not reasons:
        reasons.append("No configured risk indicators were triggered")

    return score, risk_level, decision, reasons


@app.get("/")
def index():
    return jsonify({
        "name": "FraudShield API",
        "status": "running",
        "health_endpoint": "/api/health",
    })


@app.get("/api/health")
def health():
    try:
        with connect_db() as db:
            db.execute("SELECT 1")
        return jsonify({
            "status": "healthy",
            "service": "FraudShield API",
            "database": "connected",
        })
    except sqlite3.Error:
        app.logger.exception("Database health check failed")
        return jsonify({
            "status": "unhealthy",
            "database": "unavailable",
        }), 503


@app.post("/api/analyze")
def analyze_transaction():
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return error("Send a valid JSON object.")

    transaction_id = str(data.get("transaction_id", "")).strip()
    if not transaction_id or len(transaction_id) > 100:
        return error("transaction_id is required and must be at most 100 characters.")

    try:
        amount = float(data.get("amount"))
        failed_attempts = int(data.get("failed_attempts", 0))
    except (TypeError, ValueError, OverflowError):
        return error("amount must be numeric and failed_attempts must be an integer.")

    if not (0 < amount <= 1_000_000_000):
        return error("amount must be greater than 0 and at most 1,000,000,000.")

    if failed_attempts < 0 or failed_attempts > 1000:
        return error("failed_attempts must be between 0 and 1000.")

    transaction_type = str(data.get("transaction_type", "")).strip()
    device = str(data.get("device", "known")).strip().lower()
    location = str(data.get("location", "usual")).strip().lower()

    if transaction_type not in VALID_TYPES:
        return error("transaction_type must be UPI, Card, Bank Transfer, or Wallet.")

    if device not in VALID_DEVICES:
        return error("device must be 'known' or 'new'.")

    if location not in VALID_LOCATIONS:
        return error("location must be 'usual' or 'unusual'.")

    score, risk_level, decision, reasons = calculate_risk({
        "amount": amount,
        "failed_attempts": failed_attempts,
        "device": device,
        "location": location,
    })

    created_at = datetime.now(timezone.utc).isoformat()

    try:
        with connect_db() as db:
            db.execute("""
                INSERT INTO transactions (
                    transaction_id, amount, transaction_type,
                    failed_attempts, device, location, risk_score,
                    risk_level, decision, reasons, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                transaction_id, amount, transaction_type,
                failed_attempts, device, location, score,
                risk_level, decision, json.dumps(reasons), created_at,
            ))
    except sqlite3.IntegrityError:
        return error("This transaction_id already exists.", 409)
    except sqlite3.Error:
        app.logger.exception("Failed to save transaction")
        return error("Could not save the transaction.", 500)

    return jsonify({
        "transaction_id": transaction_id,
        "amount": amount,
        "transaction_type": transaction_type,
        "risk_score": score,
        "risk_level": risk_level,
        "decision": decision,
        "reasons": reasons,
        "created_at": created_at,
        "review_status": "New",
    }), 201


@app.get("/api/transactions")
def get_transactions():
    """Return the latest records; optional filters and pagination are supported."""
    conditions = []
    values = []

    search = request.args.get("q", "").strip()
    risk_level = request.args.get("risk_level", "").strip().title()
    decision = request.args.get("decision", "").strip().title()
    transaction_type = request.args.get("transaction_type", "").strip()

    if search:
        conditions.append("transaction_id LIKE ?")
        values.append(f"%{search}%")

    if risk_level:
        if risk_level not in VALID_RISK_LEVELS:
            return error("Invalid risk_level.")
        conditions.append("risk_level = ?")
        values.append(risk_level)

    if decision:
        if decision not in VALID_DECISIONS:
            return error("Invalid decision.")
        conditions.append("decision = ?")
        values.append(decision)

    if transaction_type:
        if transaction_type not in VALID_TYPES:
            return error("Invalid transaction_type.")
        conditions.append("transaction_type = ?")
        values.append(transaction_type)

    where_clause = (" WHERE " + " AND ".join(conditions)) if conditions else ""

    try:
        with connect_db() as db:
            count = db.execute(
                "SELECT COUNT(*) FROM transactions" + where_clause, values
            ).fetchone()[0]

            # Preserve the original frontend's simple array response when
            # no filters or pagination parameters are provided.
            paginated = (
                bool(conditions)
                or "page" in request.args
                or "per_page" in request.args
            )

            if paginated:
                try:
                    page = int(request.args.get("page", 1))
                    per_page = int(request.args.get("per_page", 20))
                except ValueError:
                    return error("page and per_page must be integers.")

                if page < 1 or not 1 <= per_page <= 100:
                    return error("page must be positive and per_page must be 1–100.")

                rows = db.execute(
                    "SELECT * FROM transactions" + where_clause
                    + " ORDER BY id DESC LIMIT ? OFFSET ?",
                    values + [per_page, (page - 1) * per_page],
                ).fetchall()

                return jsonify({
                    "items": [transaction_to_dict(row) for row in rows],
                    "page": page,
                    "per_page": per_page,
                    "total": count,
                    "total_pages": (count + per_page - 1) // per_page,
                })

            rows = db.execute(
                "SELECT * FROM transactions ORDER BY id DESC LIMIT 100"
            ).fetchall()
            return jsonify([transaction_to_dict(row) for row in rows])

    except sqlite3.Error:
        app.logger.exception("Could not retrieve transactions")
        return error("Could not retrieve transactions.", 500)


@app.get("/api/transactions/<transaction_id>")
def get_transaction(transaction_id):
    with connect_db() as db:
        row = db.execute(
            "SELECT * FROM transactions WHERE transaction_id = ?",
            (transaction_id,),
        ).fetchone()

    if row is None:
        return error("Transaction not found.", 404)

    return jsonify(transaction_to_dict(row))


@app.get("/api/stats")
def get_stats():
    """Return aggregate metrics for a dashboard."""
    try:
        with connect_db() as db:
            summary = db.execute("""
                SELECT
                    COUNT(*) AS total_transactions,
                    COALESCE(SUM(amount), 0) AS total_amount,
                    COALESCE(AVG(risk_score), 0) AS average_risk_score,
                    SUM(CASE WHEN risk_level = 'High' THEN 1 ELSE 0 END) AS high_risk,
                    SUM(CASE WHEN risk_level = 'Medium' THEN 1 ELSE 0 END) AS medium_risk,
                    SUM(CASE WHEN risk_level = 'Low' THEN 1 ELSE 0 END) AS low_risk,
                    SUM(CASE WHEN decision = 'Blocked' THEN 1 ELSE 0 END) AS blocked,
                    SUM(CASE WHEN decision = 'Review' THEN 1 ELSE 0 END) AS needs_review,
                    SUM(CASE WHEN review_status = 'Reviewed' THEN 1 ELSE 0 END) AS reviewed
                FROM transactions
            """).fetchone()

            by_type = db.execute("""
                SELECT transaction_type, COUNT(*) AS count
                FROM transactions
                GROUP BY transaction_type
                ORDER BY count DESC
            """).fetchall()

            daily = db.execute("""
                SELECT substr(created_at, 1, 10) AS date, COUNT(*) AS count
                FROM transactions
                GROUP BY substr(created_at, 1, 10)
                ORDER BY date DESC
                LIMIT 7
            """).fetchall()

        return jsonify({
            "summary": dict(summary),
            "by_transaction_type": [dict(row) for row in by_type],
            "daily_volume": [dict(row) for row in reversed(daily)],
        })
    except sqlite3.Error:
        app.logger.exception("Could not calculate statistics")
        return error("Could not calculate statistics.", 500)


@app.patch("/api/transactions/<transaction_id>/review")
def review_transaction(transaction_id):
    """Mark a transaction reviewed and optionally save an investigation note."""
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return error("Send a JSON object.")

    status = str(data.get("review_status", "Reviewed")).strip().title()
    note = str(data.get("review_note", "")).strip()

    if status not in {"New", "Reviewed"}:
        return error("review_status must be 'New' or 'Reviewed'.")

    if len(note) > 2000:
        return error("review_note must be at most 2000 characters.")

    reviewed_at = (
        datetime.now(timezone.utc).isoformat() if status == "Reviewed" else None
    )

    with connect_db() as db:
        cursor = db.execute("""
            UPDATE transactions
            SET review_status = ?, review_note = ?, reviewed_at = ?
            WHERE transaction_id = ?
        """, (status, note, reviewed_at, transaction_id))

        if cursor.rowcount == 0:
            return error("Transaction not found.", 404)

        row = db.execute(
            "SELECT * FROM transactions WHERE transaction_id = ?",
            (transaction_id,),
        ).fetchone()

    return jsonify({
        "message": "Transaction review updated.",
        "transaction": transaction_to_dict(row),
    })


@app.get("/api/transactions/export.csv")
def export_transactions():
    """Download transaction records as a CSV report."""
    with connect_db() as db:
        rows = db.execute("""
            SELECT transaction_id, amount, transaction_type,
                   risk_score, risk_level, decision, reasons,
                   review_status, review_note, created_at
            FROM transactions
            ORDER BY id DESC
            LIMIT 10000
        """).fetchall()

    output = io.StringIO()
    fields = [
        "transaction_id", "amount", "transaction_type",
        "risk_score", "risk_level", "decision", "reasons",
        "review_status", "review_note", "created_at",
    ]
    writer = csv.DictWriter(output, fieldnames=fields)
    writer.writeheader()

    for row in rows:
        item = dict(row)
        try:
            item["reasons"] = "; ".join(json.loads(item["reasons"] or "[]"))
        except (TypeError, json.JSONDecodeError):
            pass
        writer.writerow(item)

    return Response(
        output.getvalue(),
        mimetype="text/csv",
        headers={"Content-Disposition": "attachment; filename=fraudshield-transactions.csv"},
    )


# Initialize/migrate the local SQLite database when the app starts.
initialize_db()

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=os.getenv("FLASK_DEBUG", "true").lower() == "true")
