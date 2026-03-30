-- Seed data for Fokoro Q&A Platform

-- Insert sample topics with colors
INSERT INTO topics (name, slug, description, icon, color, is_featured, question_count, follower_count) VALUES
('Technology', 'technology', 'Questions about software, hardware, and tech trends', 'T', '#3b82f6', true, 0, 1250),
('Programming', 'programming', 'Coding, software development, and programming languages', 'P', '#8b5cf6', true, 0, 2100),
('Science', 'science', 'Scientific discoveries, research, and natural phenomena', 'S', '#10b981', true, 0, 890),
('Health', 'health', 'Medical advice, fitness, nutrition, and wellness', 'H', '#ef4444', true, 0, 1500),
('Business', 'business', 'Entrepreneurship, finance, marketing, and career advice', 'B', '#f59e0b', true, 0, 1800),
('Education', 'education', 'Learning, teaching, and academic topics', 'E', '#06b6d4', false, 0, 650),
('Lifestyle', 'lifestyle', 'Daily life, hobbies, travel, and personal development', 'L', '#ec4899', false, 0, 420),
('Entertainment', 'entertainment', 'Movies, music, games, and pop culture', 'E', '#f97316', false, 0, 780)
ON CONFLICT (slug) DO UPDATE SET 
  color = EXCLUDED.color,
  is_featured = EXCLUDED.is_featured,
  follower_count = EXCLUDED.follower_count;

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

-- Insert demo users (password is 'demo1234' - bcrypt hashed)
INSERT INTO users (username, email, password_hash, display_name, bio, reputation, location, website) VALUES
('demo', 'demo@fokoro.com', '$2b$10$rQZ5v2iK8X5FkHqjPvVm0eH4V.TqR1rBxGvCmJlKfEhQvnJO5vGKi', 'Demo User', 'A demo user for testing the Fokoro platform.', 150, 'San Francisco, CA', 'https://fokoro.com'),
('techexpert', 'tech@fokoro.com', '$2b$10$rQZ5v2iK8X5FkHqjPvVm0eH4V.TqR1rBxGvCmJlKfEhQvnJO5vGKi', 'Alex Chen', 'Senior software engineer with 10+ years of experience. I love helping others learn to code.', 2500, 'Seattle, WA', 'https://github.com'),
('scienceguru', 'science@fokoro.com', '$2b$10$rQZ5v2iK8X5FkHqjPvVm0eH4V.TqR1rBxGvCmJlKfEhQvnJO5vGKi', 'Dr. Sarah Miller', 'PhD in Physics. Passionate about making complex scientific topics accessible to everyone.', 1850, 'Boston, MA', NULL),
('bizwiz', 'biz@fokoro.com', '$2b$10$rQZ5v2iK8X5FkHqjPvVm0eH4V.TqR1rBxGvCmJlKfEhQvnJO5vGKi', 'Marcus Johnson', 'Serial entrepreneur and startup advisor. Built and sold 3 companies.', 3200, 'Austin, TX', 'https://linkedin.com')
ON CONFLICT (username) DO UPDATE SET 
  reputation = EXCLUDED.reputation,
  bio = EXCLUDED.bio;

-- Insert sample questions
INSERT INTO questions (title, slug, content, author_id, view_count, answer_count, vote_count, is_answered) 
SELECT 
  'What is the best way to learn programming in 2024?',
  'what-is-the-best-way-to-learn-programming-in-2024-' || EXTRACT(EPOCH FROM NOW())::INT,
  'I am a complete beginner looking to start my programming journey. What resources, languages, and approaches would you recommend for someone starting from scratch? Should I focus on web development, mobile apps, or something else? I have about 2 hours per day to dedicate to learning.',
  u.id,
  1250,
  3,
  42,
  true
FROM users u WHERE u.username = 'demo'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO questions (title, slug, content, author_id, view_count, answer_count, vote_count, is_answered) 
SELECT 
  'How does artificial intelligence actually work?',
  'how-does-artificial-intelligence-actually-work-' || EXTRACT(EPOCH FROM NOW())::INT,
  'I keep hearing about AI and machine learning everywhere, but I do not really understand how it works under the hood. Can someone explain the basic concepts in simple terms? What makes ChatGPT and other AI systems so powerful?',
  u.id,
  2100,
  4,
  67,
  true
FROM users u WHERE u.username = 'techexpert'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO questions (title, slug, content, author_id, view_count, answer_count, vote_count, is_answered) 
SELECT 
  'What are the most effective study techniques backed by science?',
  'what-are-the-most-effective-study-techniques-backed-by-science-' || EXTRACT(EPOCH FROM NOW())::INT,
  'I am preparing for important exams and want to optimize my study time. What techniques have been proven to work by research? I have tried flashcards and rereading notes but feel like I could be more efficient.',
  u.id,
  890,
  2,
  35,
  false
FROM users u WHERE u.username = 'scienceguru'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO questions (title, slug, content, author_id, view_count, answer_count, vote_count, is_answered) 
SELECT 
  'How to start a successful side business while working full-time?',
  'how-to-start-a-successful-side-business-while-working-full-time-' || EXTRACT(EPOCH FROM NOW())::INT,
  'I want to start building something on the side but I am not sure how to manage time and energy. What strategies have worked for others? How do you balance a demanding job with entrepreneurial ambitions?',
  u.id,
  1500,
  5,
  52,
  true
FROM users u WHERE u.username = 'demo'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO questions (title, slug, content, author_id, view_count, answer_count, vote_count, is_answered) 
SELECT 
  'What is the science behind intermittent fasting?',
  'what-is-the-science-behind-intermittent-fasting-' || EXTRACT(EPOCH FROM NOW())::INT,
  'Intermittent fasting seems to be very popular right now. Is there actual scientific evidence supporting its benefits? What are the potential risks? I am considering trying it but want to understand the research first.',
  u.id,
  1800,
  3,
  48,
  true
FROM users u WHERE u.username = 'scienceguru'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO questions (title, slug, content, author_id, view_count, answer_count, vote_count, is_answered) 
SELECT 
  'Why is React still so popular in 2024?',
  'why-is-react-still-so-popular-in-2024-' || EXTRACT(EPOCH FROM NOW())::INT,
  'With so many new frameworks coming out like Svelte, Solid, and Vue 3, why does React continue to dominate the frontend space? What makes it special compared to alternatives? Should new developers still learn React first?',
  u.id,
  950,
  4,
  28,
  false
FROM users u WHERE u.username = 'techexpert'
ON CONFLICT (slug) DO NOTHING;

-- Link questions to topics
INSERT INTO question_topics (question_id, topic_id)
SELECT q.id, t.id FROM questions q, topics t 
WHERE q.slug LIKE 'what-is-the-best-way-to-learn-programming%' AND t.slug = 'programming'
ON CONFLICT DO NOTHING;

INSERT INTO question_topics (question_id, topic_id)
SELECT q.id, t.id FROM questions q, topics t 
WHERE q.slug LIKE 'how-does-artificial-intelligence%' AND t.slug = 'technology'
ON CONFLICT DO NOTHING;

INSERT INTO question_topics (question_id, topic_id)
SELECT q.id, t.id FROM questions q, topics t 
WHERE q.slug LIKE 'what-are-the-most-effective-study%' AND t.slug = 'education'
ON CONFLICT DO NOTHING;

INSERT INTO question_topics (question_id, topic_id)
SELECT q.id, t.id FROM questions q, topics t 
WHERE q.slug LIKE 'how-to-start-a-successful-side%' AND t.slug = 'business'
ON CONFLICT DO NOTHING;

INSERT INTO question_topics (question_id, topic_id)
SELECT q.id, t.id FROM questions q, topics t 
WHERE q.slug LIKE 'what-is-the-science-behind-intermittent%' AND t.slug = 'health'
ON CONFLICT DO NOTHING;

INSERT INTO question_topics (question_id, topic_id)
SELECT q.id, t.id FROM questions q, topics t 
WHERE q.slug LIKE 'why-is-react-still-so-popular%' AND t.slug = 'programming'
ON CONFLICT DO NOTHING;

-- Insert sample answers
INSERT INTO answers (content, question_id, author_id, vote_count, is_accepted)
SELECT 
  'The best approach for beginners in 2024 is to start with web development fundamentals. Here is my recommended path:

1. **Learn HTML and CSS first** - These are the building blocks of the web and will give you immediate visual feedback on your progress.

2. **Pick JavaScript as your first programming language** - It is versatile, runs everywhere (browsers, servers, mobile), and has a massive community.

3. **Use free resources wisely** - freeCodeCamp, The Odin Project, and MDN Web Docs are excellent starting points that many successful developers have used.

4. **Build projects from day one** - Do not just watch tutorials passively. Build something simple, even if it is just a to-do list or a personal website.

5. **Join communities** - Discord servers like Reactiflux, Reddit communities like r/learnprogramming, and local meetups can provide support and motivation.

The key is consistency over intensity. 30 minutes daily beats 5 hours once a week. Good luck on your journey!',
  q.id,
  u.id,
  25,
  true
FROM questions q, users u 
WHERE q.slug LIKE 'what-is-the-best-way-to-learn-programming%' AND u.username = 'techexpert'
ON CONFLICT DO NOTHING;

INSERT INTO answers (content, question_id, author_id, vote_count, is_accepted)
SELECT 
  'At its core, AI works by finding patterns in data. Here is a simple explanation:

**Traditional Programming vs Machine Learning:**
- Traditional: You write explicit rules, computer follows them exactly
- Machine Learning: You give examples, computer learns the rules itself

**How Neural Networks Work:**
Imagine millions of tiny interconnected decision-makers. Each one takes inputs, does simple math, and passes results to the next layer. Through training on examples, these connections strengthen or weaken until the network can recognize patterns.

**Why Modern AI is Powerful:**
1. **Transformers** - The architecture behind ChatGPT that excels at understanding context
2. **Scale** - Trained on essentially the entire internet
3. **Compute** - Massive GPU clusters enable training these huge models

The "intelligence" is really sophisticated pattern matching. AI does not truly understand like humans do - it predicts the most likely next word/response based on patterns in its training data.',
  q.id,
  u.id,
  45,
  true
FROM questions q, users u 
WHERE q.slug LIKE 'how-does-artificial-intelligence%' AND u.username = 'scienceguru'
ON CONFLICT DO NOTHING;

INSERT INTO answers (content, question_id, author_id, vote_count, is_accepted)
SELECT 
  'As someone who built a SaaS business while working at a FAANG company, here is what worked for me:

**Time Management:**
- Wake up 1-2 hours earlier and work on your side project first thing when your mind is fresh
- Use your commute time for planning, podcasts, or voice-note brainstorming
- Dedicate specific days (I used Saturday mornings) for focused deep work

**Energy Management:**
- Do not sacrifice sleep - it will hurt both your job and side business
- Exercise regularly - counterintuitive but it gives you MORE energy
- Set clear boundaries - do not check work email during side business time and vice versa

**Practical Tips:**
1. Start with a service business before building a product - faster to revenue
2. Automate everything possible from day one
3. Find a co-founder if possible to share the load
4. Set a timeline - give yourself 12-18 months to validate the idea

The most important thing: make sure your side project does not violate your employment contract!',
  q.id,
  u.id,
  38,
  true
FROM questions q, users u 
WHERE q.slug LIKE 'how-to-start-a-successful-side%' AND u.username = 'bizwiz'
ON CONFLICT DO NOTHING;

-- Update topic question counts
UPDATE topics SET question_count = (
  SELECT COUNT(*) FROM question_topics WHERE question_topics.topic_id = topics.id
);

-- Create topic authorities for users with answers
INSERT INTO topic_authorities (user_id, topic_id, authority_score, answer_count, accepted_answer_count)
SELECT 
  u.id,
  t.id,
  100,
  1,
  1
FROM users u
CROSS JOIN topics t
WHERE u.username = 'techexpert' AND t.slug = 'programming'
ON CONFLICT (user_id, topic_id) DO UPDATE SET authority_score = 100;

INSERT INTO topic_authorities (user_id, topic_id, authority_score, answer_count, accepted_answer_count)
SELECT 
  u.id,
  t.id,
  85,
  1,
  1
FROM users u
CROSS JOIN topics t
WHERE u.username = 'scienceguru' AND t.slug = 'technology'
ON CONFLICT (user_id, topic_id) DO UPDATE SET authority_score = 85;

INSERT INTO topic_authorities (user_id, topic_id, authority_score, answer_count, accepted_answer_count)
SELECT 
  u.id,
  t.id,
  95,
  1,
  1
FROM users u
CROSS JOIN topics t
WHERE u.username = 'bizwiz' AND t.slug = 'business'
ON CONFLICT (user_id, topic_id) DO UPDATE SET authority_score = 95;
