import { getCourseById, updateCourse, deleteCourse } from '@/lib/db';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const course = await getCourseById(resolvedParams.id);
    if (!course) {
      return Response.json({ success: false, error: 'Course not found' }, { status: 404 });
    }
    return Response.json({ success: true, data: course });
  } catch (error) {
    console.error('Error fetching course:', error);
    return Response.json({ success: false, error: 'Failed to fetch course' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const body = await req.json();
    const { categoryId, name, description, image_url } = body;

    if (!categoryId || !name) {
      return Response.json({ success: false, error: 'Tên khóa học và mục học tập là bắt buộc' }, { status: 400 });
    }

    const course = await updateCourse(resolvedParams.id, categoryId, name, description || '', image_url || null);
    if (!course) {
      return Response.json({ success: false, error: 'Course not found' }, { status: 404 });
    }
    
    return Response.json({ success: true, data: course });
  } catch (error) {
    console.error('Error updating course:', error);
    return Response.json({ success: false, error: 'Failed to update course' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    await deleteCourse(resolvedParams.id);
    return Response.json({ success: true });
  } catch (error) {
    console.error('Error deleting course:', error);
    return Response.json({ success: false, error: 'Failed to delete course' }, { status: 500 });
  }
}
