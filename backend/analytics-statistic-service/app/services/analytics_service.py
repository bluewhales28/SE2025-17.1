import pandas as pd
import numpy as np
from typing import Dict, List, Any, Optional
from psycopg2 import errors
from app.db.connection import get_db_connection
from app.services.cache_service import CacheService

class AnalyticsService:

    def __init__(self):
        self.cache_service = CacheService()

    def _fetch_attempts(self, quiz_id: Optional[int] = None, class_id: Optional[int] = None, user_id: Optional[int] = None) -> pd.DataFrame:
        """
        Lấy dữ liệu attempt từ các bảng hiện có (attempts + quizzes + assignments)
        trả về các cột: user_id, class_id, quiz_id, topic, difficulty, score, total_score, submitted_at
        """
        conn = get_db_connection()
        cur = conn.cursor()

        filters = ["a.is_submitted = TRUE"]
        params: list[Any] = []

        if quiz_id is not None:
            filters.append("a.quiz_id = %s")
            params.append(quiz_id)
        if class_id is not None:
            filters.append("asg.class_id = %s")
            params.append(class_id)
        if user_id is not None:
            filters.append("a.user_id = %s")
            params.append(user_id)

        where_clause = " WHERE " + " AND ".join(filters) if filters else ""

        query = f"""
            SELECT
                a.user_id,
                asg.class_id,
                a.quiz_id,
                q.topic,
                q.difficulty,
                a.score,
                q.total_score,
                COALESCE(a.end_time, a.start_time) AS submitted_at
            FROM attempts a
            JOIN quizzes q ON q.id = a.quiz_id
            LEFT JOIN assignments asg ON asg.quiz_id = a.quiz_id
            {where_clause}
        """

        try:
            cur.execute(query, tuple(params))
            rows = cur.fetchall()
            df = pd.DataFrame(rows, columns=["user_id", "class_id", "quiz_id", "topic", "difficulty", "score", "total_score", "submitted_at"])
        except Exception:
            df = pd.DataFrame()
        finally:
            conn.close()

        return df
    
    def _normalize_scores(self, df: pd.DataFrame) -> pd.DataFrame:
        """Convert score columns to numeric and remove invalid rows"""
        if 'score' in df.columns:
            df["score"] = pd.to_numeric(df["score"], errors='coerce')
        if 'total_score' in df.columns:
            df["total_score"] = pd.to_numeric(df["total_score"], errors='coerce')
        df = df.dropna(subset=['score', 'total_score'])
        return df

    def quiz_report(self, quiz_id: int, use_cache: bool = True):
        # Check cache
        cache_key = f"quiz_report:{quiz_id}"
        if use_cache:
            cached = self.cache_service.get(cache_key)
            if cached:
                return cached

        df = self._fetch_attempts(quiz_id=quiz_id)
        if df.empty:
            return {}
        df = self._normalize_scores(df)
        
        if df.empty:
            return {}
        
        df["percent"] = df["score"] / df["total_score"] * 100

        # Calculate percentiles
        percentiles = {
            "p25": round(df["percent"].quantile(0.25), 2),
            "p50": round(df["percent"].quantile(0.50), 2),  # median
            "p75": round(df["percent"].quantile(0.75), 2),
            "p90": round(df["percent"].quantile(0.90), 2),
        }

        # Histogram distribution (10 bins)
        hist, bins = np.histogram(df["percent"], bins=10, range=(0, 100))
        histogram = {
            "bins": [round(b, 2) for b in bins.tolist()],
            "frequencies": hist.tolist()
        }

        result = {
            "quiz_id": quiz_id,
            "attempts": len(df),
            "avg_score": round(df["percent"].mean(), 2),
            "median_score": round(df["percent"].median(), 2),
            "max_score": round(df["percent"].max(), 2),
            "min_score": round(df["percent"].min(), 2),
            "std_dev": round(df["percent"].std(), 2),
            "percentiles": percentiles,
            "histogram": histogram,
            "by_topic": df.groupby("topic")["percent"].mean().to_dict() if "topic" in df.columns else {},
            "by_difficulty": df.groupby("difficulty")["percent"].mean().to_dict() if "difficulty" in df.columns else {},
        }

        # Cache result
        if use_cache:
            self.cache_service.set(cache_key, result)

        return result

    def student_report(self, student_id: int, use_cache: bool = True):
        cache_key = f"student_report:{student_id}"
        if use_cache:
            cached = self.cache_service.get(cache_key)
            if cached:
                return cached
        df = self._fetch_attempts(user_id=student_id)
        if df.empty:
            return {}
        df = self._normalize_scores(df)
        
        if df.empty:
            return {}
        
        df["percent"] = df["score"] / df["total_score"] * 100

        # Topic analysis - weak points detection
        topic_performance = df.groupby("topic")["percent"].agg(['mean', 'count']).to_dict('index')
        weak_topics = [
            topic for topic, stats in topic_performance.items()
            if stats['mean'] < 60 and stats['count'] >= 2
        ]

        result = {
            "student_id": student_id,
            "completed_quizzes": df["quiz_id"].nunique(),
            "total_attempts": len(df),
            "avg_score": round(df["percent"].mean(), 2),
            "median_score": round(df["percent"].median(), 2),
            "highest_score": round(df["percent"].max(), 2),
            "lowest_score": round(df["percent"].min(), 2),
            "completion_rate": round(len(df) / df["quiz_id"].nunique() * 100, 2) if df["quiz_id"].nunique() > 0 else 0,
            "topic_performance": {k: round(v['mean'], 2) for k, v in topic_performance.items()},
            "weak_topics": weak_topics,
            "progress_trend": self._calculate_progress_trend(df)
        }

        if use_cache:
            self.cache_service.set(cache_key, result)

        return result

    def _calculate_progress_trend(self, df: pd.DataFrame) -> List[float]:
        """Calculate progress trend over time"""
        if "submitted_at" not in df.columns or len(df) < 2:
            return []
        
        df_sorted = df.sort_values("submitted_at")
        # Calculate moving average of last 5 attempts
        window = min(5, len(df_sorted))
        return [round(x, 2) for x in df_sorted["percent"].tail(window).tolist()]

    def class_report(self, class_id: int, use_cache: bool = True):
        cache_key = f"class_report:{class_id}"
        if use_cache:
            cached = self.cache_service.get(cache_key)
            if cached:
                return cached

        df = self._fetch_attempts(class_id=class_id)
        if df.empty:
            return {}
        df = self._normalize_scores(df)
        
        if df.empty:
            return {}
        
        df["percent"] = df["score"] / df["total_score"] * 100

        # Top students with more details
        student_stats = df.groupby("user_id")["percent"].agg(['mean', 'count', 'std']).reset_index()
        student_stats.columns = ['user_id', 'avg_score', 'attempts', 'std_dev']
        top_students = student_stats.nlargest(5, 'avg_score').to_dict('records')

        # Completion rate
        total_students = df["user_id"].nunique()
        completed_quizzes = df["quiz_id"].nunique()
        completion_rate = round(len(df) / (total_students * completed_quizzes) * 100, 2) if total_students * completed_quizzes > 0 else 0

        result = {
            "class_id": class_id,
            "total_students": total_students,
            "total_attempts": len(df),
            "avg_score": round(df["percent"].mean(), 2),
            "median_score": round(df["percent"].median(), 2),
            "completion_rate": completion_rate,
            "top_students": [
                {
                    "user_id": int(s["user_id"]),
                    "avg_score": round(s["avg_score"], 2),
                    "attempts": int(s["attempts"]),
                    "consistency": round(100 - s["std_dev"], 2) if not pd.isna(s["std_dev"]) else 100
                }
                for s in top_students
            ],
            "topic_performance": df.groupby("topic")["percent"].mean().to_dict() if "topic" in df.columns else {}
        }

        if use_cache:
            self.cache_service.set(cache_key, result)

        return result

    def cross_comparison(self, student_id: int, class_id: int = None):
        """Compare student performance vs class vs system"""
        student_report = self.student_report(student_id, use_cache=True)
        
        if class_id:
            class_report = self.class_report(class_id, use_cache=True)
            class_avg = class_report.get("avg_score", 0)
        else:
            class_avg = None

        df_system = self._fetch_attempts()
        if df_system.empty:
            system_avg = 0
        else:
            df_system = self._normalize_scores(df_system)
            if df_system.empty:
                system_avg = 0
            else:
                df_system["percent"] = df_system["score"] / df_system["total_score"] * 100
                system_avg = round(df_system["percent"].mean(), 2)

        student_avg = student_report.get("avg_score", 0)

        return {
            "student_id": student_id,
            "student_avg": student_avg,
            "class_avg": class_avg,
            "system_avg": system_avg,
            "vs_class": round(student_avg - class_avg, 2) if class_avg else None,
            "vs_system": round(student_avg - system_avg, 2),
            "percentile_vs_class": self._calculate_percentile(student_avg, class_id) if class_id else None
        }

    def _calculate_percentile(self, score: float, class_id: int) -> float:
        """Calculate student percentile in class"""
        df = self._fetch_attempts(class_id=class_id)
        if df.empty:
            return 0

        df = self._normalize_scores(df)
        if df.empty:
            return 0

        df["percent"] = df["score"] / df["total_score"] * 100

        percentile = (df["percent"] < score).sum() / len(df) * 100
        return round(percentile, 2)
        
    def question_analysis(self, question_id: int, use_cache: bool = True):
        cache_key = f"question_analysis:{question_id}"
        if use_cache:
            cached = self.cache_service.get(cache_key)
            if cached:
                return cached

        conn = get_db_connection()
        query = """
            SELECT
                aa.is_correct::int as is_correct,
                a.score,
                q.total_score,
                a.user_id
            FROM attempt_answers aa
            JOIN attempts a ON aa.attempt_id = a.id
            JOIN questions qs ON qs.id = aa.question_id
            JOIN quizzes q ON q.id = qs.quiz_id
            WHERE aa.question_id = %s
              AND a.is_submitted = TRUE
        """
        try:
            df = pd.read_sql(query, conn, params=(question_id,))
        except Exception:
            conn.close()
            return {"message": "No data"}
        finally:
            conn.close()

        if df.empty:
            return {"message": "No data"}

        df = self._normalize_scores(df)
        if df.empty:
            return {"message": "No valid data"}

        df["total_score"] = df["total_score"].replace(0, pd.NA)
        df["ratio"] = (df["score"] / df["total_score"]).fillna(0)
        df["is_correct"] = df["is_correct"].fillna((df["ratio"] >= 0.5).astype(int))

        correct_rate = df["is_correct"].mean()
        difficulty = 1 - correct_rate

        # Discrimination index (27% method)
        df_sorted = df.sort_values("ratio")
        k = max(1, int(len(df) * 0.27))

        low_group = df_sorted.head(k)["is_correct"].mean()
        high_group = df_sorted.tail(k)["is_correct"].mean()
        discrimination = high_group - low_group

        result = {
            "question_id": question_id,
            "total_attempts": len(df),
            "correct_attempts": int(df["is_correct"].sum()),
            "wrong_attempts": int((~df["is_correct"].astype(bool)).sum()),
            "correct_rate": round(correct_rate * 100, 2),
            "difficulty": round(difficulty, 2),
            "discrimination": round(discrimination, 2),
            "difficulty_level": self._classify_difficulty(difficulty),
            "quality": self._classify_question_quality(discrimination, difficulty)
        }

        if use_cache:
            self.cache_service.set(cache_key, result)

        return result

    def _classify_difficulty(self, difficulty: float) -> str:
        """Classify question difficulty"""
        if difficulty < 0.2:
            return "Very Easy"
        elif difficulty < 0.4:
            return "Easy"
        elif difficulty < 0.6:
            return "Medium"
        elif difficulty < 0.8:
            return "Hard"
        else:
            return "Very Hard"

    def _classify_question_quality(self, discrimination: float, difficulty: float) -> str:
        """Classify question quality based on discrimination and difficulty"""
        if discrimination > 0.4 and 0.3 < difficulty < 0.7:
            return "Excellent"
        elif discrimination > 0.3:
            return "Good"
        elif discrimination > 0.2:
            return "Fair"
        else:
            return "Poor - Consider revision"
