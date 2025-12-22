import requests
from typing import Dict, Any, Optional, BinaryIO
from app.core import config
import logging

logger = logging.getLogger(__name__)

class NotificationServiceClient:
    """HTTP client for Notification Service"""
    
    def __init__(self):
        self.base_url = config.NOTIFICATION_SERVICE_URL if hasattr(config, 'NOTIFICATION_SERVICE_URL') else "http://notification-service:8082"
        self.timeout = 5
    
    def send_certificate(
        self,
        email: str,
        student_name: str,
        quiz_name: str,
        certificate_pdf: BinaryIO
    ) -> bool:
        """Send certificate via email"""
        try:
            files = {
                'certificate': ('certificate.pdf', certificate_pdf, 'application/pdf')
            }
            data = {
                'email': email,
                'subject': f'Certificate of Completion - {quiz_name}',
                'body': f'Congratulations {student_name}! You have completed {quiz_name}.',
                'type': 'certificate'
            }
            
            response = requests.post(
                f"{self.base_url}/notifications/send-certificate",
                files=files,
                data=data,
                timeout=self.timeout
            )
            response.raise_for_status()
            return True
        except Exception as e:
            logger.error(f"Failed to send certificate: {e}")
            raise
    
    def send_admin_alert(
        self,
        alert_type: str,
        severity: str,
        message: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> bool:
        """Send alert to admin dashboard"""
        try:
            payload = {
                'type': alert_type,
                'severity': severity,
                'message': message,
                'metadata': metadata or {}
            }
            
            response = requests.post(
                f"{self.base_url}/notifications/admin-alert",
                json=payload,
                timeout=self.timeout
            )
            response.raise_for_status()
            return True
        except Exception as e:
            logger.error(f"Failed to send admin alert: {e}")
            raise

class ClassServiceClient:
    """HTTP client for Class Service"""
    
    def __init__(self):
        self.base_url = config.CLASS_SERVICE_URL if hasattr(config, 'CLASS_SERVICE_URL') else "http://class-service:8080"
        self.timeout = 5
    
    def get_class_info(self, class_id: int) -> Optional[Dict[str, Any]]:
        """Get class information"""
        try:
            response = requests.get(
                f"{self.base_url}/classes/{class_id}",
                timeout=self.timeout
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Failed to get class info: {e}")
            return None
    
    def get_class_students(self, class_id: int) -> list:
        """Get list of students in class"""
        try:
            response = requests.get(
                f"{self.base_url}/classes/{class_id}/students",
                timeout=self.timeout
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Failed to get class students: {e}")
            return []

