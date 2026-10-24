import io
from PIL import Image
from PIL.ExifTags import TAGS, GPSTAGS
from typing import Optional, Tuple, Dict, Any

def _convert_to_degrees(value) -> float:
    """Helper function to convert GPS coordinates stored in EXIF (degrees, minutes, seconds) to decimal degrees."""
    d = float(value[0])
    m = float(value[1])
    s = float(value[2])
    return d + (m / 60.0) + (s / 3600.0)

def extract_exif_metadata(image_bytes: bytes) -> Dict[str, Any]:
    """
    Extracts EXIF metadata including GPS coordinates, capture timestamp,
    and camera details from image bytes.
    """
    result = {
        "has_gps": False,
        "latitude": None,
        "longitude": None,
        "captured_at": None,
        "camera_make": None,
        "camera_model": None,
        "resolution": None
    }

    try:
        image = Image.open(io.BytesIO(image_bytes))
        result["resolution"] = f"{image.width}x{image.height}"
        
        exif_raw = image._getexif()
        if not exif_raw:
            return result

        exif_data = {}
        for tag_id, value in exif_raw.items():
            tag_name = TAGS.get(tag_id, tag_id)
            exif_data[tag_name] = value

        # Timestamp
        result["captured_at"] = exif_data.get("DateTimeOriginal") or exif_data.get("DateTime")
        result["camera_make"] = exif_data.get("Make")
        result["camera_model"] = exif_data.get("Model")

        # GPS Info
        gps_info = exif_data.get("GPSInfo")
        if gps_info:
            gps_tags = {}
            for key in gps_info.keys():
                sub_tag = GPSTAGS.get(key, key)
                gps_tags[sub_tag] = gps_info[key]

            lat_val = gps_tags.get("GPSLatitude")
            lat_ref = gps_tags.get("GPSLatitudeRef")
            lon_val = gps_tags.get("GPSLongitude")
            lon_ref = gps_tags.get("GPSLongitudeRef")

            if lat_val and lat_ref and lon_val and lon_ref:
                lat = _convert_to_degrees(lat_val)
                if lat_ref != "N":
                    lat = -lat

                lon = _convert_to_degrees(lon_val)
                if lon_ref != "E":
                    lon = -lon

                result["latitude"] = round(lat, 6)
                result["longitude"] = round(lon, 6)
                result["has_gps"] = True

    except Exception as e:
        result["error"] = str(e)

    return result
