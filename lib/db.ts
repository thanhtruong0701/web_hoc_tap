// lib/db.ts
// Detect environment: Use real Postgres on Vercel, use mock JSON file on local.
// IMPORTANT: We use DYNAMIC imports to prevent db.mock.ts (which uses Node.js `fs`)
// from being loaded/executed on Vercel serverless environments, which would cause a crash.
const isProduction = !!(process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.VERCEL);

async function getDb() {
  if (isProduction) {
    return await import('./db.real');
  } else {
    return await import('./db.mock');
  }
}

export async function getCategories() { return (await getDb()).getCategories(); }
export async function getCategoryById(id: string) { return (await getDb()).getCategoryById(id); }
export async function createCategory(name: string, description: string, imageUrl?: string | null) { return (await getDb()).createCategory(name, description, imageUrl); }
export async function updateCategory(id: string, name: string, description: string) { return (await getDb()).updateCategory(id, name, description); }
export async function deleteCategory(id: string) { return (await getDb()).deleteCategory(id); }

export async function getCoursesByCategory(categoryId: string) { return (await getDb()).getCoursesByCategory(categoryId); }
export async function getCourseById(courseId: string) { return (await getDb()).getCourseById(courseId); }
export async function getAllCourses() { return (await getDb()).getAllCourses(); }
export async function createCourse(categoryId: string, name: string, description: string) { return (await getDb()).createCourse(categoryId, name, description); }
export async function updateCourse(id: string, categoryId: string, name: string, description: string) { return (await getDb()).updateCourse(id, categoryId, name, description); }
export async function deleteCourse(id: string) { return (await getDb()).deleteCourse(id); }

export async function getLessonsByCourse(courseId: string, includePending?: boolean) { return (await getDb()).getLessonsByCourse(courseId, includePending); }
export async function getLessonById(lessonId: string) { return (await getDb()).getLessonById(lessonId); }
export async function getAllLessons() { return (await getDb()).getAllLessons(); }
export async function createLesson(courseId: string, title: string, content: string, status?: string, authorEmail?: string, files?: any[]) { return (await getDb()).createLesson(courseId, title, content, status, authorEmail, files); }
export async function updateLesson(id: string, courseId: string, title: string, content: string, status?: string) { return (await getDb()).updateLesson(id, courseId, title, content, status); }
export async function deleteLesson(id: string) { return (await getDb()).deleteLesson(id); }

export async function getFilesByLesson(lessonId: string) { return (await getDb()).getFilesByLesson(lessonId); }
export async function getQuizzesByLesson(lessonId: string) { return (await getDb()).getQuizzesByLesson(lessonId); }

export async function recordPageView(lessonId: string, ipAddress: string) { return (await getDb()).recordPageView(lessonId, ipAddress); }
export async function recordUserSession(sessionId: string, ipAddress: string) { return (await getDb()).recordUserSession(sessionId, ipAddress); }

export async function getTotalLessons() { return (await getDb()).getTotalLessons(); }
export async function getTotalCategories() { return (await getDb()).getTotalCategories(); }
export async function getTotalViews() { return (await getDb()).getTotalViews(); }
export async function getActiveUsersCount() { return (await getDb()).getActiveUsersCount(); }
export async function getTopLessons(limit?: number) { return (await getDb()).getTopLessons(limit); }
