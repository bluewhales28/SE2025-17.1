"""
Certificate template configurations
"""

DEFAULT_TEMPLATE = {
    "name": "default",
    "title_font_size": 36,
    "name_font_size": 24,
    "body_font_size": 14,
    "title_color": "#2C3E50",
    "name_color": "#3498DB",
    "border_color": "#ECF0F1",
    "signature_position": "bottom_right",
}

MODERN_TEMPLATE = {
    "name": "modern",
    "title_font_size": 40,
    "name_font_size": 28,
    "body_font_size": 16,
    "title_color": "#1ABC9C",
    "name_color": "#2C3E50",
    "border_color": "#16A085",
    "signature_position": "bottom_center",
}

CLASSIC_TEMPLATE = {
    "name": "classic",
    "title_font_size": 32,
    "name_font_size": 22,
    "body_font_size": 12,
    "title_color": "#8B4513",
    "name_color": "#000000",
    "border_color": "#D2691E",
    "signature_position": "bottom_left",
}

TEMPLATES = {
    "default": DEFAULT_TEMPLATE,
    "modern": MODERN_TEMPLATE,
    "classic": CLASSIC_TEMPLATE,
}


def get_template(template_name: str = "default"):
    """Get certificate template configuration"""
    return TEMPLATES.get(template_name, DEFAULT_TEMPLATE)
