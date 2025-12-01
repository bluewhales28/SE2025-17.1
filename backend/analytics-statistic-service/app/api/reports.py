"""
Report API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from app.dependencies import get_db
from app.schemas.report import (
    QuizReportResponse,
    StudentProgressResponse,
    ClassStatisticsResponse,
    QuestionAnalysisResponse
)
from app.services.analytics_service import AnalyticsService
from app.services.cache_service import cache_service
from app.services.external_service import quiz_service, class_service

router = APIRouter()


@router.get("/quiz/{quiz_id}", response_model=QuizReportResponse)
async def get_quiz_report(
    quiz_id: int,
    db: AsyncSession = Depends(get_db),
    authorization: Optional[str] = Header(None)
):
    """
    Get comprehensive report for a quiz
    
    Args:
        quiz_id: Quiz ID
        db: Database session
        authorization: Bearer token
    
    Returns:
        Quiz report with statistics
    """
    token = authorization.replace("Bearer ", "") if authorization else None
    
    # Generate cache key
    cache_key = cache_service.generate_cache_key("quiz_report", quiz_id=quiz_id)
    
    async def compute_quiz_report():
        # Fetch quiz details from Quiz Service
        quiz_data = await quiz_service.get_quiz(quiz_id, token)
        if not quiz_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Quiz not found"
            )
        
        # Fetch quiz results
        quiz_results = await quiz_service.get_quiz_results(quiz_id, token)
        if not quiz_results:
            return {
                "quiz_id": quiz_id,
                "quiz_title": quiz_data.get("title", "Unknown"),
                "total_attempts": 0,
                "unique_students": 0,
                "statistics": {
                    "mean": 0.0,
                    "median": 0.0,
                    "std_dev": 0.0,
                    "min_score": 0.0,
                    "max_score": 0.0,
                    "count": 0,
                    "percentile_25": 0.0,
                    "percentile_50": 0.0,
                    "percentile_75": 0.0
                },
                "completion_rate": 0.0,
                "average_time_minutes": 0.0,
                "pass_rate": 0.0,
                "score_distribution": {},
                "difficulty_analysis": {}
            }
        
        # Analyze with Analytics Service
        analytics = AnalyticsService(db)
        statistics = await analytics.calculate_quiz_statistics(quiz_results)
        score_dist = await analytics.calculate_score_distribution(quiz_results)
        
        # Calculate additional metrics
        unique_students = len(set(r.get("student_id") for r in quiz_results))
        total_time = sum(r.get("time_spent", 0) for r in quiz_results)
        avg_time = (total_time / len(quiz_results) / 60) if quiz_results else 0
        
        passing_threshold = 60.0
        passed = sum(1 for r in quiz_results if r.get("score", 0) >= passing_threshold)
        pass_rate = (passed / len(quiz_results) * 100) if quiz_results else 0
        
        return {
            "quiz_id": quiz_id,
            "quiz_title": quiz_data.get("title", "Unknown"),
            "total_attempts": len(quiz_results),
            "unique_students": unique_students,
            "statistics": statistics.dict(),
            "completion_rate": 100.0,  # All results are completed
            "average_time_minutes": avg_time,
            "pass_rate": pass_rate,
            "score_distribution": score_dist,
            "difficulty_analysis": {
                "average_difficulty": statistics.mean / 100,
                "variance": statistics.std_dev
            }
        }
    
    result = await cache_service.get_or_compute(
        cache_key,
        compute_quiz_report,
        ttl=1800  # 30 minutes
    )
    
    return result


@router.get("/student/{student_id}", response_model=StudentProgressResponse)
async def get_student_progress(
    student_id: int,
    db: AsyncSession = Depends(get_db),
    authorization: Optional[str] = Header(None)
):
    """
    Get student progress and performance analysis
    
    Args:
        student_id: Student ID
        db: Database session
        authorization: Bearer token
    
    Returns:
        Student progress report
    """
    token = authorization.replace("Bearer ", "") if authorization else None
    
    cache_key = cache_service.generate_cache_key("student_progress", student_id=student_id)
    
    async def compute_student_progress():
        # Fetch student details
        student_data = await class_service.get_student(student_id, token)
        if not student_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Student not found"
            )
        
        # Fetch student's quiz attempts
        attempts = await quiz_service.get_student_quiz_attempts(student_id, token)
        if not attempts:
            return {
                "student_id": student_id,
                "student_name": student_data.get("name", "Unknown"),
                "total_quizzes_attempted": 0,
                "total_quizzes_completed": 0,
                "average_score": 0.0,
                "best_score": 0.0,
                "worst_score": 0.0,
                "completion_rate": 0.0,
                "total_time_spent_minutes": 0.0,
                "progress_over_time": [],
                "strengths": [],
                "weaknesses": [],
                "topic_performance": {},
                "recent_attempts": []
            }
        
        # Analyze progress
        analytics = AnalyticsService(db)
        progress = await analytics.analyze_student_progress(student_id, attempts)
        
        completed = [a for a in attempts if a.get("completed", False)]
        total_time = sum(a.get("time_spent", 0) for a in attempts) / 60
        
        return {
            "student_id": student_id,
            "student_name": student_data.get("name", "Unknown"),
            "total_quizzes_attempted": len(attempts),
            "total_quizzes_completed": len(completed),
            "average_score": progress["average_score"],
            "best_score": progress["best_score"],
            "worst_score": progress["worst_score"],
            "completion_rate": (len(completed) / len(attempts) * 100) if attempts else 0,
            "total_time_spent_minutes": total_time,
            "progress_over_time": progress["progress_timeline"],
            "strengths": [],
            "weaknesses": [],
            "topic_performance": {},
            "recent_attempts": attempts[-5:]
        }
    
    result = await cache_service.get_or_compute(
        cache_key,
        compute_student_progress,
        ttl=900  # 15 minutes
    )
    
    return result


@router.get("/class/{class_id}", response_model=ClassStatisticsResponse)
async def get_class_statistics(
    class_id: int,
    db: AsyncSession = Depends(get_db),
    authorization: Optional[str] = Header(None)
):
    """
    Get class statistics and leaderboard
    
    Args:
        class_id: Class ID
        db: Database session
        authorization: Bearer token
    
    Returns:
        Class statistics report
    """
    token = authorization.replace("Bearer ", "") if authorization else None
    
    cache_key = cache_service.generate_cache_key("class_stats", class_id=class_id)
    
    async def compute_class_statistics():
        # Fetch class details
        class_data = await class_service.get_class(class_id, token)
        if not class_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Class not found"
            )
        
        # Fetch students
        students = await class_service.get_class_students(class_id, token)
        
        # Fetch all quiz results for the class
        # This would need to aggregate results from all students
        # For now, we'll use a placeholder
        student_results = []
        
        analytics = AnalyticsService(db)
        class_metrics = await analytics.calculate_class_metrics(class_id, student_results)
        
        return {
            "class_id": class_id,
            "class_name": class_data.get("name", "Unknown"),
            "total_students": len(students),
            "active_students": class_metrics.get("total_students", 0),
            "total_quizzes": 0,
            "average_score": class_metrics.get("average_score", 0.0),
            "completion_rate": class_metrics.get("completion_rate", 0.0),
            "pass_rate": class_metrics.get("pass_rate", 0.0),
            "statistics": {
                "mean": 0.0,
                "median": 0.0,
                "std_dev": 0.0,
                "min_score": 0.0,
                "max_score": 0.0,
                "count": 0,
                "percentile_25": 0.0,
                "percentile_50": 0.0,
                "percentile_75": 0.0
            },
            "leaderboard": [
                {
                    "student_id": entry["student_id"],
                    "student_name": f"Student {entry['student_id']}",
                    "score": entry["avg_score"],
                    "rank": entry["rank"],
                    "completion_rate": 0.0
                }
                for entry in class_metrics.get("leaderboard", [])[:10]
            ],
            "score_distribution": {},
            "activity_timeline": [],
            "top_performers": [],
            "struggling_students": []
        }
    
    result = await cache_service.get_or_compute(
        cache_key,
        compute_class_statistics,
        ttl=1800  # 30 minutes
    )
    
    return result


@router.get("/question/{question_id}", response_model=QuestionAnalysisResponse)
async def get_question_analysis(
    question_id: int,
    db: AsyncSession = Depends(get_db),
    authorization: Optional[str] = Header(None)
):
    """
    Get question performance analysis
    
    Args:
        question_id: Question ID
        db: Database session
        authorization: Bearer token
    
    Returns:
        Question analysis report
    """
    token = authorization.replace("Bearer ", "") if authorization else None
    
    cache_key = cache_service.generate_cache_key("question_analysis", question_id=question_id)
    
    async def compute_question_analysis():
        # Fetch question details
        question_data = await quiz_service.get_question_details(question_id, token)
        if not question_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Question not found"
            )
        
        # Fetch question answers (this would come from results)
        question_answers = []  # Placeholder
        
        analytics = AnalyticsService(db)
        analysis = await analytics.analyze_question_performance(question_id, question_answers)
        
        return {
            "question_id": question_id,
            "question_text": question_data.get("text", "Unknown"),
            "question_type": question_data.get("type", "mcq"),
            "total_attempts": analysis["total_attempts"],
            "correct_attempts": analysis["correct_attempts"],
            "incorrect_attempts": analysis["incorrect_attempts"],
            "accuracy_rate": analysis["accuracy_rate"],
            "difficulty_index": analysis["difficulty_index"],
            "discrimination_index": analysis["discrimination_index"],
            "average_time_seconds": analysis["average_time_seconds"],
            "options_analysis": [],
            "common_mistakes": [],
            "topic": question_data.get("topic"),
            "difficulty_level": question_data.get("difficulty")
        }
    
    result = await cache_service.get_or_compute(
        cache_key,
        compute_question_analysis,
        ttl=3600  # 60 minutes
    )
    
    return result


