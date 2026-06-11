from flask import Flask, render_template, request, jsonify
import sqlite3
from datetime import datetime
from zoneinfo import ZoneInfo

app = Flask(__name__)


# -----------------------------
# DATABASE CONNECTION
# -----------------------------
def get_db_connection():
    conn = sqlite3.connect('database.db')
    conn.row_factory = sqlite3.Row
    return conn


# -----------------------------
# DATABASE INITIALIZATION
# -----------------------------
def init_db():
    conn = get_db_connection()

    conn.execute('''
        CREATE TABLE IF NOT EXISTS events
        (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT,
            utm_source TEXT,
            utm_campaign TEXT,
            event_type TEXT,
            product TEXT,
            customer_name TEXT,
            timestamp TEXT
        )
    ''')

    conn.commit()

    # Add customer_name column for older databases
    try:
        conn.execute(
            "ALTER TABLE events ADD COLUMN customer_name TEXT"
        )
        conn.commit()
    except:
        pass

    conn.close()


init_db()


# -----------------------------
# HOME PAGE
# -----------------------------
@app.route('/')
def index():
    return render_template("index.html")


# -----------------------------
# TRACK EVENT API
# -----------------------------
@app.route('/track', methods=['POST'])
def track():

    data = request.json

    conn = get_db_connection()

    conn.execute('''
        INSERT INTO events
        (
            session_id,
            utm_source,
            utm_campaign,
            event_type,
            product,
            customer_name,
            timestamp
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (
        data.get('session_id'),
        data.get('utm_source'),
        data.get('utm_campaign'),
        data.get('event_type'),
        data.get('product'),
        data.get('customer_name'),
        datetime.now(
            ZoneInfo("Asia/Kolkata")
        ).strftime("%Y-%m-%d %H:%M:%S")
    ))

    conn.commit()
    conn.close()

    return jsonify({
        "status": "success"
    })


# -----------------------------
# GET ALL EVENTS
# -----------------------------
@app.route('/api/events', methods=['GET'])
def get_events():

    conn = get_db_connection()

    data = conn.execute('''
        SELECT *
        FROM events
        ORDER BY id DESC
    ''').fetchall()

    conn.close()

    result = [dict(row) for row in data]

    return jsonify(result)


# -----------------------------
# DASHBOARD SUMMARY API
# -----------------------------
@app.route('/api/summary', methods=['GET'])
def summary():

    conn = get_db_connection()

    total_events = conn.execute('''
        SELECT COUNT(*) AS cnt
        FROM events
    ''').fetchone()['cnt']

    total_sessions = conn.execute('''
        SELECT COUNT(DISTINCT session_id) AS cnt
        FROM events
    ''').fetchone()['cnt']

    total_purchases = conn.execute('''
        SELECT COUNT(*) AS cnt
        FROM events
        WHERE event_type = 'purchase'
    ''').fetchone()['cnt']

    total_add_to_cart = conn.execute('''
        SELECT COUNT(*) AS cnt
        FROM events
        WHERE event_type = 'add_to_cart'
    ''').fetchone()['cnt']

    conn.close()

    return jsonify({
        "total_events": total_events,
        "total_sessions": total_sessions,
        "total_add_to_cart": total_add_to_cart,
        "total_purchases": total_purchases
    })


# -----------------------------
# RUN APPLICATION
# -----------------------------
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=10000)
