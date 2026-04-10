import { getLessonById, updateLesson, deleteLesson } from '@/lib/db';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const lesson = await getLessonById(resolvedParams.id);
    if (!lesson) {
      return Response.json({ success: false, error: 'Lesson not found' }, { status: 404 });
    }
    return Response.json({ success: true, data: lesson });
  } catch (error) {
    console.error('Error fetching lesson:', error);
    return Response.json({ success: false, error: 'Failed to fetch lesson' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const body = await req.json();
    const { courseId, title, content, files, quizzes } = body;

    if (!courseId || !title) {
      return Response.json({ success: false, error: 'Khóa học và tên bài học là bắt buộc' }, { status: 400 });
    }

    const lesson = await updateLesson(resolvedParams.id, courseId, title, content || '', undefined, files, quizzes);
    if (!lesson) {
      return Response.json({ success: false, error: 'Lesson not found' }, { status: 404 });
    }
    
    return Response.json({ success: true, data: lesson });
  } catch (error) {
    console.error('Error updating lesson:', error);
    return Response.json({ success: false, error: 'Failed to update lesson' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    await deleteLesson(resolvedParams.id);
    return Response.json({ success: true });
  } catch (error) {
    console.error('Error deleting lesson:', error);
    return Response.json({ success: false, error: 'Failed to delete lesson' }, { status: 500 });
  }
}
