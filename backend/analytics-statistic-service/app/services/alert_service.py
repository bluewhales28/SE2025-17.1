
from app.db.connection import get_db_connection

class AlertService:
    def detect_high_score(self, quiz_id: int, threshold=0.9):
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
