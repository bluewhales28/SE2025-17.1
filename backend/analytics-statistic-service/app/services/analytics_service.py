"""
Core analytics service with Pandas for data processing and analysis
"""
from typing import List, Dict, Any, Optional
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.models.analytics import AnalyticsCache
from app.schemas.report import StatisticsData


class AnalyticsService:
    """Core analytics service for processing quiz data"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def calculate_quiz_statistics(
        self,
        quiz_results: List[Dict[str, Any]]
    ) -> StatisticsData:
        """
        Calculate comprehensive statistics for a quiz
        
        Args:
            quiz_results: List of quiz result dictionaries with 'score', 'student_id', etc.
        
        Returns:
            StatisticsData object with calculated metrics
        """
        if not quiz_results:
            return StatisticsData(
                mean=0.0,
                median=0.0,
                std_dev=0.0,
                min_score=0.0,
                max_score=0.0,
                count=0,
                percentile_25=0.0,
                percentile_50=0.0,
                percentile_75=0.0
            )
        
        # Convert to DataFrame for efficient processing
        df = pd.DataFrame(quiz_results)
        scores = df['score'].astype(float)
        
        return StatisticsData(
            mean=float(scores.mean()),
            median=float(scores.median()),
            std_dev=float(scores.std()),
            min_score=float(scores.min()),
            max_score=float(scores.max()),
            count=len(scores),
            percentile_25=float(scores.quantile(0.25)),
            percentile_50=float(scores.quantile(0.50)),
            percentile_75=float(scores.quantile(0.75))
        )
    
    async def analyze_student_progress(
        self,
        student_id: int,
        quiz_results: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Analyze student's progress over time
        
        Args:
            student_id: Student ID
            quiz_results: List of student's quiz results
        
        Returns:
            Dictionary with progress analysis
        """
        if not quiz_results:
            return {
                "total_attempts": 0,
                "average_score": 0.0,
                "progress_trend": "no_data",
                "improvement_rate": 0.0
            }
        
        df = pd.DataFrame(quiz_results)
        df['completed_at'] = pd.to_datetime(df['completed_at'])
        df = df.sort_values('completed_at')
        
        # Calculate progress over time
        df['score_ma'] = df['score'].rolling(window=5, min_periods=1).mean()
        
        # Determine trend
        if len(df) >= 2:
            recent_avg = df['score'].tail(5).mean()
            early_avg = df['score'].head(5).mean()
            improvement_rate = ((recent_avg - early_avg) / early_avg * 100) if early_avg > 0 else 0
            
            if improvement_rate > 10:
                trend = "improving"
            elif improvement_rate < -10:
                trend = "declining"
            else:
                trend = "stable"
        else:
            trend = "insufficient_data"
            improvement_rate = 0.0
        
        progress_timeline = []
        for _, row in df.iterrows():
            progress_timeline.append({
                "date": row['completed_at'].isoformat(),
                "score": float(row['score']),
                "moving_average": float(row['score_ma']),
                "quiz_id": int(row['quiz_id'])
            })
        
        return {
            "total_attempts": len(df),
            "average_score": float(df['score'].mean()),
            "best_score": float(df['score'].max()),
            "worst_score": float(df['score'].min()),
            "progress_trend": trend,
            "improvement_rate": float(improvement_rate),
            "progress_timeline": progress_timeline
        }
    
    async def calculate_class_metrics(
        self,
        class_id: int,
        student_results: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Calculate class-level metrics
        
        Args:
            class_id: Class ID
            student_results: List of all student results in the class
        
        Returns:
            Dictionary with class metrics
        """
        if not student_results:
            return {
                "total_students": 0,
                "average_score": 0.0,
                "completion_rate": 0.0,
                "pass_rate": 0.0
            }
        
        df = pd.DataFrame(student_results)
        
        # Calculate unique students
        unique_students = df['student_id'].nunique()
        
        # Calculate average score
        average_score = df['score'].mean()
        
        # Calculate completion rate (students who completed at least one quiz)
        completion_rate = (df['student_id'].nunique() / unique_students * 100) if unique_students > 0 else 0
        
        # Calculate pass rate (assuming passing score is 60%)
        passing_threshold = 60.0
        passed_attempts = len(df[df['score'] >= passing_threshold])
        pass_rate = (passed_attempts / len(df) * 100) if len(df) > 0 else 0
        
        # Generate leaderboard
        leaderboard_df = df.groupby('student_id').agg({
            'score': 'mean',
            'quiz_id': 'count'
        }).reset_index()
        leaderboard_df.columns = ['student_id', 'avg_score', 'total_quizzes']
        leaderboard_df = leaderboard_df.sort_values('avg_score', ascending=False)
        leaderboard_df['rank'] = range(1, len(leaderboard_df) + 1)
        
        leaderboard = leaderboard_df.to_dict('records')
        
        return {
            "total_students": unique_students,
            "average_score": float(average_score),
            "completion_rate": float(completion_rate),
            "pass_rate": float(pass_rate),
            "leaderboard": leaderboard
        }
    
    async def analyze_question_performance(
        self,
        question_id: int,
        question_answers: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Analyze question performance and difficulty
        
        Args:
            question_id: Question ID
            question_answers: List of student answers to this question
        
        Returns:
            Dictionary with question analysis
        """
        if not question_answers:
            return {
                "total_attempts": 0,
                "accuracy_rate": 0.0,
                "difficulty_index": 0.5,
                "discrimination_index": 0.0
            }
        
        df = pd.DataFrame(question_answers)
        
        total_attempts = len(df)
        correct_attempts = len(df[df['is_correct'] == True])
        accuracy_rate = (correct_attempts / total_attempts * 100) if total_attempts > 0 else 0
        
        # Difficulty index (P-value): proportion of students who answered correctly
        # 0 = very difficult, 1 = very easy
        difficulty_index = correct_attempts / total_attempts if total_attempts > 0 else 0.5
        
        # Discrimination index: correlation between answer correctness and total score
        if len(df) >= 10 and 'total_score' in df.columns:
            # Split into high and low performers
            df_sorted = df.sort_values('total_score', ascending=False)
            top_27_percent = int(len(df_sorted) * 0.27)
            
            high_performers = df_sorted.head(top_27_percent)
            low_performers = df_sorted.tail(top_27_percent)
            
            high_correct = len(high_performers[high_performers['is_correct'] == True])
            low_correct = len(low_performers[low_performers['is_correct'] == True])
            
            discrimination_index = ((high_correct - low_correct) / top_27_percent) if top_27_percent > 0 else 0.0
        else:
            discrimination_index = 0.0
        
        # Analyze wrong answer patterns
        if 'selected_option' in df.columns:
            option_distribution = df['selected_option'].value_counts().to_dict()
        else:
            option_distribution = {}
        
        return {
            "total_attempts": total_attempts,
            "correct_attempts": correct_attempts,
            "incorrect_attempts": total_attempts - correct_attempts,
            "accuracy_rate": float(accuracy_rate),
            "difficulty_index": float(difficulty_index),
            "discrimination_index": float(discrimination_index),
            "option_distribution": option_distribution,
            "average_time_seconds": float(df['time_spent'].mean()) if 'time_spent' in df.columns else 0.0
        }
    
    async def analyze_by_topic(
        self,
        quiz_results: List[Dict[str, Any]],
        questions_metadata: List[Dict[str, Any]]
    ) -> Dict[str, Dict[str, float]]:
        """
        Analyze performance by topic/subject
        
        Args:
            quiz_results: Quiz results with question-level data
            questions_metadata: Question metadata with topics
        
        Returns:
            Dictionary mapping topics to performance metrics
        """
        if not quiz_results or not questions_metadata:
            return {}
        
        # Create DataFrame with question metadata
        questions_df = pd.DataFrame(questions_metadata)
        results_df = pd.DataFrame(quiz_results)
        
        # Merge results with question metadata
        if 'question_id' in results_df.columns:
            merged_df = results_df.merge(
                questions_df,
                on='question_id',
                how='left'
            )
            
            # Group by topic
            if 'topic' in merged_df.columns:
                topic_analysis = merged_df.groupby('topic').agg({
                    'is_correct': ['sum', 'count', 'mean']
                }).reset_index()
                
                topic_dict = {}
                for _, row in topic_analysis.iterrows():
                    topic = row['topic']
                    topic_dict[topic] = {
                        "correct_count": int(row[('is_correct', 'sum')]),
                        "total_count": int(row[('is_correct', 'count')]),
                        "accuracy_rate": float(row[('is_correct', 'mean')] * 100)
                    }
                
                return topic_dict
        
        return {}
    
    async def calculate_score_distribution(
        self,
        quiz_results: List[Dict[str, Any]],
        bins: int = 10
    ) -> Dict[str, int]:
        """
        Calculate score distribution histogram
        
        Args:
            quiz_results: List of quiz results
            bins: Number of bins for histogram
        
        Returns:
            Dictionary mapping score ranges to counts
        """
        if not quiz_results:
            return {}
        
        df = pd.DataFrame(quiz_results)
        scores = df['score'].astype(float)
        
        # Create histogram
        hist, bin_edges = np.histogram(scores, bins=bins, range=(0, 100))
        
        distribution = {}
        for i in range(len(hist)):
            bin_label = f"{int(bin_edges[i])}-{int(bin_edges[i+1])}"
            distribution[bin_label] = int(hist[i])
        
        return distribution


