"""
Fraud detection and anomaly detection service
"""
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import difflib

from app.models.analytics import AlertEvent, SeverityLevel
from app.config import settings
from app.services.external_service import notification_service


class FraudDetectionService:
    """Service for detecting fraudulent activities and anomalies"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.similarity_threshold = settings.similarity_threshold
        self.abnormal_speed_threshold = settings.abnormal_speed_threshold
        self.pattern_anomaly_threshold = settings.pattern_anomaly_threshold
    
    async def detect_similar_submissions(
        self,
        quiz_id: int,
        submissions: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Detect similar submissions that may indicate cheating
        
        Args:
            quiz_id: Quiz ID
            submissions: List of submissions to analyze
        
        Returns:
            List of detected anomalies
        """
        anomalies = []
        
        # Compare submissions pairwise
        for i in range(len(submissions)):
            for j in range(i + 1, len(submissions)):
                submission1 = submissions[i]
                submission2 = submissions[j]
                
                # Calculate similarity between answers
                similarity = self._calculate_submission_similarity(
                    submission1.get('answers', []),
                    submission2.get('answers', [])
                )
                
                if similarity >= self.similarity_threshold:
                    anomaly = {
                        "type": "similar_submissions",
                        "severity": "high",
                        "quiz_id": quiz_id,
                        "student_ids": [
                            submission1.get('student_id'),
                            submission2.get('student_id')
                        ],
                        "similarity_score": similarity,
                        "details": f"High similarity ({similarity:.2%}) detected between submissions"
                    }
                    anomalies.append(anomaly)
                    
                    # Create alert event
                    await self._create_alert(
                        type="similar_submissions",
                        severity=SeverityLevel.HIGH,
                        title="Suspicious Similar Submissions",
                        description=f"High similarity detected between students",
                        quiz_id=quiz_id,
                        data=anomaly
                    )
        
        return anomalies
    
    async def detect_abnormal_speed(
        self,
        quiz_id: int,
        submission: Dict[str, Any],
        average_time: float
    ) -> Optional[Dict[str, Any]]:
        """
        Detect abnormally fast quiz completion
        
        Args:
            quiz_id: Quiz ID
            submission: Submission to check
            average_time: Average time for this quiz
        
        Returns:
            Anomaly details if detected, None otherwise
        """
        time_spent = submission.get('time_spent', 0)
        
        # Check if completion time is suspiciously fast
        if time_spent < self.abnormal_speed_threshold:
            anomaly = {
                "type": "abnormal_speed",
                "severity": "medium",
                "quiz_id": quiz_id,
                "student_id": submission.get('student_id'),
                "time_spent": time_spent,
                "average_time": average_time,
                "details": f"Quiz completed in {time_spent}s (avg: {average_time}s)"
            }
            
            # Create alert
            await self._create_alert(
                type="abnormal_speed",
                severity=SeverityLevel.MEDIUM,
                title="Abnormally Fast Completion",
                description=f"Student completed quiz in {time_spent} seconds",
                quiz_id=quiz_id,
                student_id=submission.get('student_id'),
                submission_id=submission.get('id'),
                data=anomaly
            )
            
            return anomaly
        
        # Check if time is too fast compared to average
        if average_time > 0 and time_spent < (average_time * 0.3):
            anomaly = {
                "type": "abnormal_speed",
                "severity": "high",
                "quiz_id": quiz_id,
                "student_id": submission.get('student_id'),
                "time_spent": time_spent,
                "average_time": average_time,
                "details": f"Completed 70% faster than average"
            }
            
            await self._create_alert(
                type="abnormal_speed",
                severity=SeverityLevel.HIGH,
                title="Extremely Fast Completion",
                description=f"Student completed significantly faster than average",
                quiz_id=quiz_id,
                student_id=submission.get('student_id'),
                submission_id=submission.get('id'),
                data=anomaly
            )
            
            return anomaly
        
        return None
    
    async def detect_pattern_anomaly(
        self,
        quiz_id: int,
        submission: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        """
        Detect suspicious answer patterns
        
        Args:
            quiz_id: Quiz ID
            submission: Submission to analyze
        
        Returns:
            Anomaly details if detected
        """
        answers = submission.get('answers', [])
        
        if not answers:
            return None
        
        # Check for sequential patterns (e.g., all A, B, C, D, A, B, C, D...)
        selected_options = [a.get('selected_option') for a in answers if 'selected_option' in a]
        
        if len(selected_options) >= 4:
            # Check for repeating patterns
            pattern_length = 4
            pattern_count = 0
            
            for i in range(len(selected_options) - pattern_length + 1):
                pattern = selected_options[i:i+pattern_length]
                # Count how many times this pattern repeats
                for j in range(i+pattern_length, len(selected_options) - pattern_length + 1):
                    if selected_options[j:j+pattern_length] == pattern:
                        pattern_count += 1
            
            pattern_ratio = pattern_count / (len(selected_options) // pattern_length) if len(selected_options) >= pattern_length else 0
            
            if pattern_ratio >= self.pattern_anomaly_threshold:
                anomaly = {
                    "type": "pattern_anomaly",
                    "severity": "medium",
                    "quiz_id": quiz_id,
                    "student_id": submission.get('student_id'),
                    "pattern_ratio": pattern_ratio,
                    "details": "Suspicious answer pattern detected"
                }
                
                await self._create_alert(
                    type="pattern_anomaly",
                    severity=SeverityLevel.MEDIUM,
                    title="Suspicious Answer Pattern",
                    description="Repeating pattern detected in answers",
                    quiz_id=quiz_id,
                    student_id=submission.get('student_id'),
                    submission_id=submission.get('id'),
                    data=anomaly
                )
                
                return anomaly
        
        # Check for all same answers
        if len(set(selected_options)) == 1 and len(selected_options) > 5:
            anomaly = {
                "type": "pattern_anomaly",
                "severity": "high",
                "quiz_id": quiz_id,
                "student_id": submission.get('student_id'),
                "details": "All answers are the same option"
            }
            
            await self._create_alert(
                type="pattern_anomaly",
                severity=SeverityLevel.HIGH,
                title="Uniform Answer Pattern",
                description="All answers selected are identical",
                quiz_id=quiz_id,
                student_id=submission.get('student_id'),
                submission_id=submission.get('id'),
                data=anomaly
            )
            
            return anomaly
        
        return None
    
    def _calculate_submission_similarity(
        self,
        answers1: List[Dict[str, Any]],
        answers2: List[Dict[str, Any]]
    ) -> float:
        """
        Calculate similarity between two submissions
        
        Args:
            answers1: First submission's answers
            answers2: Second submission's answers
        
        Returns:
            Similarity ratio (0.0 to 1.0)
        """
        if not answers1 or not answers2:
            return 0.0
        
        # Create answer strings for comparison
        answer_str1 = "_".join(str(a.get('selected_option', '')) for a in answers1)
        answer_str2 = "_".join(str(a.get('selected_option', '')) for a in answers2)
        
        # Calculate similarity using difflib
        similarity = difflib.SequenceMatcher(None, answer_str1, answer_str2).ratio()
        
        return similarity
    
    async def _create_alert(
        self,
        type: str,
        severity: SeverityLevel,
        title: str,
        description: str,
        quiz_id: Optional[int] = None,
        student_id: Optional[int] = None,
        submission_id: Optional[int] = None,
        data: Optional[Dict[str, Any]] = None
    ) -> AlertEvent:
        """
        Create an alert event in database
        
        Args:
            type: Alert type
            severity: Severity level
            title: Alert title
            description: Alert description
            quiz_id: Quiz ID
            student_id: Student ID
            submission_id: Submission ID
            data: Additional data
        
        Returns:
            Created AlertEvent
        """
        alert = AlertEvent(
            type=type,
            severity=severity,
            title=title,
            description=description,
            quiz_id=quiz_id,
            student_id=student_id,
            submission_id=submission_id,
            data=data or {},
            resolved=0
        )
        
        self.db.add(alert)
        await self.db.commit()
        await self.db.refresh(alert)
        
        # Send notification if severity is high or critical
        if severity in [SeverityLevel.HIGH, SeverityLevel.CRITICAL]:
            # Notify admin about the alert
            await notification_service.send_alert(
                recipient_ids=[1],  # Admin user ID
                alert_type=type,
                title=title,
                message=description
            )
        
        return alert
    
    async def get_unresolved_alerts(
        self,
        quiz_id: Optional[int] = None,
        student_id: Optional[int] = None,
        severity: Optional[SeverityLevel] = None
    ) -> List[AlertEvent]:
        """
        Get unresolved alerts
        
        Args:
            quiz_id: Filter by quiz ID
            student_id: Filter by student ID
            severity: Filter by severity
        
        Returns:
            List of unresolved alerts
        """
        query = select(AlertEvent).where(AlertEvent.resolved == 0)
        
        if quiz_id:
            query = query.where(AlertEvent.quiz_id == quiz_id)
        if student_id:
            query = query.where(AlertEvent.student_id == student_id)
        if severity:
            query = query.where(AlertEvent.severity == severity)
        
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def resolve_alert(
        self,
        alert_id: int,
        resolved_by: int,
        resolution_note: Optional[str] = None
    ) -> AlertEvent:
        """
        Mark an alert as resolved
        
        Args:
            alert_id: Alert ID
            resolved_by: User ID who resolved the alert
            resolution_note: Optional resolution note
        
        Returns:
            Updated AlertEvent
        """
        query = select(AlertEvent).where(AlertEvent.id == alert_id)
        result = await self.db.execute(query)
        alert = result.scalar_one_or_none()
        
        if not alert:
            raise ValueError(f"Alert {alert_id} not found")
        
        alert.resolved = 1
        alert.resolved_at = datetime.utcnow()
        alert.resolved_by = resolved_by
        alert.resolution_note = resolution_note
        
        await self.db.commit()
        await self.db.refresh(alert)
        
        return alert


