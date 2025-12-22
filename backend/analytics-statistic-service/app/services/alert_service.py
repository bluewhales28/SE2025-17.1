import json
from typing import List, Dict, Any, Optional
from app.db.connection import get_db_connection
from app.services.http_clients import NotificationServiceClient

class AlertService:
    """Service for detecting anomalies and sending alerts"""
    
    def __init__(self):
        self.notification_client = NotificationServiceClient()
    
    def detect_cheating(
        self, 
        quiz_id: int, 
        user_id: int, 
        score: float, 
        total_score: float,
        similarity_threshold: float = 0.9,
        time_threshold_seconds: int = 30
    ) -> List[Dict[str, Any]]:
        """Detect potential cheating based on similarity and time"""
        alerts = []
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Check for similar answers (if answer data available)
        cur.execute("""
            SELECT user_id, score, total_score, submitted_at, answers
            FROM quiz_attempt_events
            WHERE quiz_id = %s 
            AND user_id != %s
            AND submitted_at > NOW() - INTERVAL '1 hour'
        """, (quiz_id, user_id))
        
        similar_attempts = cur.fetchall()
        
        # Check for suspiciously fast completion
        cur.execute("""
            SELECT started_at, submitted_at
            FROM quiz_attempt_events
            WHERE quiz_id = %s AND user_id = %s
            ORDER BY submitted_at DESC
            LIMIT 1
        """, (quiz_id, user_id))
        
        attempt = cur.fetchone()
        if attempt and attempt.get("started_at") and attempt.get("submitted_at"):
            duration = (attempt["submitted_at"] - attempt["started_at"]).total_seconds()
            if duration < time_threshold_seconds:
                alerts.append({
                    "type": "SUSPICIOUS_TIME",
                    "severity": "HIGH",
                    "quiz_id": quiz_id,
                    "user_id": user_id,
                    "message": f"Quiz completed in {duration:.1f} seconds (suspiciously fast)",
                    "duration_seconds": duration
                })
        
        # Check for perfect score with high similarity
        score_ratio = score / total_score if total_score > 0 else 0
        if score_ratio >= similarity_threshold:
            # Check if other users got similar scores recently
            similar_scores = [
                r for r in similar_attempts
                if abs((r["score"] / r["total_score"]) - score_ratio) < 0.05
            ]
            
            if len(similar_scores) >= 2:
                alerts.append({
                    "type": "SUSPICIOUS_SIMILARITY",
                    "severity": "MEDIUM",
                    "quiz_id": quiz_id,
                    "user_id": user_id,
                    "message": f"High score similarity with {len(similar_scores)} other attempts",
                    "similar_attempts": len(similar_scores)
                })
        
        conn.close()
        return alerts
    
    def send_alert(self, alerts: List[Dict[str, Any]]):
        """Send alerts to admin dashboard via notification service"""
        for alert in alerts:
            try:
                self.notification_client.send_admin_alert(
                    alert_type=alert["type"],
                    severity=alert["severity"],
                    message=alert["message"],
                    metadata={
                        "quiz_id": alert.get("quiz_id"),
                        "user_id": alert.get("user_id"),
                        **{k: v for k, v in alert.items() if k not in ["type", "severity", "message", "quiz_id", "user_id"]}
                    }
                )
            except Exception as e:
                print(f"Failed to send alert: {e}")
    
    def detect_high_score(self, quiz_id: int, threshold=0.9):
        """Legacy method - kept for backward compatibility"""
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("""
            SELECT user_id, score, total_score
            FROM quiz_attempt_events
            WHERE quiz_id = %s
        """, (quiz_id,))
        rows = cur.fetchall()
        conn.close()

        return [
            r["user_id"]
            for r in rows
            if r["score"] / r["total_score"] >= threshold
        ]
