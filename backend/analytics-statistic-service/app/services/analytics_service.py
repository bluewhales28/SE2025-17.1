import pandas as pd
from app.db.connection import get_db_connection

class AnalyticsService:

    def quiz_report(self, quiz_id: int):
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("""
            SELECT user_id, score, total_score, topic, difficulty
            FROM quiz_attempt_events
            WHERE quiz_id = %s
        """, (quiz_id,))
        rows = cur.fetchall()
        conn.close()

        if not rows:
            return {}

        df = pd.DataFrame(rows)
        df["percent"] = df["score"] / df["total_score"] * 100

        return {
            "quiz_id": quiz_id,
            "attempts": len(df),
            "avg_score": round(df["percent"].mean(), 2),
            "median_score": round(df["percent"].median(), 2),
            "max_score": round(df["percent"].max(), 2),
            "min_score": round(df["percent"].min(), 2),
            "by_topic": df.groupby("topic")["percent"].mean().to_dict(),
            "by_difficulty": df.groupby("difficulty")["percent"].mean().to_dict(),
        }

    def student_report(self, student_id: int):
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("""
            SELECT quiz_id, score, total_score
            FROM quiz_attempt_events
            WHERE user_id = %s
        """, (student_id,))
        rows = cur.fetchall()
        conn.close()

        if not rows:
            return {}

        df = pd.DataFrame(rows)
        df["percent"] = df["score"] / df["total_score"] * 100

        return {
            "student_id": student_id,
            "completed_quizzes": df["quiz_id"].nunique(),
            "avg_score": round(df["percent"].mean(), 2)
        }

    def class_report(self, class_id: int):
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("""
            SELECT user_id, score, total_score
            FROM quiz_attempt_events
            WHERE class_id = %s
        """, (class_id,))
        rows = cur.fetchall()
        conn.close()

        if not rows:
            return {}

        df = pd.DataFrame(rows)
        df["percent"] = df["score"] / df["total_score"] * 100

        return {
            "class_id": class_id,
            "avg_score": round(df["percent"].mean(), 2),
            "top_students": (
                df.groupby("user_id")["percent"]
                .mean()
                .sort_values(ascending=False)
                .head(5)
                .to_dict()
            )
        }
        
    def question_analysis(self, question_id: int):
        conn = get_db_connection()

        query = """
        SELECT score, total_score
        FROM quiz_attempt_events
        WHERE quiz_id = (
            SELECT quiz_id FROM questions WHERE id = %s
        )
        """
        df = pd.read_sql(query, conn, params=(question_id,))
        conn.close()

        if df.empty:
            return {"message": "No data"}

        df["ratio"] = df["score"] / df["total_score"]

        correct_rate = (df["ratio"] >= 0.5).mean()
        difficulty = 1 - correct_rate

        df_sorted = df.sort_values("ratio")
        k = int(len(df) * 0.27) or 1

        low = df_sorted.head(k)["ratio"].mean()
        high = df_sorted.tail(k)["ratio"].mean()

        discrimination = high - low

        return {
            "question_id": question_id,
            "correct_rate": round(correct_rate, 2),
            "difficulty": round(difficulty, 2),
            "discrimination": round(discrimination, 2),
        }    
