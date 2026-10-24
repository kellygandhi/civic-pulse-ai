import base64

# Lightweight realistic SVG illustrations encoded as base64 data URLs for guaranteed offline demoing

def _create_svg_data_url(svg_content: str) -> str:
    encoded = base64.b64encode(svg_content.encode('utf-8')).decode('utf-8')
    return f"data:image/svg+xml;base64,{encoded}"

POTHOLE_SVG = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="100%" height="100%">
  <defs>
    <linearGradient id="road" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#374151"/>
      <stop offset="100%" stop-color="#1f2937"/>
    </linearGradient>
    <radialGradient id="hole" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="70%" stop-color="#1e293b"/>
      <stop offset="100%" stop-color="#334155"/>
    </radialGradient>
  </defs>
  <rect width="600" height="400" fill="url(#road)"/>
  <!-- Road markings -->
  <line x1="30" y1="200" x2="160" y2="200" stroke="#facc15" stroke-width="8" stroke-dasharray="20,15"/>
  <line x1="440" y1="200" x2="570" y2="200" stroke="#facc15" stroke-width="8" stroke-dasharray="20,15"/>
  <!-- Pothole crater -->
  <ellipse cx="300" cy="220" rx="140" ry="75" fill="url(#hole)" stroke="#090d16" stroke-width="4"/>
  <path d="M 180,210 Q 230,170 310,180 Q 390,190 420,230 Q 380,280 280,270 Q 190,260 180,210 Z" fill="#090d16"/>
  <!-- Exposed gravel / rubble -->
  <circle cx="250" cy="225" r="8" fill="#64748b"/>
  <circle cx="280" cy="240" r="12" fill="#475569"/>
  <circle cx="340" cy="220" r="10" fill="#64748b"/>
  <circle cx="320" cy="245" r="6" fill="#94a3b8"/>
  <path d="M 220,195 Q 260,205 290,190" stroke="#475569" stroke-width="3" fill="none"/>
  <!-- Hazard tag -->
  <rect x="20" y="20" width="220" height="40" rx="8" fill="#ef4444" opacity="0.9"/>
  <text x="30" y="46" font-family="sans-serif" font-weight="bold" font-size="16" fill="#ffffff">🚨 CRITICAL ROAD CRATER</text>
  <text x="20" y="375" font-family="monospace" font-size="14" fill="#9ca3af">GPS: 23.0384° N, 72.5284° E | Judges Bungalow Rd</text>
</svg>"""

GARBAGE_SVG = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="100%" height="100%">
  <defs>
    <linearGradient id="ground" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#4b5563"/>
      <stop offset="100%" stop-color="#374151"/>
    </linearGradient>
  </defs>
  <rect width="600" height="400" fill="url(#ground)"/>
  <!-- Sidewalk curb -->
  <rect x="0" y="120" width="600" height="20" fill="#9ca3af"/>
  <rect x="0" y="0" width="600" height="120" fill="#1e293b"/>
  <!-- Overflowing green dumpster -->
  <rect x="180" y="100" width="240" height="180" rx="10" fill="#15803d" stroke="#166534" stroke-width="4"/>
  <rect x="160" y="85" width="280" height="25" rx="5" fill="#166534"/>
  <text x="250" y="200" font-family="sans-serif" font-weight="bold" font-size="18" fill="#ffffff">AMC SWM</text>
  <!-- Overflowing garbage piles -->
  <path d="M 120,340 C 150,230 250,210 320,240 C 380,210 460,230 500,340 Z" fill="#78350f" opacity="0.9"/>
  <!-- Plastic bags & debris -->
  <circle cx="210" cy="280" r="22" fill="#38bdf8"/>
  <circle cx="260" cy="310" r="18" fill="#facc15"/>
  <circle cx="380" cy="290" r="25" fill="#ef4444"/>
  <circle cx="330" cy="320" r="20" fill="#e2e8f0"/>
  <circle cx="430" cy="315" r="16" fill="#a855f7"/>
  <!-- Flies / biohazard alert -->
  <rect x="20" y="20" width="240" height="40" rx="8" fill="#eab308" opacity="0.9"/>
  <text x="30" y="46" font-family="sans-serif" font-weight="bold" font-size="16" fill="#000000">⚠️ SOLID WASTE OVERFLOW</text>
  <text x="20" y="375" font-family="monospace" font-size="14" fill="#d1d5db">GPS: 23.0365° N, 72.5295° E | Vastrapur Lake</text>
</svg>"""

WATERLOGGING_SVG = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="100%" height="100%">
  <defs>
    <linearGradient id="sky" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1e293b"/>
      <stop offset="100%" stop-color="#334155"/>
    </linearGradient>
    <linearGradient id="water" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0284c7" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="#0369a1"/>
    </linearGradient>
  </defs>
  <rect width="600" height="400" fill="url(#sky)"/>
  <!-- Submerged road with ripples -->
  <rect x="0" y="160" width="600" height="240" fill="url(#water)"/>
  <ellipse cx="200" cy="250" rx="90" ry="15" fill="none" stroke="#bae6fd" stroke-width="2" opacity="0.7"/>
  <ellipse cx="420" cy="290" rx="120" ry="20" fill="none" stroke="#bae6fd" stroke-width="3" opacity="0.6"/>
  <ellipse cx="150" cy="330" rx="70" ry="12" fill="none" stroke="#e0f2fe" stroke-width="2" opacity="0.8"/>
  <!-- Submerged traffic divider -->
  <rect x="280" y="140" width="40" height="70" fill="#f59e0b"/>
  <rect x="280" y="170" width="40" height="15" fill="#ffffff"/>
  <!-- Alert -->
  <rect x="20" y="20" width="260" height="40" rx="8" fill="#3b82f6" opacity="0.9"/>
  <text x="30" y="46" font-family="sans-serif" font-weight="bold" font-size="16" fill="#ffffff">🌊 SEVERE WATERLOGGING</text>
  <text x="20" y="375" font-family="monospace" font-size="14" fill="#bae6fd">GPS: 23.0360° N, 72.5590° E | Navrangpura Road</text>
</svg>"""

STREETLIGHT_SVG = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="100%" height="100%">
  <rect width="600" height="400" fill="#090d16"/>
  <!-- Night sky stars -->
  <circle cx="100" cy="80" r="2" fill="#ffffff" opacity="0.6"/>
  <circle cx="480" cy="60" r="1.5" fill="#ffffff" opacity="0.5"/>
  <circle cx="320" cy="110" r="2" fill="#ffffff" opacity="0.7"/>
  <!-- Leaning / broken lamp post -->
  <path d="M 280,380 L 260,120 L 210,100" stroke="#64748b" stroke-width="12" stroke-linecap="round" fill="none"/>
  <!-- Broken light fixture with dangling wire -->
  <ellipse cx="200" cy="105" rx="20" ry="12" fill="#334155" stroke="#475569" stroke-width="2"/>
  <path d="M 200,115 Q 215,145 195,170" stroke="#ef4444" stroke-width="3" fill="none"/>
  <path d="M 205,115 Q 185,150 205,185" stroke="#facc15" stroke-width="2" fill="none"/>
  <!-- Alert -->
  <rect x="20" y="20" width="270" height="40" rx="8" fill="#f97316" opacity="0.9"/>
  <text x="30" y="46" font-family="sans-serif" font-weight="bold" font-size="16" fill="#ffffff">💡 BROKEN STREETLIGHT OUTAGE</text>
  <text x="20" y="375" font-family="monospace" font-size="14" fill="#94a3b8">GPS: 23.0450° N, 72.5710° E | CG Road / Usmanpura</text>
</svg>"""

SAMPLE_CIVIC_DATASET = [
    {
        "id": "sample-pothole-1",
        "title": "Severe Pothole on Judges Bungalow Road",
        "issue_category": "Pothole",
        "severity": "High",
        "description": "Deep 1.2m pothole crater with exposed aggregate in middle lane. Severe hazard for two-wheelers and night traffic.",
        "location": "Judges Bungalow Road, Bodakdev, Ahmedabad",
        "latitude": 23.0384,
        "longitude": 72.5284,
        "ward_id": 12,
        "ward_name": "Bodakdev - Vastrapur",
        "zone": "West Zone",
        "department_id": "DEPT_ROADS",
        "department_name": "Roads & Bridges Department",
        "dataset_source": "Roboflow Road Pothole Benchmark",
        "image_data_url": _create_svg_data_url(POTHOLE_SVG)
    },
    {
        "id": "sample-garbage-2",
        "title": "Illegal Solid Waste Overflow at Vastrapur Lake",
        "issue_category": "Garbage / Solid Waste",
        "severity": "Medium",
        "description": "Massive overflow of non-segregated household and commercial municipal solid waste blocking pedestrian sidewalk.",
        "location": "Vastrapur Lake Outer Ring Road, Ahmedabad",
        "latitude": 23.0365,
        "longitude": 72.5295,
        "ward_id": 12,
        "ward_name": "Bodakdev - Vastrapur",
        "zone": "West Zone",
        "department_id": "DEPT_SWM",
        "department_name": "Solid Waste Management Department",
        "dataset_source": "Mendeley Indian Street Civic Issues Dataset",
        "image_data_url": _create_svg_data_url(GARBAGE_SVG)
    },
    {
        "id": "sample-waterlogging-3",
        "title": "Severe Monsoon Waterlogging on University Road",
        "issue_category": "Waterlogging & Drainage",
        "severity": "Critical",
        "description": "Knee-deep water accumulation due to blocked stormwater drains, paralyzing two-lane arterial road.",
        "location": "Commerce Six Roads, Navrangpura, Ahmedabad",
        "latitude": 23.0360,
        "longitude": 72.5590,
        "ward_id": 7,
        "ward_name": "Navrangpura - University",
        "zone": "West Zone",
        "department_id": "DEPT_DRAIN",
        "department_name": "Drainage & Stormwater Department",
        "dataset_source": "Mendeley Urban Civic Drainage Benchmark",
        "image_data_url": _create_svg_data_url(WATERLOGGING_SVG)
    },
    {
        "id": "sample-streetlight-4",
        "title": "Non-functional Damaged Streetlight on CG Road",
        "issue_category": "Streetlight Outage",
        "severity": "Medium",
        "description": "Damaged tilted street pole with severed wiring, causing 100-meter dark corridor near commercial hub.",
        "location": "CG Road, Navrangpura / Usmanpura, Ahmedabad",
        "latitude": 23.0450,
        "longitude": 72.5710,
        "ward_id": 10,
        "ward_name": "Usmanpura - Ashram Road",
        "zone": "West Zone",
        "department_id": "DEPT_ELEC",
        "department_name": "Street Lighting & Electrical Department",
        "dataset_source": "Urban Municipal Assets Survey",
        "image_data_url": _create_svg_data_url(STREETLIGHT_SVG)
    }
]

def get_sample_dataset():
    return SAMPLE_CIVIC_DATASET

def get_sample_by_id(sample_id: str):
    for item in SAMPLE_CIVIC_DATASET:
        if item["id"] == sample_id:
            return item
    return SAMPLE_CIVIC_DATASET[0]
