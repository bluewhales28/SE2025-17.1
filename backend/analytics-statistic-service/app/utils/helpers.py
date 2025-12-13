"""
Utility functions for the analytics service
"""

import hashlib
from datetime import datetime
from typing import Any, Dict, List


def generate_certificate_number(student_id: int, quiz_id: int) -> str:
    """
    Generate a unique certificate number

    Args:
        student_id: Student ID
        quiz_id: Quiz ID

    Returns:
        Unique certificate number
    """
    timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
    data = f"{student_id}:{quiz_id}:{timestamp}"
    hash_value = hashlib.md5(data.encode(), usedforsecurity=False).hexdigest()[:8].upper()
    return f"CERT-{timestamp}-{hash_value}"


def format_time_duration(seconds: int) -> str:
    """
    Format time duration in human-readable format

    Args:
        seconds: Time in seconds

    Returns:
        Formatted string (e.g., "2h 30m 15s")
    """
    hours = seconds // 3600
    minutes = (seconds % 3600) // 60
    secs = seconds % 60

    parts = []
    if hours > 0:
        parts.append(f"{hours}h")
    if minutes > 0:
        parts.append(f"{minutes}m")
    if secs > 0 or not parts:
        parts.append(f"{secs}s")

    return " ".join(parts)


def calculate_grade_letter(score: float) -> str:
    """
    Calculate letter grade from score

    Args:
        score: Numeric score (0-100)

    Returns:
        Letter grade (A, B, C, D, F)
    """
    if score >= 90:
        return "A"
    elif score >= 80:
        return "B"
    elif score >= 70:
        return "C"
    elif score >= 60:
        return "D"
    else:
        return "F"


def paginate_results(
    items: List[Any], page: int = 1, page_size: int = 10
) -> Dict[str, Any]:
    """
    Paginate a list of items

    Args:
        items: List of items to paginate
        page: Page number (1-indexed)
        page_size: Number of items per page

    Returns:
        Dictionary with paginated results
    """
    total = len(items)
    total_pages = (total + page_size - 1) // page_size
    start = (page - 1) * page_size
    end = start + page_size

    return {
        "items": items[start:end],
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
        "has_next": page < total_pages,
        "has_prev": page > 1,
    }
