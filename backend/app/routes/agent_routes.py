from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from app.core.agent import agent_instance

router = APIRouter(prefix="/api/agent", tags=["Civic Agent"])

class FileComplaintRequest(BaseModel):
    image_input: str = Field(..., description="Base64 data URL, sample ID, or image identifier")
    location_query: Optional[str] = Field(None, description="Citizen-specified location or landmark (e.g. Vastrapur, SG Highway)")
    description: Optional[str] = Field(None, description="Optional description of the issue")
    citizen_name: Optional[str] = Field("Verified Citizen", description="Name of citizen")
    citizen_phone: Optional[str] = Field("+91 98250 12345", description="Citizen contact phone")

class ChatMessageRequest(BaseModel):
    message: str = Field(..., description="Citizen natural language question or command")
    attached_image: Optional[str] = Field(None, description="Optional image input")

@router.post("/file-complaint")
async def file_complaint_endpoint(req: FileComplaintRequest):
    """
    Triggers the autonomous Civic Agent tool chain:
    1. analyze_civic_image
    2. resolve_ward_and_department
    3. file_municipal_complaint
    4. generate_social_advocacy_post
    """
    try:
        result = agent_instance.execute_full_filing_pipeline(
            image_input=req.image_input,
            user_location=req.location_query,
            user_description=req.description,
            citizen_name=req.citizen_name or "Verified Citizen",
            citizen_phone=req.citizen_phone or "+91 98250 12345"
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agent filing failed: {str(e)}")

@router.post("/chat")
async def chat_endpoint(req: ChatMessageRequest):
    """
    Conversational Agent interface with step-by-step tool reasoning transparency.
    """
    try:
        result = agent_instance.process_chat_message(
            message=req.message,
            attached_image=req.attached_image
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agent chat processing failed: {str(e)}")

@router.get("/tools")
async def get_tools_metadata():
    """
    Returns registered agent tools metadata for transparency and developer inspection.
    """
    return {
        "tools": [
            {
                "name": "analyze_civic_image",
                "purpose": "Multimodal computer vision and EXIF GPS parser for civic street hazards",
                "parameters": ["image_input", "user_description"]
            },
            {
                "name": "resolve_ward_and_department",
                "purpose": "Geospatial boundary and municipal routing engine for Ahmedabad Municipal Corporation",
                "parameters": ["location_query", "latitude", "longitude", "issue_category"]
            },
            {
                "name": "file_municipal_complaint",
                "purpose": "Official grievance ticket creation in AMC database with SLA initialization",
                "parameters": ["issue_category", "severity", "description", "address", "ward_id", "department_id"]
            },
            {
                "name": "generate_social_advocacy_post",
                "purpose": "Generates public accountability social media drafts and Twitter Web Intent links",
                "parameters": ["tracking_id"]
            },
            {
                "name": "fetch_ticket_status",
                "purpose": "Queries live municipal lifecycle state, inspection logs, and SLA countdown",
                "parameters": ["tracking_id"]
            }
        ]
    }
