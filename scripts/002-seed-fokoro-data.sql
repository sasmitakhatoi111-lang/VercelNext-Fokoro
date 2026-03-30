-- Seed data for Fokoro Q&A Platform

-- Insert sample topics
INSERT INTO topics (name, slug, description, icon) VALUES
('Technology', 'technology', 'Questions about software, hardware, and tech trends', 'laptop'),
('Programming', 'programming', 'Coding, software development, and programming languages', 'code'),
('Science', 'science', 'Scientific discoveries, research, and natural phenomena', 'flask'),
('Health', 'health', 'Medical advice, fitness, nutrition, and wellness', 'heart'),
('Business', 'business', 'Entrepreneurship, finance, marketing, and career advice', 'briefcase'),
('Education', 'education', 'Learning, teaching, and academic topics', 'book'),
('Lifestyle', 'lifestyle', 'Daily life, hobbies, travel, and personal development', 'compass'),
('Entertainment', 'entertainment', 'Movies, music, games, and pop culture', 'film')
ON CONFLICT (slug) DO NOTHING;

-- Insert related topics
INSERT INTO related_topics (topic_id, related_topic_id)
SELECT t1.id, t2.id FROM topics t1, topics t2 
WHERE t1.slug = 'technology' AND t2.slug = 'programming'
ON CONFLICT DO NOTHING;

INSERT INTO related_topics (topic_id, related_topic_id)
SELECT t1.id, t2.id FROM topics t1, topics t2 
WHERE t1.slug = 'programming' AND t2.slug = 'technology'
ON CONFLICT DO NOTHING;

INSERT INTO related_topics (topic_id, related_topic_id)
SELECT t1.id, t2.id FROM topics t1, topics t2 
WHERE t1.slug = 'science' AND t2.slug = 'health'
ON CONFLICT DO NOTHING;

INSERT INTO related_topics (topic_id, related_topic_id)
SELECT t1.id, t2.id FROM topics t1, topics t2 
WHERE t1.slug = 'business' AND t2.slug = 'education'
ON CONFLICT DO NOTHING;

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

-- Insert demo user (password is 'demo123' - bcrypt hashed)
INSERT INTO users (username, email, password_hash, display_name, bio, reputation) VALUES
('demo', 'demo@fokoro.com', '$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/9u', 'Demo User', 'A demo user for testing the platform', 100),
('techexpert', 'tech@fokoro.com', '$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/9u', 'Tech Expert', 'Software engineer with 10 years of experience', 500),
('scienceguru', 'science@fokoro.com', '$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/9u', 'Science Guru', 'PhD in Physics, passionate about explaining complex topics', 350)
ON CONFLICT (username) DO NOTHING;

-- Insert sample questions
INSERT INTO questions (title, slug, description, user_id, topic_id, view_count, answer_count, vote_count) 
SELECT 
  'What is the best way to learn programming in 2024?',
  'what-is-the-best-way-to-learn-programming-in-2024',
  'I am a complete beginner looking to start my programming journey. What resources, languages, and approaches would you recommend for someone starting from scratch? Should I focus on web development, mobile apps, or something else?',
  u.id,
  t.id,
  1250,
  5,
  42
FROM users u, topics t 
WHERE u.username = 'demo' AND t.slug = 'programming'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO questions (title, slug, description, user_id, topic_id, view_count, answer_count, vote_count) 
SELECT 
  'How does artificial intelligence actually work?',
  'how-does-artificial-intelligence-actually-work',
  'I keep hearing about AI and machine learning but I do not really understand how it works under the hood. Can someone explain the basic concepts in simple terms?',
  u.id,
  t.id,
  2100,
  8,
  67
FROM users u, topics t 
WHERE u.username = 'techexpert' AND t.slug = 'technology'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO questions (title, slug, description, user_id, topic_id, view_count, answer_count, vote_count) 
SELECT 
  'What are the most effective study techniques backed by science?',
  'what-are-the-most-effective-study-techniques-backed-by-science',
  'I am preparing for important exams and want to optimize my study time. What techniques have been proven to work by research?',
  u.id,
  t.id,
  890,
  4,
  35
FROM users u, topics t 
WHERE u.username = 'scienceguru' AND t.slug = 'education'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO questions (title, slug, description, user_id, topic_id, view_count, answer_count, vote_count) 
SELECT 
  'How to start a successful side business while working full-time?',
  'how-to-start-a-successful-side-business-while-working-full-time',
  'I want to start building something on the side but I am not sure how to manage time and energy. What strategies have worked for others?',
  u.id,
  t.id,
  1500,
  6,
  52
FROM users u, topics t 
WHERE u.username = 'demo' AND t.slug = 'business'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO questions (title, slug, description, user_id, topic_id, view_count, answer_count, vote_count) 
SELECT 
  'What is the science behind intermittent fasting?',
  'what-is-the-science-behind-intermittent-fasting',
  'Intermittent fasting seems to be very popular. Is there actual scientific evidence supporting its benefits? What are the potential risks?',
  u.id,
  t.id,
  1800,
  7,
  48
FROM users u, topics t 
WHERE u.username = 'scienceguru' AND t.slug = 'health'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO questions (title, slug, description, user_id, topic_id, view_count, answer_count, vote_count) 
SELECT 
  'Why is React still so popular in 2024?',
  'why-is-react-still-so-popular-in-2024',
  'With so many new frameworks coming out, why does React continue to dominate? What makes it special compared to alternatives like Vue or Svelte?',
  u.id,
  t.id,
  950,
  4,
  28
FROM users u, topics t 
WHERE u.username = 'techexpert' AND t.slug = 'programming'
ON CONFLICT (slug) DO NOTHING;

-- Insert sample answers
INSERT INTO answers (content, question_id, user_id, vote_count, is_accepted)
SELECT 
  'The best approach for beginners in 2024 is to start with web development fundamentals. Here is my recommended path:

1. **Learn HTML and CSS first** - These are the building blocks of the web and will give you immediate visual feedback.

2. **Pick JavaScript as your first programming language** - It is versatile, runs everywhere, and has a huge community.

3. **Use free resources wisely** - freeCodeCamp, The Odin Project, and MDN Web Docs are excellent starting points.

4. **Build projects from day one** - Do not just watch tutorials. Build something, even if it is simple.

5. **Join communities** - Discord servers, Reddit, and local meetups can provide support and motivation.

The key is consistency over intensity. 30 minutes daily is better than 5 hours once a week.',
  q.id,
  u.id,
  25,
  true
FROM questions q, users u 
WHERE q.slug = 'what-is-the-best-way-to-learn-programming-in-2024' AND u.username = 'techexpert'
ON CONFLICT DO NOTHING;

INSERT INTO answers (content, question_id, user_id, vote_count)
SELECT 
  'At its core, AI works by finding patterns in data. Think of it like this:

**Traditional Programming**: You write rules, computer follows them.
**Machine Learning**: You give examples, computer learns the rules.

For example, to recognize cats in photos:
- Traditional: Write rules for whiskers, ears, fur patterns (very hard!)
- ML: Show millions of cat photos, algorithm learns what makes a cat

The magic happens through **neural networks** - layers of mathematical operations that transform input data step by step until they can make predictions. Deep learning uses many layers, hence "deep."

The recent AI boom (ChatGPT, etc.) uses **transformers** - a special architecture that is really good at understanding context and relationships in data.',
  q.id,
  u.id,
  45,
  true
FROM questions q, users u 
WHERE q.slug = 'how-does-artificial-intelligence-actually-work' AND u.username = 'scienceguru'
ON CONFLICT DO NOTHING;

-- Update question counts for topics
UPDATE topics SET question_count = (
  SELECT COUNT(*) FROM questions WHERE questions.topic_id = topics.id
);

-- Mark questions with accepted answers
UPDATE questions SET is_answered = true, accepted_answer_id = a.id
FROM answers a 
WHERE a.question_id = questions.id AND a.is_accepted = true;
