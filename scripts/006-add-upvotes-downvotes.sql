-- Add upvotes and downvotes columns to questions
DO $$ BEGIN
  ALTER TABLE questions ADD COLUMN upvotes INT DEFAULT 0;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE questions ADD COLUMN downvotes INT DEFAULT 0;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Add upvotes and downvotes columns to answers
DO $$ BEGIN
  ALTER TABLE answers ADD COLUMN upvotes INT DEFAULT 0;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE answers ADD COLUMN downvotes INT DEFAULT 0;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Add content_type and content_id to votes for flexible voting
DO $$ BEGIN
  ALTER TABLE votes ADD COLUMN content_type VARCHAR(20);
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE votes ADD COLUMN content_id INT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Ensure author_id column exists
DO $$ BEGIN
  ALTER TABLE questions ADD COLUMN author_id INT REFERENCES users(id);
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE answers ADD COLUMN author_id INT REFERENCES users(id);
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Copy user_id to author_id if author_id is null
UPDATE questions SET author_id = user_id WHERE author_id IS NULL AND user_id IS NOT NULL;
UPDATE answers SET author_id = user_id WHERE author_id IS NULL AND user_id IS NOT NULL;

-- Initialize upvotes from vote_count
UPDATE questions SET upvotes = COALESCE(vote_count, 0) WHERE upvotes = 0 AND vote_count > 0;
UPDATE answers SET upvotes = COALESCE(vote_count, 0) WHERE upvotes = 0 AND vote_count > 0;
