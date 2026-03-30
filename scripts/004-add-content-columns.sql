-- Add content column to questions (the API code uses 'content', schema has 'description')
ALTER TABLE questions ADD COLUMN IF NOT EXISTS content TEXT;

-- Add author_id column to questions and answers (API uses author_id, schema has user_id)
ALTER TABLE questions ADD COLUMN IF NOT EXISTS author_id INT REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE answers ADD COLUMN IF NOT EXISTS author_id INT REFERENCES users(id) ON DELETE SET NULL;

-- Copy data from user_id to author_id if user_id exists and has data
UPDATE questions SET author_id = user_id WHERE author_id IS NULL AND user_id IS NOT NULL;
UPDATE answers SET author_id = user_id WHERE author_id IS NULL AND user_id IS NOT NULL;

-- Copy data from description to content if content is null
UPDATE questions SET content = description WHERE content IS NULL AND description IS NOT NULL;

-- Create indexes for author_id
CREATE INDEX IF NOT EXISTS idx_questions_author ON questions(author_id);
CREATE INDEX IF NOT EXISTS idx_answers_author ON answers(author_id);
