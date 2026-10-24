import urllib.parse
from typing import Dict, Any
from app.config import OFFICIAL_TWITTER_HANDLE, OFFICIAL_MAYOR_HANDLE, OFFICIAL_COMMISSIONER_HANDLE

def generate_social_advocacy_drafts(complaint_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Generates tailored public accountability posts for Twitter/X, Instagram,
    and WhatsApp with official municipal corporation tags and web intent URLs.
    """
    tracking_id = complaint_data.get("tracking_id", "AMC-PENDING")
    issue_cat = complaint_data.get("issue_category", "Civic Issue")
    address = complaint_data.get("address", "Ahmedabad")
    ward_name = complaint_data.get("ward_name", "Local Ward")
    zone = complaint_data.get("zone", "AMC Zone")
    severity = complaint_data.get("severity", "High")
    dept_name = complaint_data.get("department_name", "AMC Department")
    sla_hours = complaint_data.get("sla_hours", 48)
    corporator_handle = complaint_data.get("corporator_handle") or "@AMC_WardOffice"

    # Emoji mapping
    emoji_map = {
        "Pothole": "🚨🕳️",
        "Garbage / Solid Waste": "🗑️⚠️",
        "Streetlight Outage": "💡❌",
        "Waterlogging & Drainage": "💧🌊",
        "Broken Footpath / Manhole": "⚠️🚧"
    }
    emoji = emoji_map.get(issue_cat, "⚠️📢")

    # 1. Twitter / X Post Text (concise, high impact, under 280 chars)
    tweet_text = (
        f"{emoji} CIVIC ALERT: Serious {issue_cat} ({severity} Severity) at {address}.\n"
        f"Assigned: {ward_name} ({zone}) | Dept: {dept_name}.\n"
        f"Grievance Ticket #{tracking_id} (SLA: {sla_hours}h).\n"
        f"Requesting urgent action: @{OFFICIAL_TWITTER_HANDLE} @{OFFICIAL_MAYOR_HANDLE} {corporator_handle}."
    )

    # Twitter Web Intent URL
    encoded_tweet = urllib.parse.quote(tweet_text)
    hashtags = "AmdavadAMC,RoadSafety,CivicAction,CleanAhmedabad"
    twitter_web_intent = f"https://twitter.com/intent/tweet?text={encoded_tweet}&hashtags={hashtags}"

    # 2. Instagram / Facebook Post Caption (detailed, storytelling, community hashtags)
    instagram_caption = (
        f"{emoji} PUBLIC ACCOUNTABILITY NOTICE: {issue_cat.upper()}\n\n"
        f"📍 Location: {address}\n"
        f"🏛️ Municipal Ward: {ward_name} ({zone})\n"
        f"🛠️ Responsible Dept: {dept_name}\n"
        f"🎫 Official Ticket ID: {tracking_id}\n"
        f"⏱️ Guaranteed SLA: {sla_hours} Hours\n"
        f"🔥 Severity Level: {severity.upper()}\n\n"
        f"Citizens have officially filed this civic hazard with Ahmedabad Municipal Corporation (AMC). "
        f"We request our local ward inspector and elected corporator {corporator_handle} to ensure "
        f"remediation before the SLA window lapses.\n\n"
        f"Tagging authorities for public transparency:\n"
        f"@{OFFICIAL_TWITTER_HANDLE} @{OFFICIAL_MAYOR_HANDLE} @{OFFICIAL_COMMISSIONER_HANDLE}\n\n"
        f"#SwachhBharat #AmdavadAMC #AhmedabadCivic #SmartCityAhmedabad #BetterStreets #CivicPulseAI"
    )

    # 3. WhatsApp Resident Alert (for RWA / neighborhood resident groups)
    whatsapp_message = (
        f"📢 *Civic Hazard Report Filed - {ward_name}*\n"
        f"----------------------------------------\n"
        f"• *Issue:* {issue_cat} ({severity} Severity)\n"
        f"• *Location:* {address}\n"
        f"• *Ticket ID:* `{tracking_id}`\n"
        f"• *AMC Dept:* {dept_name}\n"
        f"• *SLA Resolution Target:* {sla_hours} Hours\n\n"
        f"Please reference Ticket `{tracking_id}` when following up with Ward 12/AMC control room.\n"
        f"Powered by CivicPulse AI Citizen Network."
    )
    encoded_wa = urllib.parse.quote(whatsapp_message)
    whatsapp_web_intent = f"https://api.whatsapp.com/send?text={encoded_wa}"

    return {
        "tracking_id": tracking_id,
        "twitter_text": tweet_text,
        "twitter_intent_url": twitter_web_intent,
        "instagram_caption": instagram_caption,
        "whatsapp_message": whatsapp_message,
        "whatsapp_intent_url": whatsapp_web_intent,
        "tagged_handles": [f"@{OFFICIAL_TWITTER_HANDLE}", f"@{OFFICIAL_MAYOR_HANDLE}", corporator_handle],
        "hashtags": ["#AmdavadAMC", "#RoadSafety", "#CleanAhmedabad", "#CivicAction"]
    }
