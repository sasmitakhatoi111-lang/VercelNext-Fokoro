-- Add missing columns to users table
DO $$ BEGIN
  ALTER TABLE users ADD COLUMN question_count INT DEFAULT 0;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE users ADD COLUMN answer_count INT DEFAULT 0;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Insert sample tags
INSERT INTO tags (name, slug) VALUES
('javascript', 'javascript'),
('python', 'python'),
('react', 'react'),
('nextjs', 'nextjs'),
('ai', 'ai'),
('machine-learning', 'machine-learning'),
('web-development', 'web-development'),
('startup', 'startup'),
('productivity', 'productivity'),
('career', 'career'),
('fitness', 'fitness'),
('nutrition', 'nutrition'),
('investment', 'investment'),
('travel', 'travel'),
('books', 'books')
ON CONFLICT (slug) DO NOTHING;

-- Insert demo users (password is 'demo123' - bcrypt hashed)
INSERT INTO users (username, email, password_hash, display_name, bio, reputation) VALUES
('demo', 'demo@fokoro.com', '$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/9u', 'Demo User', 'A demo user for testing the platform', 100),
('techexpert', 'tech@fokoro.com', '$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/9u', 'Tech Expert', 'Software engineer with 10 years of experience', 500),
('scienceguru', 'science@fokoro.com', '$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/9u', 'Science Guru', 'PhD in Physics, passionate about science', 350)
ON CONFLICT (username) DO NOTHING;
