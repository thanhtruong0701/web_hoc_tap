import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'local_mock_db.json');

// Khởi tạo Database giả lập
if (!fs.existsSync(DB_PATH)) {
  const initialData = {
    categories: [
      { id: 'cat-1', name: 'Giáo án điện tử THCS', description: 'Giáo án mẫu dành cho giáo viên', order_index: 1 },
      { id: 'cat-2', name: 'Toán học Cơ bản', description: 'Kiến thức cốt lõi môn Toán', order_index: 2 }
    ],
    courses: [],
    lessons: [],
    lesson_files: [],
    quizzes: [],
    lesson_views: [],
    active_sessions: []
  };
  fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2));
}

function readDB() {
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
}

function writeDB(data: any) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

export async function getCategories() {
  const db = readDB();
  return db.categories.sort((a: any, b: any) => a.order_index - b.order_index);
}

export async function getCategoryById(id: string) {
  const db = readDB();
  return db.categories.find((c: any) => c.id === id) || null;
}

export async function createCategory(name: string, description: string) {
  const db = readDB();
  const maxOrder = db.categories.reduce((max: number, c: any) => Math.max(max, c.order_index), 0);
  const newCat = {
    id: generateId(),
    name,
    description,
    order_index: maxOrder + 1
  };
  db.categories.push(newCat);
  writeDB(db);
  return newCat;
}

export async function updateCategory(id: string, name: string, description: string) {
  const db = readDB();
  const idx = db.categories.findIndex((c: any) => c.id === id);
  if (idx === -1) return null;
  db.categories[idx].name = name;
  db.categories[idx].description = description;
  writeDB(db);
  return db.categories[idx];
}

export async function deleteCategory(id: string) {
  const db = readDB();
  db.categories = db.categories.filter((c: any) => c.id !== id);
  writeDB(db);
  return { success: true };
}

export async function getCoursesByCategory(categoryId: string) {
  const db = readDB();
  return db.courses.filter((c: any) => c.category_id === categoryId);
}

export async function getCourseById(courseId: string) {
  const db = readDB();
  return db.courses.find((c: any) => c.id === courseId) || null;
}

export async function getAllCourses() {
  const db = readDB();
  const courses = db.courses.sort((a: any, b: any) => a.order_index - b.order_index);
  return courses.map((c: any) => ({
    ...c,
    category_name: db.categories.find((cat: any) => cat.id === c.category_id)?.name || 'Danh mục tải bị lỗi'
  }));
}

export async function createCourse(categoryId: string, name: string, description: string) {
  const db = readDB();
  const maxOrder = db.courses.reduce((max: number, c: any) => Math.max(max, c.order_index || 0), 0);
  const newCourse = {
    id: generateId(),
    category_id: categoryId,
    name,
    description,
    order_index: maxOrder + 1
  };
  db.courses.push(newCourse);
  writeDB(db);
  return newCourse;
}

export async function updateCourse(id: string, categoryId: string, name: string, description: string) {
  const db = readDB();
  const idx = db.courses.findIndex((c: any) => c.id === id);
  if (idx === -1) return null;
  db.courses[idx].category_id = categoryId;
  db.courses[idx].name = name;
  db.courses[idx].description = description;
  writeDB(db);
  return db.courses[idx];
}

export async function deleteCourse(id: string) {
  const db = readDB();
  db.courses = db.courses.filter((c: any) => c.id !== id);
  db.lessons = db.lessons.filter((l: any) => l.course_id !== id);
  writeDB(db);
  return { success: true };
}

export async function getLessonsByCourse(courseId: string, includePending = false) {
  const db = readDB();
  let lessons = db.lessons.filter((l: any) => l.course_id === courseId);
  if (!includePending) {
    lessons = lessons.filter((l: any) => l.status === 'approved' || !l.status);
  }
  return lessons.sort((a: any, b: any) => a.order_index - b.order_index);
}

export async function getLessonById(lessonId: string) {
  const db = readDB();
  const lesson = db.lessons.find((l: any) => l.id === lessonId);
  if (!lesson) return null;
  const course = db.courses.find((c: any) => c.id === lesson.course_id);
  const quizzes = db.quizzes?.filter((q: any) => q.lesson_id === lessonId) || [];
  const files = db.lesson_files?.filter((f: any) => f.lesson_id === lessonId) || [];

  return {
    ...lesson,
    course_name: course ? course.name : 'Unknown',
    quizzes: quizzes.map((q: any) => ({
      ...q,
      questions: db.quiz_questions?.filter((qq: any) => qq.quiz_id === q.id) || []
    })),
    files
  };
}

export async function getAllLessons() {
  const db = readDB();
  const lessons = db.lessons.sort((a: any, b: any) => a.order_index - b.order_index);
  return lessons.map((l: any) => ({
    ...l,
    course_name: db.courses.find((c: any) => c.id === l.course_id)?.name || 'Khóa học bị lỗi'
  }));
}

export async function createLesson(courseId: string, title: string, content: string, status = 'approved', authorEmail?: string, files: any[] = []) {
  const db = readDB();
  const maxOrder = db.lessons.reduce((max: number, l: any) => Math.max(max, l.order_index || 0), 0);
  const newLesson = {
    id: generateId(),
    course_id: courseId,
    title,
    content,
    status,
    author_email: authorEmail || null,
    order_index: maxOrder + 1
  };
  db.lessons.push(newLesson);
  
  if (files && files.length > 0) {
    db.lesson_files = db.lesson_files || [];
    files.forEach((f: any) => {
      db.lesson_files.push({
        id: generateId(),
        lesson_id: newLesson.id,
        file_name: f.file_name,
        file_url: f.file_url,
        file_type: f.file_type
      });
    });
  }

  writeDB(db);
  return newLesson;
}

export async function updateLesson(id: string, courseId: string, title: string, content: string, status?: string) {
  const db = readDB();
  const idx = db.lessons.findIndex((l: any) => l.id === id);
  if (idx === -1) return null;
  db.lessons[idx].course_id = courseId;
  db.lessons[idx].title = title;
  db.lessons[idx].content = content;
  if (status) db.lessons[idx].status = status;
  writeDB(db);
  return db.lessons[idx];
}

export async function deleteLesson(id: string) {
  const db = readDB();
  db.lessons = db.lessons.filter((l: any) => l.id !== id);
  writeDB(db);
  return { success: true };
}

export async function getFilesByLesson(lessonId: string) {
  const db = readDB();
  return db.lesson_files.filter((f: any) => f.lesson_id === lessonId);
}

export async function getQuizzesByLesson(lessonId: string) {
  const db = readDB();
  return db.quizzes?.filter((q: any) => q.lesson_id === lessonId) || [];
}

export async function recordPageView(lessonId: string, ipAddress: string) {
  const db = readDB();
  const view = db.lesson_views.find((v: any) => v.lesson_id === lessonId && v.ip_address === ipAddress);
  if (view) {
    view.viewed_at = new Date().toISOString();
  } else {
    db.lesson_views.push({ lesson_id: lessonId, ip_address: ipAddress, user_agent: 'web', viewed_at: new Date().toISOString() });
  }
  writeDB(db);
}

export async function recordUserSession(sessionId: string, ipAddress: string) {
  const db = readDB();
  const session = db.active_sessions.find((s: any) => s.id === sessionId);
  if (session) {
    session.last_activity = new Date().toISOString();
  } else {
    db.active_sessions.push({ id: sessionId, ip_address: ipAddress, user_agent: 'web', last_activity: new Date().toISOString(), created_at: new Date().toISOString() });
  }
  writeDB(db);
}

export async function getTotalLessons() {
  return readDB().lessons.length;
}

export async function getTotalCategories() {
  return readDB().categories.length;
}

export async function getTotalViews() {
  return readDB().lesson_views.length;
}

export async function getActiveUsersCount() {
  const db = readDB();
  const fiveMinsAgo = Date.now() - 5 * 60 * 1000;
  const ips = new Set<string>();
  for (const s of db.active_sessions) {
    if (new Date(s.last_activity).getTime() > fiveMinsAgo) {
      ips.add(s.ip_address);
    }
  }
  return ips.size;
}

export async function getTopLessons(limit = 10) {
  const db = readDB();
  const viewCounts: Record<string, number> = {};
  db.lesson_views.forEach((v: any) => {
    viewCounts[v.lesson_id] = (viewCounts[v.lesson_id] || 0) + 1;
  });

  const res = db.lessons.map((l: any) => ({
    id: l.id,
    title: l.title,
    course_id: l.course_id,
    course_title: db.courses.find((c: any) => c.id === l.course_id)?.name || 'Unknown',
    total_views: viewCounts[l.id] || 0
  })).sort((a: any, b: any) => b.total_views - a.total_views).slice(0, limit);
  return res;
}
