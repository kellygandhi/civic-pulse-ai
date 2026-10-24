import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).resolve().parent))

# Ensure UTF-8 output on Windows console
if sys.platform == "win32":
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')


from app.database.seed_data import seed_database
from app.core.tools import (
    analyze_civic_image,
    resolve_ward_and_department,
    file_municipal_complaint,
    generate_social_advocacy_post,
    fetch_ticket_status
)
from app.core.agent import agent_instance

def run_tests():
    print("=" * 60)
    print("RUNNING CIVICPULSE AI BACKEND & TOOL CHAIN TESTS")
    print("=" * 60)

    # 1. Test Database Seeding
    print("\n[TEST 1] Initializing and Seeding Database...")
    seed_database()
    print("  -> Database seeded successfully.")

    # 2. Test Tool 1: analyze_civic_image
    print("\n[TEST 2] Testing Tool 1: analyze_civic_image with sample pothole...")
    t1_res = analyze_civic_image("sample-pothole-1")
    assert t1_res["status"] == "success", "Tool 1 failed"
    assert t1_res["issue_category"] == "Pothole", "Category mismatch"
    assert t1_res["exif_metadata"]["has_gps"] is True, "EXIF GPS expected"
    print(f"  -> Detected: {t1_res['severity']} {t1_res['issue_category']}")
    print(f"  -> GPS: Lat {t1_res['exif_metadata']['latitude']}, Lon {t1_res['exif_metadata']['longitude']}")

    # 3. Test Tool 2: resolve_ward_and_department
    print("\n[TEST 3] Testing Tool 2: resolve_ward_and_department for Vastrapur...")
    t2_res = resolve_ward_and_department(
        location_query="Near Vastrapur Lake",
        latitude=23.0365,
        longitude=72.5295,
        issue_category="Pothole"
    )
    assert t2_res["status"] == "success", "Tool 2 failed"
    assert "Bodakdev" in t2_res["ward_name"] or "West" in t2_res["zone"], "Ward mapping error"
    assert t2_res["department_name"] == "Roads & Bridges Department", "Department mapping error"
    print(f"  -> Mapped to: {t2_res['ward_name']} ({t2_res['zone']})")
    print(f"  -> Dept: {t2_res['department_name']} (SLA: {t2_res['sla_resolution_hours']}h)")
    print(f"  -> Officer: {t2_res['officer_in_charge']['name']}")

    # 4. Test Tool 3: file_municipal_complaint
    print("\n[TEST 4] Testing Tool 3: file_municipal_complaint...")
    t3_res = file_municipal_complaint(
        issue_category="Pothole",
        severity="High",
        description="Hazardous pothole causing two-wheeler skidding near judges bungalow.",
        address="Judges Bungalow Road, Bodakdev",
        latitude=23.0384,
        longitude=72.5284,
        ward_id=t2_res["ward_id"],
        department_id=t2_res["assigned_department_id"],
        citizen_name="Aarav Sharma",
        citizen_phone="+91 98250 99999"
    )
    assert t3_res["status"] == "success", "Tool 3 failed"
    tracking_id = t3_res["tracking_id"]
    print(f"  -> Generated Tracking ID: {tracking_id}")
    print(f"  -> SLA Deadline: {t3_res['sla_deadline']}")

    # 5. Test Tool 4: generate_social_advocacy_post
    print("\n[TEST 5] Testing Tool 4: generate_social_advocacy_post...")
    t4_res = generate_social_advocacy_post(tracking_id)
    assert t4_res["status"] == "success", "Tool 4 failed"
    pkg = t4_res["advocacy_package"]
    assert "twitter_intent_url" in pkg, "Missing twitter intent"
    print(f"  -> Twitter Text: {pkg['twitter_text'][:80]}...")
    print(f"  -> Twitter Intent URL: {pkg['twitter_intent_url'][:60]}...")

    # 6. Test Tool 5: fetch_ticket_status
    print("\n[TEST 6] Testing Tool 5: fetch_ticket_status...")
    t5_res = fetch_ticket_status(tracking_id)
    assert t5_res["status"] == "success", "Tool 5 failed"
    assert t5_res["current_status"] == "Registered", "Status mismatch"
    assert len(t5_res["timeline_events"]) >= 1, "Missing audit log"
    print(f"  -> Status: {t5_res['current_status']}")
    print(f"  -> SLA Remaining: {t5_res['sla_hours_remaining']} hours")
    print(f"  -> Timeline Events: {len(t5_res['timeline_events'])}")

    # 7. Test Conversational Agent Pipeline
    print("\n[TEST 7] Testing Conversational Agent Chat...")
    chat_status = agent_instance.process_chat_message(f"What is the status of complaint {tracking_id}?")
    assert tracking_id in chat_status["reply"], "Chat status reply failed"
    print("  -> Chat Status Response:")
    print("     " + chat_status["reply"][:120].replace("\n", " "))

    print("\n" + "=" * 60)
    print("ALL 7 BACKEND AGENT TESTS PASSED PERFECTION!")
    print("=" * 60)

if __name__ == "__main__":
    run_tests()
