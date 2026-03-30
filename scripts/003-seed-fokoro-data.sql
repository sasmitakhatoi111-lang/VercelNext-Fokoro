-- Seed data for Fokoro Q&A Platform

-- Mark some topics as featured
UPDATE topics SET is_featured = true WHERE slug IN ('technology', 'programming', 'science', 'business');

-- Insert sample tags
INSERT INTO tags (name, slug, usage_count) VALUES
('javascript', 'javascript', 150),
('python', 'python', 120),
('react', 'react', 100),
('nextjs', 'nextjs', 80),
('ai', 'ai', 200),
('machine-learning', 'machine-learning', 95),
('web-development', 'web-development', 130),
('startup', 'startup', 75),
('productivity', 'productivity', 60),
('career', 'career', 85),
('fitness', 'fitness', 45),
('nutrition', 'nutrition', 40),
('investment', 'investment', 55),
('travel', 'travel', 35),
('books', 'books', 30)
ON CONFLICT (slug) DO NOTHING;

-- Insert demo users (password is 'demo123' - bcrypt hashed)
INSERT INTO users (username, email, password_hash, display_name, bio, reputation, question_count, answer_count) VALUES
('demo', 'demo@fokoro.com', '$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/9u', 'Demo User', 'A demo user for testing the platform', 100, 2, 0),
('techexpert', 'tech@fokoro.com', '$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/9u', 'Tech Expert', 'Software engineer with 10 years of experience', 500, 2, 2),
('scienceguru', 'science@fokoro.com', '$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/9u', 'Science Guru', 'PhD in Physics, passionate about science', 350, 2, 1)
ON CONFLICT (username) DO NOTHING;

-- Add some topic followers
UPDATE topics SET follower_count = 
  CASE 
    WHEN slug = 'technology' THEN 15420
    WHEN slug = 'programming' THEN 12350
    WHEN slug = 'science' THEN 8900
    WHEN slug = 'business' THEN 7500
    WHEN slug = 'health' THEN 6200
    WHEN slug = 'education' THEN 5100
    WHEN slug = 'lifestyle' THEN 4300
    WHEN slug = 'entertainment' THEN 3800
    ELSE follower_count
  END;
