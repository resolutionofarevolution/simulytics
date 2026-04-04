from flask import Flask, render_template, request, jsonify
import sqlite3
from datetime import datetime
import uuid

app = Flask(__name__)


# Connect DB
def get_db_connection():
    conn = sqlite3.connect('database.db')
    conn.row_factory = sqlite3.Row
    return conn


# Create table (run once)
def init_db():
    conn = get_db_connection()
    conn.execute('''
                 CREATE TABLE IF NOT EXISTS events
                 (
                     id
                     INTEGER
                     PRIMARY
                     KEY
                     AUTOINCREMENT,
                     session_id
                     TEXT,
                     utm_source
                     TEXT,
                     utm_campaign
                     TEXT,
                     event_type
                     TEXT,
                     product
                     TEXT,
                     timestamp
                     TEXT
                 )
                 ''')
    conn.commit()
    conn.close()


init_db()


# Homepage
@app.route('/')
def index():
    return render_template('index.html')


# Track API
@app.route('/track', methods=['POST'])
def track():
    data = request.json

    conn = get_db_connection()
    conn.execute('''
                 INSERT INTO events (session_id, utm_source, utm_campaign, event_type, product, timestamp)
                 VALUES (?, ?, ?, ?, ?, ?)
                 ''', (
                     data.get('session_id'),
                     data.get('utm_source'),
                     data.get('utm_campaign'),
                     data.get('event_type'),
                     data.get('product'),
                     datetime.now()
                 ))

    conn.commit()
    conn.close()

    return jsonify({"status": "success"})

@app.route('/api/events', methods=['GET'])
def get_events():
    conn = get_db_connection()
    data = conn.execute('SELECT * FROM events').fetchall()
    conn.close()

    # Convert to list of dict
    result = [dict(row) for row in data]

    return jsonify(result)

# if __name__ == '__main__':
#     app.run(debug=True)
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=10000)

