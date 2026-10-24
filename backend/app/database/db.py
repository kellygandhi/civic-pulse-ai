import sqlite3
import json
from datetime import datetime, timezone
from app.config import DB_PATH

def get_db():
    conn = sqlite3.connect(DB_PATH, timeout=30.0)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()

    # Table 1: Zones and Wards
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS zones_and_wards (
        ward_id INTEGER PRIMARY KEY,
        ward_name TEXT NOT NULL,
        zone TEXT NOT NULL,
        lat_min REAL,
        lat_max REAL,
        lon_min REAL,
        lon_max REAL,
        center_lat REAL,
        center_lon REAL,
        ward_officer_name TEXT,
        ward_officer_contact TEXT,
        ward_officer_email TEXT,
        corporator_name TEXT,
        corporator_handle TEXT
    );
    """)

    # Table 2: Municipal Departments
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS departments (
        dept_id TEXT PRIMARY KEY,
        dept_name TEXT NOT NULL,
        category_match TEXT NOT NULL,
        sla_hours INTEGER NOT NULL,
        head_officer TEXT,
        contact_email TEXT
    );
    """)

    # Table 3: Civic Complaints
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS complaints (
        tracking_id TEXT PRIMARY KEY,
        issue_category TEXT NOT NULL,
        severity TEXT NOT NULL,
        description TEXT NOT NULL,
        address TEXT NOT NULL,
        latitude REAL,
        longitude REAL,
        ward_id INTEGER,
        ward_name TEXT,
        zone TEXT,
        department_id TEXT,
        department_name TEXT,
        citizen_name TEXT,
        citizen_phone TEXT,
        image_url TEXT,
        status TEXT NOT NULL,
        created_at TEXT NOT NULL,
        sla_deadline TEXT NOT NULL,
        sla_hours INTEGER NOT NULL,
        assigned_officer TEXT,
        resolution_notes TEXT,
        is_escalated INTEGER DEFAULT 0,
        escalated_at TEXT,
        social_post_x TEXT,
        social_post_insta TEXT,
        FOREIGN KEY(ward_id) REFERENCES zones_and_wards(ward_id),
        FOREIGN KEY(department_id) REFERENCES departments(dept_id)
    );
    """)

    # Table 4: Complaint Timeline Logs
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS complaint_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tracking_id TEXT NOT NULL,
        status TEXT NOT NULL,
        actor TEXT NOT NULL,
        action TEXT NOT NULL,
        notes TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        FOREIGN KEY(tracking_id) REFERENCES complaints(tracking_id)
    );
    """)

    conn.commit()
    conn.close()

def log_complaint_event(tracking_id: str, status: str, actor: str, action: str, notes: str, conn=None):
    should_close = False
    if conn is None:
        conn = get_db()
        should_close = True
        
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO complaint_logs (tracking_id, status, actor, action, notes, timestamp)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (tracking_id, status, actor, action, notes, datetime.now(timezone.utc).isoformat()))
    
    if should_close:
        conn.commit()
        conn.close()

