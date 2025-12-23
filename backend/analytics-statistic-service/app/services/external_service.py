"""
External service clients for Quiz, Class, and Notification services
"""

from typing import Any, Dict, List, Optional

import httpx
from tenacity import retry, stop_after_attempt, wait_exponential

from app.config import settings


class BaseServiceClient:
    """Base client for external services"""

    def __init__(self, base_url: str):
        self.base_url = base_url
        self.timeout = httpx.Timeout(30.0)

    @retry(
        stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10)
    )
    async def _request(
        self,
        method: str,
        endpoint: str,
        headers: Optional[Dict[str, str]] = None,
        **kwargs,
    ) -> Optional[Dict[str, Any]]:
        """
        Make HTTP request with retry logic

        Args:
            method: HTTP method
            endpoint: API endpoint
            headers: Optional headers
            **kwargs: Additional request arguments

        Returns:
            Response data or None on error
        """
        url = f"{self.base_url}{endpoint}"

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            try:
                response = await client.request(
                    method=method, url=url, headers=headers, **kwargs
                )
                response.raise_for_status()
                return response.json()
            except httpx.HTTPError as e:
                print(f"HTTP error occurred: {e}")
                return None
            except Exception as e:
                print(f"Unexpected error: {e}")
                return None


class QuizServiceClient(BaseServiceClient):
    """Client for Quiz Service"""

    def __init__(self):
        super().__init__(settings.quiz_service_url)

    async def get_quiz(
        self, quiz_id: int, token: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        """Get quiz details"""
        headers = {"Authorization": f"Bearer {token}"} if token else {}
        return await self._request("GET", f"/api/v1/quiz/{quiz_id}", headers=headers)

    async def get_quiz_questions(
        self, quiz_id: int, token: Optional[str] = None
    ) -> Optional[List[Dict[str, Any]]]:
        """Get quiz questions"""
        headers = {"Authorization": f"Bearer {token}"} if token else {}
        response = await self._request(
            "GET", f"/api/v1/quiz/{quiz_id}/questions", headers=headers
        )
        return response.get("questions", []) if response else []

    async def get_quiz_results(
        self, quiz_id: int, token: Optional[str] = None
    ) -> Optional[List[Dict[str, Any]]]:
        """Get all results for a quiz"""
        headers = {"Authorization": f"Bearer {token}"} if token else {}
        response = await self._request(
            "GET", f"/api/v1/quiz/{quiz_id}/results", headers=headers
        )
        return response.get("results", []) if response else []

    async def get_student_quiz_attempts(
        self, student_id: int, token: Optional[str] = None
    ) -> Optional[List[Dict[str, Any]]]:
        """Get all quiz attempts by a student"""
        headers = {"Authorization": f"Bearer {token}"} if token else {}
        response = await self._request(
            "GET", f"/api/v1/student/{student_id}/attempts", headers=headers
        )
        return response.get("attempts", []) if response else []

    async def get_question_details(
        self, question_id: int, token: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        """Get question details"""
        headers = {"Authorization": f"Bearer {token}"} if token else {}
        return await self._request(
            "GET", f"/api/v1/question/{question_id}", headers=headers
        )


class ClassServiceClient(BaseServiceClient):
    """Client for Class Service"""

    def __init__(self):
        super().__init__(settings.class_service_url)

    async def get_class(
        self, class_id: int, token: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        """Get class details"""
        headers = {"Authorization": f"Bearer {token}"} if token else {}
        return await self._request("GET", f"/api/v1/class/{class_id}", headers=headers)

    async def get_class_students(
        self, class_id: int, token: Optional[str] = None
    ) -> Optional[List[Dict[str, Any]]]:
        """Get all students in a class"""
        headers = {"Authorization": f"Bearer {token}"} if token else {}
        response = await self._request(
            "GET", f"/api/v1/class/{class_id}/students", headers=headers
        )
        return response.get("students", []) if response else []

    async def get_student(
        self, student_id: int, token: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        """Get student details"""
        headers = {"Authorization": f"Bearer {token}"} if token else {}
        return await self._request(
            "GET", f"/api/v1/student/{student_id}", headers=headers
        )

    async def get_class_quizzes(
        self, class_id: int, token: Optional[str] = None
    ) -> Optional[List[Dict[str, Any]]]:
        """Get all quizzes assigned to a class"""
        headers = {"Authorization": f"Bearer {token}"} if token else {}
        response = await self._request(
            "GET", f"/api/v1/class/{class_id}/quizzes", headers=headers
        )
        return response.get("quizzes", []) if response else []


class NotificationServiceClient(BaseServiceClient):
    """Client for Notification Service"""

    def __init__(self):
        super().__init__(settings.notification_service_url)

    async def send_email(
        self,
        to_email: str,
        subject: str,
        body: str,
        attachments: Optional[List[Dict[str, Any]]] = None,
        token: Optional[str] = None,
    ) -> bool:
        """Send email notification"""
        headers = {"Authorization": f"Bearer {token}"} if token else {}
        payload = {
            "to": to_email,
            "subject": subject,
            "body": body,
            "attachments": attachments or [],
        }
        response = await self._request(
            "POST", "/api/v1/notification/email", headers=headers, json=payload
        )
        return response is not None

    async def send_certificate_email(
        self, student_id: int, certificate_path: str, token: Optional[str] = None
    ) -> bool:
        """Send certificate via email"""
        headers = {"Authorization": f"Bearer {token}"} if token else {}
        payload = {
            "student_id": student_id,
            "certificate_path": certificate_path,
            "type": "certificate",
        }
        response = await self._request(
            "POST", "/api/v1/notification/certificate", headers=headers, json=payload
        )
        return response is not None

    async def send_alert(
        self,
        recipient_ids: List[int],
        alert_type: str,
        title: str,
        message: str,
        token: Optional[str] = None,
    ) -> bool:
        """Send alert notification"""
        headers = {"Authorization": f"Bearer {token}"} if token else {}
        payload = {
            "recipient_ids": recipient_ids,
            "type": alert_type,
            "title": title,
            "message": message,
        }
        response = await self._request(
            "POST", "/api/v1/notification/alert", headers=headers, json=payload
        )
        return response is not None

    async def send_weekly_report(
        self, teacher_id: int, report_data: Dict[str, Any], token: Optional[str] = None
    ) -> bool:
        """Send weekly report to teacher"""
        headers = {"Authorization": f"Bearer {token}"} if token else {}
        payload = {
            "teacher_id": teacher_id,
            "report_type": "weekly",
            "data": report_data,
        }
        response = await self._request(
            "POST", "/api/v1/notification/report", headers=headers, json=payload
        )
        return response is not None


# Global client instances
quiz_service = QuizServiceClient()
class_service = ClassServiceClient()
notification_service = NotificationServiceClient()
