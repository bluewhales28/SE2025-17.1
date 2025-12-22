"""
Unit tests for Analytics Service
"""
import pytest
import pandas as pd
from unittest.mock import Mock, patch
from app.services.analytics_service import AnalyticsService

class TestAnalyticsService:
    
    @pytest.fixture
    def analytics_service(self):
        service = AnalyticsService()
        service.cache_service = Mock()  # Mock cache service
        service.cache_service.get.return_value = None
        service.cache_service.set.return_value = True
        return service
    
    def test_quiz_report_empty_data(self, analytics_service):
        """Test quiz report with no data"""
        with patch('app.services.analytics_service.get_db_connection') as mock_db:
            mock_conn = Mock()
            mock_cur = Mock()
            mock_cur.fetchall.return_value = []
            mock_conn.cursor.return_value = mock_cur
            mock_db.return_value = mock_conn
            
            result = analytics_service.quiz_report(1)
            assert result == {}
    
    def test_quiz_report_with_data(self, analytics_service):
        """Test quiz report with sample data"""
        sample_data = [
            {"user_id": 1, "score": 80, "total_score": 100, "topic": "Math", "difficulty": "Easy"},
            {"user_id": 2, "score": 90, "total_score": 100, "topic": "Math", "difficulty": "Easy"},
            {"user_id": 3, "score": 70, "total_score": 100, "topic": "Science", "difficulty": "Hard"},
        ]
        
        with patch('app.services.analytics_service.get_db_connection') as mock_db:
            mock_conn = Mock()
            mock_cur = Mock()
            mock_cur.fetchall.return_value = sample_data
            mock_conn.cursor.return_value = mock_cur
            mock_db.return_value = mock_conn
            
            result = analytics_service.quiz_report(1, use_cache=False)
            
            assert result["quiz_id"] == 1
            assert result["attempts"] == 3
            assert result["avg_score"] == 80.0
            assert "percentiles" in result
            assert "histogram" in result
    
    def test_student_report_weak_topics(self, analytics_service):
        """Test student report detects weak topics"""
        sample_data = [
            {"quiz_id": 1, "score": 50, "total_score": 100, "topic": "Math", "difficulty": "Easy"},
            {"quiz_id": 1, "score": 55, "total_score": 100, "topic": "Math", "difficulty": "Easy"},
            {"quiz_id": 2, "score": 90, "total_score": 100, "topic": "Science", "difficulty": "Hard"},
        ]
        
        with patch('app.services.analytics_service.get_db_connection') as mock_db:
            mock_conn = Mock()
            mock_cur = Mock()
            mock_cur.fetchall.return_value = sample_data
            mock_conn.cursor.return_value = mock_cur
            mock_db.return_value = mock_conn
            
            result = analytics_service.student_report(1, use_cache=False)
            
            assert result["student_id"] == 1
            assert "Math" in result["weak_topics"]
            assert "weak_topics" in result
    
    def test_question_analysis_difficulty(self, analytics_service):
        """Test question analysis calculates difficulty correctly"""
        sample_data = [
            {"score": 1, "total_score": 1, "user_id": 1},
            {"score": 1, "total_score": 1, "user_id": 2},
            {"score": 0, "total_score": 1, "user_id": 3},
        ]
        
        with patch('app.services.analytics_service.get_db_connection') as mock_db:
            mock_conn = Mock()
            mock_cur = Mock()
            mock_cur.fetchall.return_value = sample_data
            mock_conn.cursor.return_value = mock_cur
            mock_db.return_value = mock_conn
            
            with patch('pandas.read_sql') as mock_read_sql:
                df = pd.DataFrame(sample_data)
                mock_read_sql.return_value = df
                
                result = analytics_service.question_analysis(1, use_cache=False)
                
                assert "difficulty" in result
                assert "discrimination" in result
                assert "difficulty_level" in result
                assert "quality" in result

