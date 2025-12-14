CREATE TABLE class_engagement_stats (
  class_id INT PRIMARY KEY,
  avg_score FLOAT,
  completion_rate FLOAT,
  active_students INT,
  top_students JSONB,
  updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE question_analytics (
  question_id INT PRIMARY KEY,
  correct_rate FLOAT,
  difficulty_index FLOAT,
  discrimination_index FLOAT,
  topic VARCHAR(100),
  updated_at TIMESTAMP DEFAULT now()
);
