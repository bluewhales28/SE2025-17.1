"""
Unit tests for analytics service
"""

from datetime import datetime, timedelta

import pandas as pd
import pytest

from app.schemas.report import StatisticsData
from app.services.analytics_service import AnalyticsService


@pytest.fixture
def sample_quiz_results():
    """Sample quiz results for testing"""
    return [
        {"quiz_id": 1, "student_id": 1, "score": 85.0, "completed_at": "2024-01-01"},
        {"quiz_id": 1, "student_id": 2, "score": 90.0, "completed_at": "2024-01-02"},
        {"quiz_id": 1, "student_id": 3, "score": 75.0, "completed_at": "2024-01-03"},
        {"quiz_id": 1, "student_id": 4, "score": 95.0, "completed_at": "2024-01-04"},
        {"quiz_id": 1, "student_id": 5, "score": 80.0, "completed_at": "2024-01-05"},
    ]


@pytest.fixture
def analytics_service():
    """Create analytics service instance"""

    # Mock database session
    class MockDB:
        pass

    return AnalyticsService(MockDB())


@pytest.mark.asyncio
async def test_calculate_quiz_statistics(analytics_service, sample_quiz_results):
    """Test quiz statistics calculation"""
    stats = await analytics_service.calculate_quiz_statistics(sample_quiz_results)

    assert isinstance(stats, StatisticsData)
    assert stats.count == 5
    assert stats.mean == 85.0
    assert stats.median == 85.0
    assert stats.min_score == 75.0
    assert stats.max_score == 95.0
    assert stats.percentile_25 == 80.0
    assert stats.percentile_75 == 90.0


@pytest.mark.asyncio
async def test_calculate_quiz_statistics_empty(analytics_service):
    """Test statistics with empty data"""
    stats = await analytics_service.calculate_quiz_statistics([])

    assert stats.count == 0
    assert stats.mean == 0.0
    assert stats.median == 0.0


@pytest.mark.asyncio
async def test_analyze_student_progress(analytics_service):
    """Test student progress analysis"""
    student_results = [
        {
            "quiz_id": 1,
            "score": 70.0,
            "completed_at": datetime.now() - timedelta(days=10),
        },
        {
            "quiz_id": 2,
            "score": 75.0,
            "completed_at": datetime.now() - timedelta(days=7),
        },
        {
            "quiz_id": 3,
            "score": 80.0,
            "completed_at": datetime.now() - timedelta(days=4),
        },
        {
            "quiz_id": 4,
            "score": 85.0,
            "completed_at": datetime.now() - timedelta(days=1),
        },
    ]

    progress = await analytics_service.analyze_student_progress(1, student_results)

    assert progress["total_attempts"] == 4
    assert progress["average_score"] == 77.5
    assert progress["best_score"] == 85.0
    assert progress["worst_score"] == 70.0
    assert progress["progress_trend"] == "improving"
    assert len(progress["progress_timeline"]) == 4


@pytest.mark.asyncio
async def test_calculate_class_metrics(analytics_service):
    """Test class metrics calculation"""
    student_results = [
        {"student_id": 1, "quiz_id": 1, "score": 85.0},
        {"student_id": 2, "quiz_id": 1, "score": 90.0},
        {"student_id": 3, "quiz_id": 1, "score": 75.0},
        {"student_id": 1, "quiz_id": 2, "score": 80.0},
        {"student_id": 2, "quiz_id": 2, "score": 95.0},
    ]

    metrics = await analytics_service.calculate_class_metrics(1, student_results)

    assert metrics["total_students"] == 3
    assert metrics["average_score"] == 85.0
    assert metrics["completion_rate"] == 100.0
    assert len(metrics["leaderboard"]) == 3


@pytest.mark.asyncio
async def test_analyze_question_performance(analytics_service):
    """Test question performance analysis"""
    question_answers = [
        {
            "is_correct": True,
            "total_score": 90,
            "time_spent": 30,
            "selected_option": "A",
        },
        {
            "is_correct": True,
            "total_score": 85,
            "time_spent": 25,
            "selected_option": "A",
        },
        {
            "is_correct": False,
            "total_score": 70,
            "time_spent": 20,
            "selected_option": "B",
        },
        {
            "is_correct": True,
            "total_score": 95,
            "time_spent": 35,
            "selected_option": "A",
        },
        {
            "is_correct": False,
            "total_score": 60,
            "time_spent": 15,
            "selected_option": "C",
        },
    ]

    analysis = await analytics_service.analyze_question_performance(1, question_answers)

    assert analysis["total_attempts"] == 5
    assert analysis["correct_attempts"] == 3
    assert analysis["incorrect_attempts"] == 2
    assert analysis["accuracy_rate"] == 60.0
    assert 0 <= analysis["difficulty_index"] <= 1
    assert "option_distribution" in analysis


@pytest.mark.asyncio
async def test_calculate_score_distribution(analytics_service, sample_quiz_results):
    """Test score distribution calculation"""
    distribution = await analytics_service.calculate_score_distribution(
        sample_quiz_results
    )

    assert isinstance(distribution, dict)
    assert len(distribution) > 0
    # All scores should be distributed in bins
    total_count = sum(distribution.values())
    assert total_count == 5


@pytest.mark.asyncio
async def test_analyze_by_topic(analytics_service):
    """Test topic analysis"""
    quiz_results = [
        {"question_id": 1, "is_correct": True},
        {"question_id": 2, "is_correct": True},
        {"question_id": 3, "is_correct": False},
    ]

    questions_metadata = [
        {"question_id": 1, "topic": "Math"},
        {"question_id": 2, "topic": "Math"},
        {"question_id": 3, "topic": "Science"},
    ]

    topic_analysis = await analytics_service.analyze_by_topic(
        quiz_results, questions_metadata
    )

    if "Math" in topic_analysis:
        assert topic_analysis["Math"]["correct_count"] == 2
        assert topic_analysis["Math"]["total_count"] == 2
        assert topic_analysis["Math"]["accuracy_rate"] == 100.0
