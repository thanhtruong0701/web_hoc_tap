// lib/db.ts
import * as mockDb from './db.mock';
import * as realDb from './db.real';

// Tự động nhận diện môi trường: Nếu có chuỗi DATABASE_URL (trên Vercel/Neon) thì dùng SQL thật.
// Ngược lại, nếu ở máy cá nhân (localhost) thì dùng file JSON giả lập.
const isProduction = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.VERCEL;

export const {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getCoursesByCategory,
  getCourseById,
  getAllCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  getLessonsByCourse,
  getLessonById,
  getAllLessons,
  createLesson,
  updateLesson,
  deleteLesson,
  getFilesByLesson,
  getQuizzesByLesson,
  recordPageView,
  recordUserSession,
  getTotalLessons,
  getTotalCategories,
  getTotalViews,
  getActiveUsersCount,
  getTopLessons
} = isProduction ? (realDb as any) : (mockDb as any);
