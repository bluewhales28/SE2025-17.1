"""
Tests for fraud detection service
"""
import pytest
from datetime import datetime

from app.services.fraud_detection import FraudDetectionService


@pytest.fixture
def fraud_service():
    """Create fraud detection service"""
    class MockDB:
        def add(self, obj):
            pass
        
        async def commit(self):
            pass
        
        async def refresh(self, obj):
            pass
        
        async def execute(self, query):
            class Result:
                def scalars(self):
                    return self
                def all(self):
                    return []
                def scalar_one_or_none(self):
                    return None
            return Result()
    
    return FraudDetectionService(MockDB())


@pytest.mark.asyncio
async def test_detect_similar_submissions(fraud_service):
    """Test similar submission detection"""
    submissions = [
        {
            "student_id": 1,
            "answers": [
                {"selected_option": "A"},
                {"selected_option": "B"},
                {"selected_option": "C"},
            ]
        },
        {
            "student_id": 2,
            "answers": [
                {"selected_option": "A"},
                {"selected_option": "B"},
                {"selected_option": "C"},
            ]
        }
    ]
    
    anomalies = await fraud_service.detect_similar_submissions(1, submissions)
    
    # Should detect high similarity
    assert len(anomalies) > 0
    assert anomalies[0]["type"] == "similar_submissions"
    assert anomalies[0]["similarity_score"] >= 0.9


@pytest.mark.asyncio
async def test_detect_abnormal_speed_fast(fraud_service):
    """Test abnormal speed detection for very fast completion"""
    submission = {
        "student_id": 1,
        "time_spent": 20,  # 20 seconds, very fast
        "score": 90.0
    }
    
    anomaly = await fraud_service.detect_abnormal_speed(1, submission, 300)
    
    assert anomaly is not None
    assert anomaly["type"] == "abnormal_speed"
    assert "time_spent" in anomaly


@pytest.mark.asyncio
async def test_detect_abnormal_speed_normal(fraud_service):
    """Test normal speed completion"""
    submission = {
        "student_id": 1,
        "time_spent": 300,  # 5 minutes, normal
        "score": 85.0
    }
    
    anomaly = await fraud_service.detect_abnormal_speed(1, submission, 350)
    
    assert anomaly is None


@pytest.mark.asyncio
async def test_detect_pattern_anomaly_uniform(fraud_service):
    """Test detection of uniform answer pattern"""
    submission = {
        "student_id": 1,
        "answers": [
            {"selected_option": "A"},
            {"selected_option": "A"},
            {"selected_option": "A"},
            {"selected_option": "A"},
            {"selected_option": "A"},
            {"selected_option": "A"},
        ]
    }
    
    anomaly = await fraud_service.detect_pattern_anomaly(1, submission)
    
    assert anomaly is not None
    assert anomaly["type"] == "pattern_anomaly"


@pytest.mark.asyncio
async def test_detect_pattern_anomaly_normal(fraud_service):
    """Test normal answer pattern"""
    submission = {
        "student_id": 1,
        "answers": [
            {"selected_option": "A"},
            {"selected_option": "B"},
            {"selected_option": "C"},
            {"selected_option": "A"},
            {"selected_option": "D"},
        ]
    }
    
    anomaly = await fraud_service.detect_pattern_anomaly(1, submission)
    
    # Should not detect anomaly in normal pattern
    assert anomaly is None


def test_calculate_submission_similarity(fraud_service):
    """Test similarity calculation"""
    answers1 = [
        {"selected_option": "A"},
        {"selected_option": "B"},
        {"selected_option": "C"},
    ]
    
    answers2 = [
        {"selected_option": "A"},
        {"selected_option": "B"},
        {"selected_option": "C"},
    ]
    
    similarity = fraud_service._calculate_submission_similarity(answers1, answers2)
    
    assert similarity == 1.0  # Identical submissions
    
    answers3 = [
        {"selected_option": "D"},
        {"selected_option": "E"},
        {"selected_option": "F"},
    ]
    
    similarity2 = fraud_service._calculate_submission_similarity(answers1, answers3)
    
    assert similarity2 < 1.0  # Different submissions


