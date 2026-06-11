from flask import Flask, render_template, request, jsonify
import sqlite3
from datetime import datetime
from zoneinfo import ZoneInfo

app = Flask(__name__)


# ==========================================
# DATABASE CONNECTION
# ==========================================
def get_db_connection():
    conn = sqlite3.connect("database.db")
    conn.row_factory = sqlite3.Row
    return conn


# ==========================================
# DATABASE INITIALIZATION
# ==========================================
def init_db():

    conn = get_db_connection()

    conn.execute("""
        CREATE TABLE IF NOT EXISTS events
        (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT,
            utm_source TEXT,
            utm_campaign TEXT,
            event_type TEXT,
            product TEXT,
            customer_name TEXT,
            quantity INTEGER DEFAULT 0,
            revenue REAL DEFAULT 0,
            timestamp TEXT
        )
    """)

    conn.commit()

    # Upgrade existing databases safely
    try:
        conn.execute(
            "ALTER TABLE events ADD COLUMN customer_name TEXT"
        )
        conn.commit()
    except:
        pass

    try:
        conn.execute(
            "ALTER TABLE events ADD COLUMN quantity INTEGER DEFAULT 0"
        )
        conn.commit()
    except:
        pass

    try:
        conn.execute(
            "ALTER TABLE events ADD COLUMN revenue REAL DEFAULT 0"
        )
        conn.commit()
    except:
        pass

    conn.close()


init_db()


# ==========================================
# HOME PAGE
# ==========================================
@app.route("/")
def index():
    return render_template("index.html")


# ==========================================
# TRACK EVENT API
# ==========================================
@app.route("/track", methods=["POST"])
def track():

    data = request.json

    conn = get_db_connection()

    conn.execute("""
        INSERT INTO events
        (
            session_id,
            utm_source,
            utm_campaign,
            event_type,
            product,
            customer_name,
            quantity,
            revenue,
            timestamp
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        data.get("session_id"),
        data.get("utm_source"),
        data.get("utm_campaign"),
        data.get("event_type"),
        data.get("product"),
        data.get("customer_name"),
        data.get("quantity", 0),
        data.get("revenue", 0),
        datetime.now(
            ZoneInfo("Asia/Kolkata")
        ).strftime("%Y-%m-%d %H:%M:%S")
    ))

    conn.commit()
    conn.close()

    return jsonify({"status": "success"})


# ==========================================
# GET ALL EVENTS
# ==========================================
@app.route("/api/events", methods=["GET"])
def get_events():

    conn = get_db_connection()

    events = conn.execute("""
        SELECT *
        FROM events
        ORDER BY id DESC
    """).fetchall()

    conn.close()

    return jsonify([dict(row) for row in events])


# ==========================================
# DASHBOARD SUMMARY API
# ==========================================
@app.route("/api/summary", methods=["GET"])
def summary():

    conn = get_db_connection()

    total_events = conn.execute("""
        SELECT COUNT(*) cnt
        FROM events
    """).fetchone()["cnt"]

    total_sessions = conn.execute("""
        SELECT COUNT(DISTINCT session_id) cnt
        FROM events
    """).fetchone()["cnt"]

    total_add_to_cart = conn.execute("""
        SELECT COUNT(*) cnt
        FROM events
        WHERE event_type = 'add_to_cart'
    """).fetchone()["cnt"]

    total_purchases = conn.execute("""
        SELECT COUNT(*) cnt
        FROM events
        WHERE event_type = 'purchase'
    """).fetchone()["cnt"]

    total_revenue = conn.execute("""
        SELECT IFNULL(SUM(revenue),0) revenue
        FROM events
        WHERE event_type = 'purchase'
    """).fetchone()["revenue"]

    total_quantity = conn.execute("""
        SELECT IFNULL(SUM(quantity),0) qty
        FROM events
        WHERE event_type = 'purchase'
    """).fetchone()["qty"]

    conn.close()

    return jsonify({
        "total_events": total_events,
        "total_sessions": total_sessions,
        "total_add_to_cart": total_add_to_cart,
        "total_purchases": total_purchases,
        "total_revenue": total_revenue,
        "total_quantity": total_quantity
    })


# ==========================================
# HEALTH CHECK
# ==========================================
@app.route("/health")
def health():
    return jsonify({
        "status": "running",
        "application": "Simulytics"
    })


# ==========================================
# RUN APPLICATION
# ==========================================
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=10000)
