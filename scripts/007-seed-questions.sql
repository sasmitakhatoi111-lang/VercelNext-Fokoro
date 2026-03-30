-- Insert sample questions
INSERT INTO questions (title, slug, content, author_id, topic_id, view_count, answer_count, upvotes) 
SELECT 
  'What is the best way to learn programming in 2024?',
  'what-is-the-best-way-to-learn-programming-in-2024-' || EXTRACT(EPOCH FROM NOW())::BIGINT,
  'I am a complete beginner looking to start my programming journey. What resources, languages, and approaches would you recommend for someone starting from scratch? Should I focus on web development, mobile apps, or something else?',
  u.id,
  t.id,
  1250,
  2,
  42
FROM users u, topics t 
WHERE u.username = 'demo' AND t.slug = 'programming'
AND NOT EXISTS (SELECT 1 FROM questions WHERE title = 'What is the best way to learn programming in 2024?');

INSERT INTO questions (title, slug, content, author_id, topic_id, view_count, answer_count, upvotes) 
SELECT 
  'How does artificial intelligence actually work?',
  'how-does-artificial-intelligence-actually-work-' || EXTRACT(EPOCH FROM NOW())::BIGINT,
  'I keep hearing about AI and machine learning but I do not really understand how it works under the hood. Can someone explain the basic concepts in simple terms?',
  u.id,
  t.id,
  2100,
  1,
  67
FROM users u, topics t 
WHERE u.username = 'techexpert' AND t.slug = 'technology'
AND NOT EXISTS (SELECT 1 FROM questions WHERE title = 'How does artificial intelligence actually work?');

INSERT INTO questions (title, slug, content, author_id, topic_id, view_count, answer_count, upvotes) 
SELECT 
  'What are the most effective study techniques backed by science?',
  'effective-study-techniques-backed-by-science-' || EXTRACT(EPOCH FROM NOW())::BIGINT,
  'I am preparing for important exams and want to optimize my study time. What techniques have been proven to work by research?',
  u.id,
  t.id,
  890,
  1,
  35
FROM users u, topics t 
WHERE u.username = 'scienceguru' AND t.slug = 'education'
AND NOT EXISTS (SELECT 1 FROM questions WHERE title = 'What are the most effective study techniques backed by science?');

INSERT INTO questions (title, slug, content, author_id, topic_id, view_count, answer_count, upvotes) 
SELECT 
  'How to start a successful side business while working full-time?',
  'start-successful-side-business-working-full-time-' || EXTRACT(EPOCH FROM NOW())::BIGINT,
  'I want to start building something on the side but I am not sure how to manage time and energy. What strategies have worked for others?',
  u.id,
  t.id,
  1500,
  0,
  52
FROM users u, topics t 
WHERE u.username = 'demo' AND t.slug = 'business'
AND NOT EXISTS (SELECT 1 FROM questions WHERE title = 'How to start a successful side business while working full-time?');

INSERT INTO questions (title, slug, content, author_id, topic_id, view_count, answer_count, upvotes) 
SELECT 
  'What is the science behind intermittent fasting?',
  'science-behind-intermittent-fasting-' || EXTRACT(EPOCH FROM NOW())::BIGINT,
  'Intermittent fasting seems to be very popular. Is there actual scientific evidence supporting its benefits? What are the potential risks?',
  u.id,
  t.id,
  1800,
  0,
  48
FROM users u, topics t 
WHERE u.username = 'scienceguru' AND t.slug = 'health'
AND NOT EXISTS (SELECT 1 FROM questions WHERE title = 'What is the science behind intermittent fasting?');

INSERT INTO questions (title, slug, content, author_id, topic_id, view_count, answer_count, upvotes) 
SELECT 
  'Why is React still so popular in 2024?',
  'why-is-react-still-so-popular-2024-' || EXTRACT(EPOCH FROM NOW())::BIGINT,
  'With so many new frameworks coming out, why does React continue to dominate? What makes it special compared to alternatives like Vue or Svelte?',
  u.id,
  t.id,
  950,
  0,
  28
FROM users u, topics t 
WHERE u.username = 'techexpert' AND t.slug = 'programming'
AND NOT EXISTS (SELECT 1 FROM questions WHERE title = 'Why is React still so popular in 2024?');

-- Update topic question counts
UPDATE topics SET question_count = (
  SELECT COUNT(*) FROM questions WHERE questions.topic_id = topics.id
);
