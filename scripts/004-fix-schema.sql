-- Add missing columns (using IF NOT EXISTS pattern)

-- Add is_featured to topics if not exists
DO $$ BEGIN
  ALTER TABLE topics ADD COLUMN is_featured BOOLEAN DEFAULT false;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Add usage_count to tags if not exists
DO $$ BEGIN
  ALTER TABLE tags ADD COLUMN usage_count INT DEFAULT 0;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Insert sample topics if not exists
INSERT INTO topics (name, slug, description, icon, is_featured) VALUES
('Technology', 'technology', 'Questions about software, hardware, and tech trends', '💻', true),
('Programming', 'programming', 'Coding, software development, and programming languages', '👨‍💻', true),
('Science', 'science', 'Scientific discoveries, research, and natural phenomena', '🔬', true),
('Health', 'health', 'Medical advice, fitness, nutrition, and wellness', '❤️', false),
('Business', 'business', 'Entrepreneurship, finance, marketing, and career advice', '💼', true),
('Education', 'education', 'Learning, teaching, and academic topics', '📚', false),
('Lifestyle', 'lifestyle', 'Daily life, hobbies, travel, and personal development', '🌍', false),
('Entertainment', 'entertainment', 'Movies, music, games, and pop culture', '🎬', false)
ON CONFLICT (slug) DO UPDATE SET is_featured = EXCLUDED.is_featured, icon = EXCLUDED.icon;

-- Update topic follower counts
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
