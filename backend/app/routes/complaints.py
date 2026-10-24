from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
from app.database.db import get_db, log_complaint_event
from app.core.tools import fetch_ticket_status, generate_social_advocacy_post

router = APIRouter(prefix="/api/complaints", tags=["Complaints"])

@router.get("")
async def list_complaints(
    status: Optional[str] = None,
    ward_id: Optional[int] = None,
    department_id: Optional[str] = None,
    limit: int = 50
):
    """
    List municipal complaints with optional filters.
    """
    conn = get_db()
    cursor = conn.cursor()

    query = "SELECT * FROM complaints WHERE 1=1"
    params = []

    if status:
        query += " AND status = ?"
        params.append(status)
    if ward_id:
        query += " AND ward_id = ?"
        params.append(ward_id)
    if department_id:
        query += " AND department_id = ?"
        params.append(department_id)

    query += " ORDER BY created_at DESC LIMIT ?"
    params.append(limit)

    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()

    return {"complaints": [dict(r) for r in rows]}

@router.get("/{tracking_id}")
async def get_complaint_by_id(tracking_id: str):
    """
    Fetch comprehensive complaint details, live SLA countdown, and lifecycle logs.
    """
    res = fetch_ticket_status(tracking_id.upper())
    if res.get("status") == "not_found":
        raise HTTPException(status_code=404, detail=res["message"])
    return res

@router.post("/{tracking_id}/escalate")
async def escalate_complaint(tracking_id: str):
    """
    Escalates an SLA-breached complaint directly to the Zonal Deputy Municipal Commissioner.
    """
    tracking_id = tracking_id.upper()
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM complaints WHERE tracking_id = ?", (tracking_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Complaint not found")

    complaint = dict(row)
    now_iso = datetime.now(timezone.utc).isoformat()

    cursor.execute("""
        UPDATE complaints
        SET is_escalated = 1, escalated_at = ?, status = 'Escalated'
        WHERE tracking_id = ?
    """, (now_iso, tracking_id))
    conn.commit()
    conn.close()

    # Log escalation audit event
    log_complaint_event(
        tracking_id=tracking_id,
        status="Escalated",
        actor="Citizen / CivicPulse SLA Watchdog",
        action="Official Zonal Escalation",
        notes=f"Citizen requested formal administrative escalation. Priority escalated to Deputy Municipal Commissioner ({complaint['zone']}). SMS & Email dispatch triggered."
    )

    return {
        "success": True,
        "tracking_id": tracking_id,
        "status": "Escalated",
        "escalated_at": now_iso,
        "message": f"Ticket #{tracking_id} has been formally escalated to the Deputy Municipal Commissioner for {complaint['zone']}."
    }

@router.get("/{tracking_id}/social")
async def get_social_advocacy(tracking_id: str):
    """
    Fetches the social advocacy post drafts and Twitter web intent for a complaint.
    """
    res = generate_social_advocacy_post(tracking_id.upper())
    if res.get("status") == "error":
        raise HTTPException(status_code=404, detail=res["message"])
    return res
