from app.database import get_db_connection

class AnalyticsRepository:

    # =======================
    # QUIZ REPORT
    # =======================
    def get_quiz_metrics(self, quiz_id):
        with get_db_connection() as conn:
            cur = conn.cursor()
            cur.execute(
                "SELECT * FROM quiz_performance_metrics WHERE quiz_id = %s",
                (quiz_id,)
            )
            return cur.fetchone()

    # =======================
    # STUDENT REPORT
    # =======================
    def get_student_summary(self, user_id):
        with get_db_connection() as conn:
            cur = conn.cursor()
            cur.execute(
                "SELECT * FROM user_performance_summary WHERE user_id = %s",
                (user_id,)
            )
            return cur.fetchone()

    # =======================
    # CLASS REPORT  ✅ (BỔ SUNG)
    # =======================
    def get_class_stats(self, class_id):
        with get_db_connection() as conn:
            cur = conn.cursor()
            cur.execute(
                "SELECT * FROM class_engagement_stats WHERE class_id = %s",
                (class_id,)
            )
            return cur.fetchone()

    # =======================
    # QUESTION REPORT ✅ (BỔ SUNG)
    # =======================
    def get_question_analytics(self, question_id):
        with get_db_connection() as conn:
            cur = conn.cursor()
            cur.execute(
                "SELECT * FROM question_analytics WHERE question_id = %s",
                (question_id,)
            )
            return cur.fetchone()
