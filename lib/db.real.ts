import { neon } from '@neondatabase/serverless';

const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!dbUrl) {
  throw new Error('DATABASE_URL or POSTGRES_URL is not set');
}

const sql = neon(dbUrl);

export async function getCategories() {
  const result = await sql`
    SELECT * FROM categories ORDER BY order_index ASC
  `;
  return result;
}

export async function getCategoryById(id: string) {
  const result = await sql`
    SELECT * FROM categories WHERE id = ${id}
  `;
  return result[0] || null;
}

export async function createCategory(name: string, description: string) {
  const result = await sql`
    INSERT INTO categories (name, description, order_index)
    VALUES (${name}, ${description}, (SELECT COALESCE(MAX(order_index), 0) + 1 FROM categories))
    RETURNING *
  `;
  return result[0];
}

export async function updateCategory(id: string, name: string, description: string) {
  const result = await sql`
    UPDATE categories 
    SET name = ${name}, description = ${description}
    WHERE id = ${id}
    RETURNING *
  `;
  return result[0] || null;
}

export async function deleteCategory(id: string) {
  await sql`DELETE FROM categories WHERE id = ${id}`;
  return { success: true };
}

export async function getCoursesByCategory(categoryId: string) {
  const result = await sql`
    SELECT * FROM courses WHERE category_id = ${categoryId} ORDER BY created_at DESC
  `;
  return result;
}

export async function getCourseById(courseId: string) {
  const result = await sql`
    SELECT * FROM courses WHERE id = ${courseId}
  `;
  return result[0] || null;
}

export async function getAllCourses() {
  const result = await sql`
    SELECT c.*, cat.name as category_name 
    FROM courses c 
    LEFT JOIN categories cat ON c.category_id = cat.id 
    ORDER BY c.order_index ASC
  `;
  return result;
}

export async function createCourse(categoryId: string, name: string, description: string) {
  const result = await sql`
    INSERT INTO courses (category_id, name, description, order_index)
    VALUES (${categoryId}, ${name}, ${description}, (SELECT COALESCE(MAX(order_index), 0) + 1 FROM courses))
    RETURNING *
  `;
  return result[0];
}

export async function updateCourse(id: string, categoryId: string, name: string, description: string) {
  const result = await sql`
    UPDATE courses 
    SET category_id = ${categoryId}, name = ${name}, description = ${description}
    WHERE id = ${id}
    RETURNING *
  `;
  return result[0] || null;
}

export async function deleteCourse(id: string) {
  await sql`DELETE FROM courses WHERE id = ${id}`;
  return { success: true };
}

export async function getLessonsByCourse(courseId: string, includePending = false) {
  if (includePending) {
    const result = await sql`SELECT * FROM lessons WHERE course_id = ${courseId} ORDER BY order_index ASC`;
    return result;
  } else {
    const result = await sql`SELECT * FROM lessons WHERE course_id = ${courseId} AND (status = 'approved' OR status IS NULL) ORDER BY order_index ASC`;
    return result;
  }
}

export async function getLessonById(lessonId: string) {
  const result = await sql`
    SELECT l.*, c.name as course_name 
    FROM lessons l
    LEFT JOIN courses c ON l.course_id = c.id
    WHERE l.id = ${lessonId}
  `;
  
  if (result.length === 0) return null;
  
  const lesson = result[0];
  const files = await sql`SELECT * FROM lesson_files WHERE lesson_id = ${lessonId}`;
  
  return {
    ...lesson,
    quizzes: [], // Implement quizzes fetch later if needed
    files: files || []
  };
}

export async function getAllLessons() {
  const result = await sql`
    SELECT l.*, c.name as course_name 
    FROM lessons l 
    LEFT JOIN courses c ON l.course_id = c.id 
    ORDER BY l.order_index ASC
  `;
  return result;
}

export async function createLesson(courseId: string, title: string, content: string, status = 'approved', authorEmail?: string, files: any[] = []) {
  const result = await sql`
    INSERT INTO lessons (course_id, title, content, status, author_email, order_index)
    VALUES (${courseId}, ${title}, ${content}, ${status}, ${authorEmail || null}, (SELECT COALESCE(MAX(order_index), 0) + 1 FROM lessons))
    RETURNING *
  `;
  const lesson = result[0];
  if (files && files.length > 0) {
    for (const f of files) {
      await sql`INSERT INTO lesson_files (lesson_id, file_name, file_url, file_type) VALUES (${lesson.id}, ${f.file_name}, ${f.file_url}, ${f.file_type})`;
    }
  }
  return lesson;
}

export async function updateLesson(id: string, courseId: string, title: string, content: string, status?: string) {
  let result;
  if (status) {
    result = await sql`
      UPDATE lessons 
      SET course_id = ${courseId}, title = ${title}, content = ${content}, status = ${status}
      WHERE id = ${id}
      RETURNING *
    `;
  } else {
    result = await sql`
      UPDATE lessons 
      SET course_id = ${courseId}, title = ${title}, content = ${content}
      WHERE id = ${id}
      RETURNING *
    `;
  }
  return result[0] || null;
}

export async function deleteLesson(id: string) {
  await sql`DELETE FROM lessons WHERE id = ${id}`;
  return { success: true };
}

export async function getFilesByLesson(lessonId: string) {
  const result = await sql`
    SELECT * FROM lesson_files WHERE lesson_id = ${lessonId} ORDER BY created_at ASC
  `;
  return result;
}

export async function getQuizzesByLesson(lessonId: string) {
  const result = await sql`
    SELECT * FROM quizzes WHERE lesson_id = ${lessonId} ORDER BY created_at ASC
  `;
  return result;
}

export async function recordPageView(lessonId: string, ipAddress: string) {
  const result = await sql`
    SELECT * FROM lesson_views WHERE lesson_id = ${lessonId} AND ip_address = ${ipAddress}
  `;

  if (result.length > 0) {
    await sql`
      UPDATE lesson_views 
      SET viewed_at = NOW()
      WHERE lesson_id = ${lessonId} AND ip_address = ${ipAddress}
    `;
  } else {
    await sql`
      INSERT INTO lesson_views (lesson_id, ip_address, user_agent, viewed_at)
      VALUES (${lessonId}, ${ipAddress}, 'web', NOW())
    `;
  }
}

export async function recordUserSession(sessionId: string, ipAddress: string) {
  const result = await sql`
    SELECT * FROM active_sessions WHERE id = ${parseInt(sessionId)}
  `;

  if (result.length > 0) {
    await sql`
      UPDATE active_sessions 
      SET last_activity = NOW()
      WHERE id = ${parseInt(sessionId)}
    `;
  } else {
    await sql`
      INSERT INTO active_sessions (ip_address, user_agent, last_activity, created_at)
      VALUES (${ipAddress}, 'web', NOW(), NOW())
    `;
  }
}

export async function getTotalLessons() {
  const result = await sql`SELECT COUNT(*) as total FROM lessons`;
  return Number(result[0]?.total || 0);
}

export async function getTotalCategories() {
  const result = await sql`SELECT COUNT(*) as total FROM categories`;
  return Number(result[0]?.total || 0);
}

export async function getTotalViews() {
  const result = await sql`SELECT COUNT(*) as total FROM lesson_views`;
  return Number(result[0]?.total || 0);
}

export async function getActiveUsersCount() {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  const result = await sql`
    SELECT COUNT(DISTINCT ip_address) as total 
    FROM active_sessions 
    WHERE last_activity > ${fiveMinutesAgo.toISOString()}
  `;
  return Number(result[0]?.total || 0);
}

export async function getTopLessons(limit = 10) {
  const result = await sql`
    SELECT 
      l.id, 
      l.title, 
      l.course_id,
      c.name as course_title,
      COUNT(lv.id) as total_views
    FROM lessons l
    LEFT JOIN courses c ON l.course_id = c.id
    LEFT JOIN lesson_views lv ON l.id = lv.lesson_id
    GROUP BY l.id, l.title, l.course_id, c.name
    ORDER BY total_views DESC
    LIMIT ${limit}
  `;
  return result;
}
