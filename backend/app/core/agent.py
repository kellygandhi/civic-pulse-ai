import re
import json
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from app.config import GEMINI_API_KEY
from app.core.tools import (
    analyze_civic_image,
    resolve_ward_and_department,
    file_municipal_complaint,
    generate_social_advocacy_post,
    fetch_ticket_status
)

logger = logging.getLogger(__name__)

class CivicComplaintAgent:
    """
    Autonomous Civic Complaint Agent that reasons step-by-step,
    orchestrates specialized tool calls, and interacts with citizens.
    """

    def __init__(self):
        self.api_key = GEMINI_API_KEY
        self.mode = "llm" if self.api_key else "autonomous_heuristic"

    def execute_full_filing_pipeline(
        self,
        image_input: str,
        user_location: Optional[str] = None,
        user_description: Optional[str] = None,
        citizen_name: str = "Citizen User",
        citizen_phone: str = "+91 98250 12345"
    ) -> Dict[str, Any]:
        """
        Executes the 4-step autonomous tool pipeline to convert a raw photo into
        a registered, routed municipal ticket with public advocacy drafts.
        """
        reasoning_trace = []
        start_time = datetime.now(timezone.utc)

        # ----------------------------------------------------
        # STEP 1: Tool 1 - analyze_civic_image
        # ----------------------------------------------------
        t1_start = datetime.now(timezone.utc)
        step1_thought = "Analyzing image visual features and inspecting binary for EXIF GPS metadata."
        vision_result = analyze_civic_image(image_input, user_description)
        
        reasoning_trace.append({
            "step": 1,
            "tool": "analyze_civic_image",
            "title": "Visual Analysis & EXIF Extraction",
            "thought": step1_thought,
            "inputs": {
                "user_description": user_description,
                "has_image": bool(image_input)
            },
            "output": {
                "issue_category": vision_result["issue_category"],
                "severity": vision_result["severity"],
                "confidence": vision_result["confidence"],
                "detected_features": vision_result["detected_features"],
                "exif_metadata": vision_result["exif_metadata"]
            },
            "duration_ms": int((datetime.now(timezone.utc) - t1_start).total_seconds() * 1000)
        })

        # Determine best coordinates / location
        exif = vision_result.get("exif_metadata", {})
        lat = exif.get("latitude")
        lon = exif.get("longitude")
        location_query = user_location or exif.get("suggested_location") or "Bodakdev, Ahmedabad"

        # ----------------------------------------------------
        # STEP 2: Tool 2 - resolve_ward_and_department
        # ----------------------------------------------------
        t2_start = datetime.now(timezone.utc)
        step2_thought = f"Mapping geographic location '{location_query}' (Lat: {lat}, Lon: {lon}) to AMC municipal jurisdiction and matching '{vision_result['issue_category']}' to responsible department."
        
        geo_result = resolve_ward_and_department(
            location_query=location_query,
            latitude=lat,
            longitude=lon,
            issue_category=vision_result["issue_category"]
        )

        reasoning_trace.append({
            "step": 2,
            "tool": "resolve_ward_and_department",
            "title": "Municipal Ward & Department Routing",
            "thought": step2_thought,
            "inputs": {
                "location_query": location_query,
                "latitude": lat,
                "longitude": lon,
                "issue_category": vision_result["issue_category"]
            },
            "output": {
                "zone": geo_result["zone"],
                "ward_name": geo_result["ward_name"],
                "department_name": geo_result["department_name"],
                "sla_resolution_hours": geo_result["sla_resolution_hours"],
                "officer_in_charge": geo_result["officer_in_charge"]
            },
            "duration_ms": int((datetime.now(timezone.utc) - t2_start).total_seconds() * 1000)
        })

        # ----------------------------------------------------
        # STEP 3: Tool 3 - file_municipal_complaint
        # ----------------------------------------------------
        t3_start = datetime.now(timezone.utc)
        step3_thought = f"Synthesizing incident summary and registering ticket into AMC grievance database with {geo_result['sla_resolution_hours']}h SLA countdown."
        
        clean_desc = user_description or vision_result["visual_reasoning"]
        
        file_result = file_municipal_complaint(
            issue_category=vision_result["issue_category"],
            severity=vision_result["severity"],
            description=clean_desc,
            address=location_query,
            latitude=lat or geo_result["ward_coordinates"]["latitude"],
            longitude=lon or geo_result["ward_coordinates"]["longitude"],
            ward_id=geo_result["ward_id"],
            department_id=geo_result["assigned_department_id"],
            citizen_name=citizen_name,
            citizen_phone=citizen_phone,
            image_url=vision_result.get("image_url")
        )

        reasoning_trace.append({
            "step": 3,
            "tool": "file_municipal_complaint",
            "title": "Municipal Ticket Creation",
            "thought": step3_thought,
            "inputs": {
                "issue_category": vision_result["issue_category"],
                "severity": vision_result["severity"],
                "ward_id": geo_result["ward_id"],
                "department_id": geo_result["assigned_department_id"]
            },
            "output": {
                "tracking_id": file_result["tracking_id"],
                "status": file_result["complaint_status"],
                "sla_deadline": file_result["sla_deadline"],
                "assigned_officer": file_result["assigned_officer"]
            },
            "duration_ms": int((datetime.now(timezone.utc) - t3_start).total_seconds() * 1000)
        })

        # ----------------------------------------------------
        # STEP 4: Tool 4 - generate_social_advocacy_post
        # ----------------------------------------------------
        t4_start = datetime.now(timezone.utc)
        step4_thought = f"Drafting public accountability social media post with official tags for @AmdavadAMC and local corporator {geo_result['elected_representative']['twitter_handle']}."
        
        social_result = generate_social_advocacy_post(file_result["tracking_id"])

        reasoning_trace.append({
            "step": 4,
            "tool": "generate_social_advocacy_post",
            "title": "Public Accountability & Social Advocacy",
            "thought": step4_thought,
            "inputs": {
                "tracking_id": file_result["tracking_id"]
            },
            "output": {
                "twitter_preview": social_result["advocacy_package"]["twitter_text"],
                "twitter_intent_url": social_result["advocacy_package"]["twitter_intent_url"],
                "tagged_handles": social_result["advocacy_package"]["tagged_handles"]
            },
            "duration_ms": int((datetime.now(timezone.utc) - t4_start).total_seconds() * 1000)
        })

        total_ms = int((datetime.now(timezone.utc) - start_time).total_seconds() * 1000)

        return {
            "success": True,
            "ticket": file_result,
            "issue_category": vision_result["issue_category"],
            "severity": vision_result["severity"],
            "ward_name": geo_result["ward_name"],
            "zone": geo_result["zone"],
            "department_name": geo_result["department_name"],
            "social_advocacy": social_result["advocacy_package"],
            "reasoning_trace": reasoning_trace,
            "execution_time_ms": total_ms
        }

    def process_chat_message(self, message: str, attached_image: Optional[str] = None) -> Dict[str, Any]:
        """
        Conversational reasoning loop: parses citizen natural language intent,
        calls appropriate tools, and generates human-like empathetic responses.
        """
        clean_msg = message.strip()
        tools_executed = []

        # Intent 1: Check ticket status
        # Match pattern like AMC-2026-WZ-88412 or 88412 or "status"
        ticket_match = re.search(r"AMC-2026-[A-Z]{2}-\d{5}", clean_msg, re.IGNORECASE)
        is_status_query = bool(ticket_match) or any(w in clean_msg.lower() for w in ["status", "track", "what happened to", "update on", "check ticket"])

        if is_status_query:
            tracking_id = None
            if ticket_match:
                tracking_id = ticket_match.group(0).upper()
            else:
                # Check for 5 digit number
                digit_match = re.search(r"\b\d{5}\b", clean_msg)
                if digit_match:
                    from app.database.db import get_db
                    conn = get_db()
                    cur = conn.cursor()
                    cur.execute("SELECT tracking_id FROM complaints WHERE tracking_id LIKE ?", (f"%{digit_match.group(0)}%",))
                    row = cur.fetchone()
                    conn.close()
                    if row:
                        tracking_id = row["tracking_id"]

            if tracking_id:
                status_res = fetch_ticket_status(tracking_id)
                tools_executed.append({
                    "tool": "fetch_ticket_status",
                    "inputs": {"tracking_id": tracking_id},
                    "output": status_res
                })

                if status_res["status"] == "success":
                    cur_st = status_res["current_status"]
                    rem = status_res["sla_hours_remaining"]
                    time_txt = f"{rem} hours remaining" if rem > 0 else f"⚠️ SLA BREACHED by {abs(rem)} hours!"
                    
                    response_text = (
                        f"### 📋 Grievance Status: **{tracking_id}**\n\n"
                        f"• **Current Status:** `{cur_st}`\n"
                        f"• **Issue:** {status_res['severity']} {status_res['issue_category']} at {status_res['address']}\n"
                        f"• **Ward & Dept:** {status_res['ward_name']} ({status_res['zone']}) • {status_res['department_name']}\n"
                        f"• **Assigned Officer:** {status_res['assigned_officer']} (📞 {status_res['officer_contact']})\n"
                        f"• **SLA Clock:** {time_txt}\n\n"
                        f"**Latest Update:** {status_res['citizen_summary']}\n"
                    )

                    if status_res.get("can_escalate"):
                        response_text += "\n> 🚨 **Action Available:** This ticket has breached its resolution SLA. You can escalate this directly to the Deputy Municipal Commissioner."

                    return {
                        "reply": response_text,
                        "tools_called": tools_executed,
                        "ticket_data": status_res
                    }
                else:
                    return {
                        "reply": f"🔍 I checked AMC municipal records, but could not find a ticket matching `{tracking_id}`. Please double check the ID (e.g. `AMC-2026-WZ-88412`).",
                        "tools_called": tools_executed
                    }
            else:
                return {
                    "reply": "I'd be glad to track your complaint! Please provide your official AMC Tracking ID (for example: `AMC-2026-WZ-88412`).",
                    "tools_called": []
                }

        # Intent 2: File complaint via chat (photo attached or description of issue)
        if attached_image or any(w in clean_msg.lower() for w in ["pothole", "garbage", "waterlogging", "streetlight", "broken road", "report", "complain", "file"]):
            # Extract possible location in text
            loc_match = re.search(r"(?:near|at|in|on)\s+([A-Za-z0-9\s]+?)(?:[\.,;]|$)", clean_msg, re.IGNORECASE)
            extracted_loc = loc_match.group(1).strip() if loc_match else "Ahmedabad"

            # Use sample image if none attached
            image_to_use = attached_image or "sample-pothole-1"
            
            pipeline_result = self.execute_full_filing_pipeline(
                image_input=image_to_use,
                user_location=extracted_loc if extracted_loc != "Ahmedabad" else None,
                user_description=clean_msg
            )

            ticket = pipeline_result["ticket"]
            advocacy = pipeline_result["social_advocacy"]

            reply = (
                f"### ✅ Complaint Officially Filed with AMC!\n\n"
                f"I've analyzed your report and successfully registered the grievance in the Ahmedabad Municipal Corporation system:\n\n"
                f"• **Tracking ID:** `{ticket['tracking_id']}`\n"
                f"• **Category:** {pipeline_result['severity']} {pipeline_result['issue_category']}\n"
                f"• **Assigned Ward:** {pipeline_result['ward_name']} ({pipeline_result['zone']})\n"
                f"• **Responsible Dept:** {pipeline_result['department_name']}\n"
                f"• **Assigned Officer:** {ticket['assigned_officer']} (📞 {ticket['officer_contact']})\n"
                f"• **Guaranteed SLA:** {ticket['sla_hours']} Hours (Deadline: {ticket['sla_deadline'][:16].replace('T', ' ')} UTC)\n\n"
                f"**Public Accountability Post Drafted:**\n"
                f"> *\"{advocacy['twitter_text']}\"*\n\n"
                f"[🔗 Click here to Post on X / Twitter]({advocacy['twitter_intent_url']})\n\n"
                f"You can ask me anytime: *'What's the status of {ticket['tracking_id']}?'*"
            )

            return {
                "reply": reply,
                "tools_called": pipeline_result["reasoning_trace"],
                "ticket_data": ticket,
                "social_advocacy": advocacy
            }

        # Intent 3: General Municipal Info / Help
        return {
            "reply": (
                "👋 Hello! I am **CivicPulse AI**, your autonomous municipal grievance agent for Ahmedabad Municipal Corporation (AMC).\n\n"
                "Here is how I can help you:\n"
                "1. **File a Civic Complaint:** Upload or drop a photo of a pothole, garbage dump, waterlogging, or broken streetlight. I will inspect the image, map the ward & department, and file your ticket.\n"
                "2. **Track Live Status:** Ask *\"What's the status of ticket AMC-2026-WZ-88412?\"* to inspect live inspection logs and SLA timers.\n"
                "3. **Public Advocacy:** I generate pre-tagged posts for X/Twitter and Instagram to hold civic officials accountable.\n\n"
                "How would you like to begin?"
            ),
            "tools_called": []
        }

agent_instance = CivicComplaintAgent()
