-- Fokoro Q&A Platform Database Schema
-- AWS Aurora PostgreSQL

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(100),
  bio TEXT,
  avatar_url VARCHAR(500),
  reputation INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Topics table
CREATE TABLE IF NOT EXISTS topics (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  question_count INT DEFAULT 0,
  follower_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tags table
CREATE TABLE IF NOT EXISTS tags (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  slug VARCHAR(50) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Questions table
CREATE TABLE IF NOT EXISTS questions (
  id SERIAL PRIMARY KEY,
  title VARCHAR(300) NOT NULL,
  slug VARCHAR(350) UNIQUE NOT NULL,
  description TEXT,
  user_id INT REFERENCES users(id) ON DELETE SET NULL,
  topic_id INT REFERENCES topics(id) ON DELETE SET NULL,
  view_count INT DEFAULT 0,
  answer_count INT DEFAULT 0,
  vote_count INT DEFAULT 0,
  is_answered BOOLEAN DEFAULT false,
  accepted_answer_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Question tags junction table
CREATE TABLE IF NOT EXISTS question_tags (
  question_id INT REFERENCES questions(id) ON DELETE CASCADE,
  tag_id INT REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (question_id, tag_id)
);

-- Answers table
CREATE TABLE IF NOT EXISTS answers (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  question_id INT REFERENCES questions(id) ON DELETE CASCADE,
  user_id INT REFERENCES users(id) ON DELETE SET NULL,
  vote_count INT DEFAULT 0,
  is_accepted BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key for accepted_answer_id after answers table exists
ALTER TABLE questions 
  ADD CONSTRAINT fk_accepted_answer 
  FOREIGN KEY (accepted_answer_id) 
  REFERENCES answers(id) 
  ON DELETE SET NULL;

-- Votes table (for both questions and answers)
CREATE TABLE IF NOT EXISTS votes (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  question_id INT REFERENCES questions(id) ON DELETE CASCADE,
  answer_id INT REFERENCES answers(id) ON DELETE CASCADE,
  vote_type SMALLINT NOT NULL CHECK (vote_type IN (-1, 1)),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT vote_target CHECK (
    (question_id IS NOT NULL AND answer_id IS NULL) OR
    (question_id IS NULL AND answer_id IS NOT NULL)
  ),
  CONSTRAINT unique_question_vote UNIQUE (user_id, question_id),
  CONSTRAINT unique_answer_vote UNIQUE (user_id, answer_id)
);

-- Topic follows table
CREATE TABLE IF NOT EXISTS topic_follows (
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  topic_id INT REFERENCES topics(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, topic_id)
);

-- Related topics table
CREATE TABLE IF NOT EXISTS related_topics (
  topic_id INT REFERENCES topics(id) ON DELETE CASCADE,
  related_topic_id INT REFERENCES topics(id) ON DELETE CASCADE,
  PRIMARY KEY (topic_id, related_topic_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_questions_slug ON questions(slug);
CREATE INDEX IF NOT EXISTS idx_questions_topic ON questions(topic_id);
CREATE INDEX IF NOT EXISTS idx_questions_user ON questions(user_id);
CREATE INDEX IF NOT EXISTS idx_questions_created ON questions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_questions_votes ON questions(vote_count DESC);
CREATE INDEX IF NOT EXISTS idx_questions_trending ON questions(vote_count DESC, answer_count DESC, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_topics_slug ON topics(slug);

CREATE INDEX IF NOT EXISTS idx_answers_question ON answers(question_id);
CREATE INDEX IF NOT EXISTS idx_answers_user ON answers(user_id);
CREATE INDEX IF NOT EXISTS idx_answers_votes ON answers(vote_count DESC);

CREATE INDEX IF NOT EXISTS idx_votes_user ON votes(user_id);
CREATE INDEX IF NOT EXISTS idx_votes_question ON votes(question_id);
CREATE INDEX IF NOT EXISTS idx_votes_answer ON votes(answer_id);

CREATE INDEX IF NOT EXISTS idx_topic_follows_user ON topic_follows(user_id);
CREATE INDEX IF NOT EXISTS idx_topic_follows_topic ON topic_follows(topic_id);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Full text search indexes
CREATE INDEX IF NOT EXISTS idx_questions_search ON questions USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '')));
CREATE INDEX IF NOT EXISTS idx_topics_search ON topics USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));
