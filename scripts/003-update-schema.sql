-- Add missing columns to topics table
ALTER TABLE topics ADD COLUMN IF NOT EXISTS color VARCHAR(20);
ALTER TABLE topics ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- Add location and website to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS location VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS website VARCHAR(500);

-- Create topic authorities table for tracking expert users in topics
CREATE TABLE IF NOT EXISTS topic_authorities (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  topic_id INT REFERENCES topics(id) ON DELETE CASCADE,
  authority_score INT DEFAULT 0,
  answer_count INT DEFAULT 0,
  accepted_answer_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, topic_id)
);

CREATE INDEX IF NOT EXISTS idx_topic_authorities_topic ON topic_authorities(topic_id);
CREATE INDEX IF NOT EXISTS idx_topic_authorities_score ON topic_authorities(authority_score DESC);

-- Create question_topics junction table for multiple topics per question
CREATE TABLE IF NOT EXISTS question_topics (
  question_id INT REFERENCES questions(id) ON DELETE CASCADE,
  topic_id INT REFERENCES topics(id) ON DELETE CASCADE,
  PRIMARY KEY (question_id, topic_id)
);

CREATE INDEX IF NOT EXISTS idx_question_topics_topic ON question_topics(topic_id);
