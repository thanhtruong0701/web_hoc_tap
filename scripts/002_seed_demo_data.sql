-- Insert demo categories
INSERT INTO categories (name, description, order_index) VALUES
('Lập Trình', 'Các khóa học về lập trình và phát triển phần mềm', 1),
('Ngôn Ngữ Tiếng Anh', 'Khóa học tiếng Anh từ cơ bản đến nâng cao', 2),
('Kỹ Năng Giao Tiếp', 'Phát triển kỹ năng giao tiếp chuyên nghiệp', 3)
ON CONFLICT (name) DO NOTHING;

-- Insert demo courses
INSERT INTO courses (category_id, name, description, order_index) VALUES
((SELECT id FROM categories WHERE name = 'Lập Trình'), 'Web Development Cơ Bản', 'Học tạo website với HTML, CSS, JavaScript', 1),
((SELECT id FROM categories WHERE name = 'Lập Trình'), 'React & Next.js', 'Phát triển ứng dụng web với React và Next.js', 2),
((SELECT id FROM categories WHERE name = 'Ngôn Ngữ Tiếng Anh'), 'IELTS Preparation', 'Chuẩn bị thi IELTS hiệu quả', 1),
((SELECT id FROM categories WHERE name = 'Kỹ Năng Giao Tiếp'), 'Kỹ Năng Thuyết Trình', 'Nâng cao kỹ năng thuyết trình trước công chúng', 1);

-- Insert demo lessons
INSERT INTO lessons (course_id, title, content, order_index) VALUES
((SELECT id FROM courses WHERE name = 'Web Development Cơ Bản' LIMIT 1), 
 'Giới Thiệu HTML', 
 '<h2>HTML là gì?</h2><p>HTML (HyperText Markup Language) là ngôn ngữ đánh dấu được sử dụng để tạo nội dung trang web...</p><h3>Cấu trúc cơ bản HTML:</h3><ul><li>&lt;!DOCTYPE html&gt;</li><li>&lt;html&gt;&lt;/html&gt;</li><li>&lt;head&gt;&lt;/head&gt;</li><li>&lt;body&gt;&lt;/body&gt;</li></ul>', 1),
 
((SELECT id FROM courses WHERE name = 'Web Development Cơ Bản' LIMIT 1), 
 'CSS Styling', 
 '<h2>CSS là gì?</h2><p>CSS (Cascading Style Sheets) được sử dụng để thiết kế giao diện cho các trang web...</p>', 2),

((SELECT id FROM courses WHERE name = 'React & Next.js' LIMIT 1), 
 'React Hooks', 
 '<h2>React Hooks</h2><p>Hooks cho phép bạn sử dụng state và các tính năng khác của React mà không cần viết một class component...</p>', 1),

((SELECT id FROM courses WHERE name = 'IELTS Preparation' LIMIT 1), 
 'IELTS Overview', 
 '<h2>Tổng Quan Về IELTS</h2><p>IELTS là bài kiểm tra tiếng Anh quốc tế được công nhận rộng rãi trên toàn thế giới...</p>', 1);

-- Insert demo files
INSERT INTO lesson_files (lesson_id, file_name, file_url, file_type, file_size) VALUES
((SELECT id FROM lessons WHERE title = 'Giới Thiệu HTML' LIMIT 1), 
 'HTML_Guide.pdf', 
 'https://example.com/files/html-guide.pdf', 
 'pdf', 2048576),

((SELECT id FROM lessons WHERE title = 'CSS Styling' LIMIT 1), 
 'CSS_Tutorial.pdf', 
 'https://example.com/files/css-tutorial.pdf', 
 'pdf', 3145728),

((SELECT id FROM lessons WHERE title = 'React Hooks' LIMIT 1), 
 'React_Hooks_Video.mp4', 
 'https://example.com/videos/react-hooks.mp4', 
 'video', 104857600);

-- Insert demo quiz
INSERT INTO quizzes (lesson_id, title, description) VALUES
((SELECT id FROM lessons WHERE title = 'Giới Thiệu HTML' LIMIT 1), 
 'HTML Basics Quiz', 
 'Kiểm tra kiến thức cơ bản về HTML');

-- Insert demo quiz questions and answers
INSERT INTO quiz_questions (quiz_id, question_text, question_order) VALUES
((SELECT id FROM quizzes WHERE title = 'HTML Basics Quiz' LIMIT 1), 
 'HTML là viết tắt của từ gì?', 1),

((SELECT id FROM quizzes WHERE title = 'HTML Basics Quiz' LIMIT 1), 
 'Thẻ nào được dùng để tạo heading lớn nhất?', 2);

INSERT INTO quiz_answers (question_id, answer_text, is_correct, answer_order) VALUES
((SELECT id FROM quiz_questions WHERE question_text = 'HTML là viết tắt của từ gì?' LIMIT 1), 
 'HyperText Markup Language', TRUE, 1),

((SELECT id FROM quiz_questions WHERE question_text = 'HTML là viết tắt của từ gì?' LIMIT 1), 
 'Hyper Tool Multi Language', FALSE, 2),

((SELECT id FROM quiz_questions WHERE question_text = 'Thẻ nào được dùng để tạo heading lớn nhất?' LIMIT 1), 
 '<h1>', TRUE, 1),

((SELECT id FROM quiz_questions WHERE question_text = 'Thẻ nào được dùng để tạo heading lớn nhất?' LIMIT 1), 
 '<h6>', FALSE, 2);

-- Insert demo views (simulate page views)
INSERT INTO lesson_views (lesson_id, ip_address, user_agent) VALUES
((SELECT id FROM lessons WHERE title = 'Giới Thiệu HTML' LIMIT 1), '192.168.1.1', 'Mozilla/5.0'),
((SELECT id FROM lessons WHERE title = 'Giới Thiệu HTML' LIMIT 1), '192.168.1.2', 'Mozilla/5.0'),
((SELECT id FROM lessons WHERE title = 'Giới Thiệu HTML' LIMIT 1), '192.168.1.3', 'Mozilla/5.0'),
((SELECT id FROM lessons WHERE title = 'CSS Styling' LIMIT 1), '192.168.1.1', 'Mozilla/5.0'),
((SELECT id FROM lessons WHERE title = 'CSS Styling' LIMIT 1), '192.168.1.4', 'Mozilla/5.0'),
((SELECT id FROM lessons WHERE title = 'React Hooks' LIMIT 1), '192.168.1.2', 'Mozilla/5.0'),
((SELECT id FROM lessons WHERE title = 'React Hooks' LIMIT 1), '192.168.1.5', 'Mozilla/5.0'),
((SELECT id FROM lessons WHERE title = 'React Hooks' LIMIT 1), '192.168.1.6', 'Mozilla/5.0');

-- Insert active sessions (simulate current users)
INSERT INTO active_sessions (ip_address, user_agent) VALUES
('192.168.1.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'),
('192.168.1.2', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'),
('192.168.1.4', 'Mozilla/5.0 (X11; Linux x86_64)'),
('192.168.1.7', 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X)')
ON CONFLICT (ip_address) DO NOTHING;
