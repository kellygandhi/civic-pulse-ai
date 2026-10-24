from datetime import datetime, timezone, timedelta
from app.database.db import get_db, init_db, log_complaint_event

DEPARTMENTS = [
    {
        "dept_id": "DEPT_ROADS",
        "dept_name": "Roads & Bridges Department",
        "category_match": "pothole,road_damage,caved_in_road,broken_footpath,sidewalk",
        "sla_hours": 48,
        "head_officer": "Er. Rajesh Patel (Executive Engineer)",
        "contact_email": "roads.amc@ahmedabadcity.gov.in"
    },
    {
        "dept_id": "DEPT_SWM",
        "dept_name": "Solid Waste Management Department",
        "category_match": "garbage,solid_waste,overflowing_bin,dump,debris",
        "sla_hours": 24,
        "head_officer": "Dr. Sneha Desai (Chief Sanitation Officer)",
        "contact_email": "swm.amc@ahmedabadcity.gov.in"
    },
    {
        "dept_id": "DEPT_ELEC",
        "dept_name": "Street Lighting & Electrical Department",
        "category_match": "streetlight,broken_light,dark_spot,dangling_wire,lamp_post",
        "sla_hours": 48,
        "head_officer": "Er. Vikram Shah (Deputy City Engineer - Electrical)",
        "contact_email": "light.amc@ahmedabadcity.gov.in"
    },
    {
        "dept_id": "DEPT_DRAIN",
        "dept_name": "Drainage & Stormwater Department",
        "category_match": "waterlogging,flooding,drainage,open_manhole,sewer_overflow",
        "sla_hours": 24,
        "head_officer": "Er. Mehul Joshi (Superintending Engineer - Drainage)",
        "contact_email": "drainage.amc@ahmedabadcity.gov.in"
    },
    {
        "dept_id": "DEPT_HEALTH",
        "dept_name": "Public Health & Vector Control",
        "category_match": "stagnant_water,mosquito_breeding,open_drain,hygiene",
        "sla_hours": 36,
        "head_officer": "Dr. Bhavin Solanki (Medical Officer of Health)",
        "contact_email": "health.amc@ahmedabadcity.gov.in"
    }
]

WARDS = [
    # West Zone
    {"ward_id": 12, "ward_name": "Bodakdev - Vastrapur", "zone": "West Zone", "center_lat": 23.0384, "center_lon": 72.5284, "officer": "Sunil Varma (Ward Inspector)", "contact": "+91 98250 11201", "email": "ward12@amc.gov.in", "corp": "Amit Shah (Corporator)", "handle": "@AMC_Ward12"},
    {"ward_id": 7, "ward_name": "Navrangpura - University", "zone": "West Zone", "center_lat": 23.0360, "center_lon": 72.5590, "officer": "Ketan Dave (Ward Inspector)", "contact": "+91 98250 11202", "email": "ward7@amc.gov.in", "corp": "Dr. Jigar Parmar", "handle": "@AMC_Ward07"},
    {"ward_id": 8, "ward_name": "Naranpura", "zone": "West Zone", "center_lat": 23.0560, "center_lon": 72.5530, "officer": "Hitesh Mehta (Ward Inspector)", "contact": "+91 98250 11203", "email": "ward8@amc.gov.in", "corp": "Geeta Patel", "handle": "@AMC_Ward08"},
    {"ward_id": 9, "ward_name": "Paldi", "zone": "West Zone", "center_lat": 23.0120, "center_lon": 72.5620, "officer": "Dharmesh Soni (Ward Inspector)", "contact": "+91 98250 11204", "email": "ward9@amc.gov.in", "corp": "Ramesh Prajapati", "handle": "@AMC_Ward09"},
    {"ward_id": 10, "ward_name": "Usmanpura - Ashram Road", "zone": "West Zone", "center_lat": 23.0450, "center_lon": 72.5710, "officer": "Pravin Rawal (Ward Inspector)", "contact": "+91 98250 11205", "email": "ward10@amc.gov.in", "corp": "Bina Dave", "handle": "@AMC_Ward10"},
    {"ward_id": 11, "ward_name": "Ranip", "zone": "West Zone", "center_lat": 23.0780, "center_lon": 72.5760, "officer": "Mukesh Barot (Ward Inspector)", "contact": "+91 98250 11206", "email": "ward11@amc.gov.in", "corp": "Mahesh Bhatt", "handle": "@AMC_Ward11"},

    # North West Zone
    {"ward_id": 1, "ward_name": "Gota - SG Highway North", "zone": "North West Zone", "center_lat": 23.1040, "center_lon": 72.5360, "officer": "Dipak Vyas (Ward Inspector)", "contact": "+91 98250 11301", "email": "ward1@amc.gov.in", "corp": "Pooja Vaghela", "handle": "@AMC_Ward01"},
    {"ward_id": 2, "ward_name": "Thaltej - Sindhu Bhavan", "zone": "North West Zone", "center_lat": 23.0510, "center_lon": 72.5080, "officer": "Ashok Trivedi (Ward Inspector)", "contact": "+91 98250 11302", "email": "ward2@amc.gov.in", "corp": "Sanjay Rathod", "handle": "@AMC_Ward02"},
    {"ward_id": 3, "ward_name": "Ghatlodia", "zone": "North West Zone", "center_lat": 23.0670, "center_lon": 72.5400, "officer": "Nilesh Jadav (Ward Inspector)", "contact": "+91 98250 11303", "email": "ward3@amc.gov.in", "corp": "Kanubhai Patel", "handle": "@AMC_Ward03"},
    {"ward_id": 4, "ward_name": "Chandlodia - Nirnay Nagar", "zone": "North West Zone", "center_lat": 23.0790, "center_lon": 72.5490, "officer": "Bharat Chauhan (Ward Inspector)", "contact": "+91 98250 11304", "email": "ward4@amc.gov.in", "corp": "Meena Thakor", "handle": "@AMC_Ward04"},
    {"ward_id": 5, "ward_name": "Sola - Science City", "zone": "North West Zone", "center_lat": 23.0820, "center_lon": 72.5180, "officer": "Girish Rana (Ward Inspector)", "contact": "+91 98250 11305", "email": "ward5@amc.gov.in", "corp": "Alok Sharma", "handle": "@AMC_Ward05"},

    # South West Zone
    {"ward_id": 13, "ward_name": "Satellite - Jodhpur", "zone": "South West Zone", "center_lat": 23.0230, "center_lon": 72.5250, "officer": "Chetan Modi (Ward Inspector)", "contact": "+91 98250 11401", "email": "ward13@amc.gov.in", "corp": "Varsha Solanki", "handle": "@AMC_Ward13"},
    {"ward_id": 14, "ward_name": "Sarkhej - Makarba", "zone": "South West Zone", "center_lat": 22.9910, "center_lon": 72.5010, "officer": "Irfan Qureshi (Ward Inspector)", "contact": "+91 98250 11402", "email": "ward14@amc.gov.in", "corp": "Salim Shaikh", "handle": "@AMC_Ward14"},
    {"ward_id": 15, "ward_name": "Vejalpur - Prahlad Nagar", "zone": "South West Zone", "center_lat": 23.0070, "center_lon": 72.5290, "officer": "Rajesh Gadhvi (Ward Inspector)", "contact": "+91 98250 11403", "email": "ward15@amc.gov.in", "corp": "Hemant Patel", "handle": "@AMC_Ward15"},

    # Central Zone
    {"ward_id": 20, "ward_name": "Khadiya - Relief Road", "zone": "Central Zone", "center_lat": 23.0240, "center_lon": 72.5930, "officer": "Mayur Shukla (Ward Inspector)", "contact": "+91 98250 11501", "email": "ward20@amc.gov.in", "corp": "Mayur Dave", "handle": "@AMC_Ward20"},
    {"ward_id": 21, "ward_name": "Jamalpur - Khamasa", "zone": "Central Zone", "center_lat": 23.0130, "center_lon": 72.5840, "officer": "Aslam Pathan (Ward Inspector)", "contact": "+91 98250 11502", "email": "ward21@amc.gov.in", "corp": "Imran Khedawala", "handle": "@AMC_Ward21"},
    {"ward_id": 22, "ward_name": "Shahpur - Delhi Darwaja", "zone": "Central Zone", "center_lat": 23.0370, "center_lon": 72.5830, "officer": "Vijay Panchal (Ward Inspector)", "contact": "+91 98250 11503", "email": "ward22@amc.gov.in", "corp": "Nitin Shah", "handle": "@AMC_Ward22"},

    # South Zone
    {"ward_id": 30, "ward_name": "Maninagar - Kankaria Lake", "zone": "South Zone", "center_lat": 22.9980, "center_lon": 72.6020, "officer": "Dhiren Makwana (Ward Inspector)", "contact": "+91 98250 11601", "email": "ward30@amc.gov.in", "corp": "Pradip Parmar", "handle": "@AMC_Ward30"},
    {"ward_id": 31, "ward_name": "Isanpur - Ghodasar", "zone": "South Zone", "center_lat": 22.9810, "center_lon": 72.5980, "officer": "Laxman Vaghela (Ward Inspector)", "contact": "+91 98250 11602", "email": "ward31@amc.gov.in", "corp": "Kamlesh Patel", "handle": "@AMC_Ward31"},
    {"ward_id": 32, "ward_name": "Vatva GIDC", "zone": "South Zone", "center_lat": 22.9640, "center_lon": 72.6320, "officer": "Naresh Chaudhari (Ward Inspector)", "contact": "+91 98250 11603", "email": "ward32@amc.gov.in", "corp": "Babubhai Patel", "handle": "@AMC_Ward32"},

    # North Zone
    {"ward_id": 40, "ward_name": "Chandkheda - Motera Stadium", "zone": "North Zone", "center_lat": 23.1110, "center_lon": 72.5920, "officer": "Tushar Zala (Ward Inspector)", "contact": "+91 98250 11701", "email": "ward40@amc.gov.in", "corp": "Jayesh Raval", "handle": "@AMC_Ward40"},
    {"ward_id": 41, "ward_name": "Sabarmati - Dharmnagar", "zone": "North Zone", "center_lat": 23.0840, "center_lon": 72.5890, "officer": "Harish Suthar (Ward Inspector)", "contact": "+91 98250 11702", "email": "ward41@amc.gov.in", "corp": "Arvind Rajput", "handle": "@AMC_Ward41"},

    # East Zone
    {"ward_id": 45, "ward_name": "Bapunagar - Diamond Market", "zone": "East Zone", "center_lat": 23.0440, "center_lon": 72.6280, "officer": "Pravin Solanki (Ward Inspector)", "contact": "+91 98250 11801", "email": "ward45@amc.gov.in", "corp": "Dinesh Patel", "handle": "@AMC_Ward45"},
    {"ward_id": 46, "ward_name": "Nikol - SP Ring Road", "zone": "East Zone", "center_lat": 23.0520, "center_lon": 72.6640, "officer": "Jagdish Mer (Ward Inspector)", "contact": "+91 98250 11802", "email": "ward46@amc.gov.in", "corp": "Kiran Vaghela", "handle": "@AMC_Ward46"}
]

def seed_database():
    init_db()
    conn = get_db()
    cursor = conn.cursor()

    # Seed Departments
    for d in DEPARTMENTS:
        cursor.execute("""
            INSERT OR REPLACE INTO departments (dept_id, dept_name, category_match, sla_hours, head_officer, contact_email)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (d["dept_id"], d["dept_name"], d["category_match"], d["sla_hours"], d["head_officer"], d["contact_email"]))

    # Seed Wards
    for w in WARDS:
        # Bounding box calculation (+/- 0.02 deg ~ 2km)
        lat_min = round(w["center_lat"] - 0.02, 4)
        lat_max = round(w["center_lat"] + 0.02, 4)
        lon_min = round(w["center_lon"] - 0.02, 4)
        lon_max = round(w["center_lon"] + 0.02, 4)

        cursor.execute("""
            INSERT OR REPLACE INTO zones_and_wards (
                ward_id, ward_name, zone, lat_min, lat_max, lon_min, lon_max, center_lat, center_lon,
                ward_officer_name, ward_officer_contact, ward_officer_email, corporator_name, corporator_handle
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            w["ward_id"], w["ward_name"], w["zone"], lat_min, lat_max, lon_min, lon_max,
            w["center_lat"], w["center_lon"], w["officer"], w["contact"], w["email"], w["corp"], w["handle"]
        ))

    # Check if complaints table is already seeded
    cursor.execute("SELECT COUNT(*) FROM complaints")
    count = cursor.fetchone()[0]

    if count == 0:
        now = datetime.now(timezone.utc)
        
        # 1. Registered Sample (Pothole - Bodakdev)
        t1_id = "AMC-2026-WZ-88412"
        t1_created = (now - timedelta(hours=3)).isoformat()
        t1_deadline = (now + timedelta(hours=45)).isoformat()
        cursor.execute("""
            INSERT INTO complaints (
                tracking_id, issue_category, severity, description, address, latitude, longitude,
                ward_id, ward_name, zone, department_id, department_name, citizen_name, citizen_phone,
                image_url, status, created_at, sla_deadline, sla_hours, assigned_officer, is_escalated,
                social_post_x, social_post_insta
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            t1_id, "Pothole", "High",
            "Severe 1.2m pothole on main carriageway near Judges Bungalow Crossroad. Hazard to 2-wheelers.",
            "Judges Bungalow Road, Bodakdev, Ahmedabad", 23.0384, 72.5284,
            12, "Bodakdev - Vastrapur", "West Zone", "DEPT_ROADS", "Roads & Bridges Department",
            "Ananya Sen", "+91 98240 55112",
            "/sample_assets/pothole_sg_highway.jpg", "Registered", t1_created, t1_deadline, 48,
            "Sunil Varma (Ward Inspector)", 0,
            "🚨 Reported deep dangerous pothole near Judges Bungalow Crossroad, Bodakdev (Ward 12). Ticket AMC-2026-WZ-88412. Please fix immediately @AmdavadAMC @AMC_Ward12 #CleanAhmedabad #RoadSafety",
            "Reported a high-severity road pothole in Bodakdev. Tracking ID: AMC-2026-WZ-88412. Waiting for AMC action."
        ))
        log_complaint_event(t1_id, "Registered", "CivicPulse AI", "AI Triage & Registration", "Complaint verified via computer vision and routed to Ward 12 Roads Dept.", conn=conn)

        # 2. In Progress Sample (Garbage Dump - Vastrapur Lake)
        t2_id = "AMC-2026-WZ-73910"
        t2_created = (now - timedelta(hours=18)).isoformat()
        t2_deadline = (now + timedelta(hours=6)).isoformat()
        cursor.execute("""
            INSERT INTO complaints (
                tracking_id, issue_category, severity, description, address, latitude, longitude,
                ward_id, ward_name, zone, department_id, department_name, citizen_name, citizen_phone,
                image_url, status, created_at, sla_deadline, sla_hours, assigned_officer, is_escalated,
                social_post_x, social_post_insta
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            t2_id, "Garbage / Solid Waste", "Medium",
            "Large pile of uncollected solid waste and organic refuse overflowing on pedestrian pathway near Vastrapur Lake entrance.",
            "Vastrapur Lake Outer Circle, Ahmedabad", 23.0365, 72.5295,
            12, "Bodakdev - Vastrapur", "West Zone", "DEPT_SWM", "Solid Waste Management Department",
            "Rahul Sharma", "+91 97230 44882",
            "/sample_assets/garbage_dump_vastrapur.jpg", "In Progress", t2_created, t2_deadline, 24,
            "Sunil Varma (Ward Inspector)", 0,
            "🗑️ Garbage overflow reported at Vastrapur Lake entrance. Ticket AMC-2026-WZ-73910. Sanitation truck requested @AmdavadAMC @AMC_Ward12 #SwachhBharat",
            "Garbage accumulation reported at Vastrapur Lake. Tracking ID: AMC-2026-WZ-73910."
        ))
        log_complaint_event(t2_id, "Registered", "CivicPulse AI", "AI Triage & Registration", "Solid waste complaint registered.", conn=conn)
        log_complaint_event(t2_id, "Inspected", "Sunil Varma (Ward Inspector)", "Field Inspection", "Inspected site at 10:15 AM. 2-ton waste identified. SWM dumper scheduled.", conn=conn)
        log_complaint_event(t2_id, "In Progress", "SWM Control Room", "Resource Dispatched", "Refuse compactor vehicle GJ-01-CZ-4412 dispatched to site.", conn=conn)

        # 3. Resolved Sample (Waterlogging - Navrangpura)
        t3_id = "AMC-2026-WZ-51204"
        t3_created = (now - timedelta(days=2)).isoformat()
        t3_deadline = (now - timedelta(days=1)).isoformat()
        cursor.execute("""
            INSERT INTO complaints (
                tracking_id, issue_category, severity, description, address, latitude, longitude,
                ward_id, ward_name, zone, department_id, department_name, citizen_name, citizen_phone,
                image_url, status, created_at, sla_deadline, sla_hours, assigned_officer, resolution_notes, is_escalated,
                social_post_x, social_post_insta
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            t3_id, "Waterlogging & Drainage", "High",
            "Severe water accumulation blocking entrance to commerce college on University Road due to clogged stormwater catch pit.",
            "Commerce Six Roads, Navrangpura, Ahmedabad", 23.0360, 72.5590,
            7, "Navrangpura - University", "West Zone", "DEPT_DRAIN", "Drainage & Stormwater Department",
            "Priya Mehta", "+91 98980 12345",
            "/sample_assets/waterlogging_subhash.jpg", "Resolved", t3_created, t3_deadline, 24,
            "Ketan Dave (Ward Inspector)",
            "Stormwater catch pit cleared of silt and plastic blockage using high-pressure jetting machine. Normal water flow restored.", 0,
            "💧 Waterlogging near Commerce Six Roads reported under AMC-2026-WZ-51204. Issue resolved by @AmdavadAMC @AMC_Ward07",
            "Waterlogging cleared at Navrangpura. Tracking ID: AMC-2026-WZ-51204. Thanks AMC team!"
        ))
        log_complaint_event(t3_id, "Registered", "CivicPulse AI", "AI Triage", "Waterlogging grievance registered.", conn=conn)
        log_complaint_event(t3_id, "In Progress", "Ketan Dave (Ward Inspector)", "Drainage Team Deployed", "Jetting machine unit #4 sent to site.", conn=conn)
        log_complaint_event(t3_id, "Resolved", "Er. Mehul Joshi (Superintending Engineer)", "Closure", "Silt flushed, catch pit unblocked. Photo evidence recorded.", conn=conn)

        # 4. SLA-Breached & Escalated Sample (Broken Streetlight - Gota)
        t4_id = "AMC-2026-NW-39185"
        t4_created = (now - timedelta(days=4)).isoformat()
        t4_deadline = (now - timedelta(days=2)).isoformat()
        cursor.execute("""
            INSERT INTO complaints (
                tracking_id, issue_category, severity, description, address, latitude, longitude,
                ward_id, ward_name, zone, department_id, department_name, citizen_name, citizen_phone,
                image_url, status, created_at, sla_deadline, sla_hours, assigned_officer, is_escalated, escalated_at,
                social_post_x, social_post_insta
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            t4_id, "Streetlight Outage", "Medium",
            "Four consecutive streetlights non-functional on service road near Gota Flyover. Pitch dark at night, high theft and accident hazard.",
            "SG Highway Service Road, Gota, Ahmedabad", 23.1040, 72.5360,
            1, "Gota - SG Highway North", "North West Zone", "DEPT_ELEC", "Street Lighting & Electrical Department",
            "Chirag Vaghela", "+91 98765 43210",
            "/sample_assets/broken_streetlight_cg_road.jpg", "Escalated", t4_created, t4_deadline, 48,
            "Dipak Vyas (Ward Inspector)", 1, (now - timedelta(hours=8)).isoformat(),
            "⚠️ 4 Streetlights broken for 4 days near Gota Flyover! SLA Breached! Ticket AMC-2026-NW-39185. @AmdavadAMC @MayorAmdavad fix this! #AhmedabadDarkSpots",
            "Streetlight outage pending beyond SLA. Tracking ID: AMC-2026-NW-39185. Escalated to Zonal Commissioner."
        ))
        log_complaint_event(t4_id, "Registered", "CivicPulse AI", "AI Triage", "Streetlight complaint registered. 48h SLA set.", conn=conn)
        log_complaint_event(t4_id, "Pending Inspection", "Electrical Dept", "Delayed", "Field electrician delayed due to priority festival wiring.", conn=conn)
        log_complaint_event(t4_id, "Escalated", "CivicPulse SLA Watchdog", "Automatic Escalation", "SLA breached by 48 hours. Ticket escalated to Deputy Municipal Commissioner (North West Zone).", conn=conn)


    conn.commit()
    conn.close()
