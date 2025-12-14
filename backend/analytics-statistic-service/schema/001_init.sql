CREATE TABLE quiz_performance_metrics (
  quiz_id INT PRIMARY KEY,
  avg_score FLOAT,
  median_score FLOAT,
  max_score FLOAT,
  min_score FLOAT,
  attempt_count INT,
  completion_rate FLOAT,
  updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE user_performance_summary (
  user_id INT PRIMARY KEY,
  avg_score FLOAT,
  completed_quizzes INT,
  completion_rate FLOAT,
  weak_topics JSONB,
  updated_at TIMESTAMP DEFAULT now()
);
