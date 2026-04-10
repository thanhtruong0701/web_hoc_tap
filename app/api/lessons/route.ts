import { getLessonsByCourse, getFilesByLesson, getQuizzesByLesson, recordPageView, recordUserSession, getAllLessons, createLesson } from '@/lib/db';
import { cookies, headers } from 'next/headers';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const courseId = searchParams.get('courseId');
  const lessonId = searchParams.get('lessonId');

  if (!courseId && !lessonId) {
    const lessons = await getAllLessons();
    return Response.json({ success: true, data: lessons });
  }

  try {
    let response: { success: boolean; data: any } = { success: true, data: null };

    if (courseId) {
      response.data = await getLessonsByCourse(courseId);
    } else if (lessonId) {
      // Get lesson with files and quizzes
      const [headersList] = await Promise.all([headers()]);
      const ipAddress = headersList.get('x-forwarded-for') || 'unknown';
      
      // Generate session ID from cookies
      let sessionId = (await cookies()).get('sessionId')?.value;
      if (!sessionId) {
        sessionId = `session-${Date.now()}-${Math.random()}`;
        (await cookies()).set('sessionId', sessionId, { maxAge: 86400 * 30 });
      }

      // Record view and session
      await Promise.all([
        recordPageView(lessonId, ipAddress),
        recordUserSession(sessionId, ipAddress)
      ]);

      const [files, quizzes] = await Promise.all([
        getFilesByLesson(lessonId),
        getQuizzesByLesson(lessonId)
      ]);

      response.data = { files, quizzes };
    }

    return Response.json(response);
  } catch (error) {
    console.error('Error fetching lessons:', error);
    return Response.json({ success: false, error: 'Failed to fetch lessons' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { courseId, title, content, status = 'approved', authorEmail, files = [] } = body;

    if (!courseId || !title) {
      return Response.json({ success: false, error: 'Tên bài học và khóa học là bắt buộc' }, { status: 400 });
    }

    const lesson = await createLesson(courseId, title, content || '', status, authorEmail, files);
    return Response.json({ success: true, data: lesson });
  } catch (error) {
    console.error('Error creating lesson:', error);
    return Response.json({ success: false, error: 'Failed to create lesson' }, { status: 500 });
  }
}
