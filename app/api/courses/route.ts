import { getCoursesByCategory, getAllCourses, createCourse } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get('categoryId');

  try {
    if (!categoryId) {
      const courses = await getAllCourses();
      return Response.json({ success: true, data: courses });
    } else {
      const courses = await getCoursesByCategory(categoryId);
      return Response.json({ success: true, data: courses });
    }
  } catch (error) {
    console.error('Error fetching courses:', error);
    return Response.json({ success: false, error: 'Failed to fetch courses' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { categoryId, name, description } = body;

    if (!categoryId || !name) {
      return Response.json({ success: false, error: 'Tên khóa học và mục học tập là bắt buộc' }, { status: 400 });
    }

    const course = await createCourse(categoryId, name, description || '');
    return Response.json({ success: true, data: course });
  } catch (error) {
    console.error('Error creating course:', error);
    return Response.json({ success: false, error: 'Failed to create course' }, { status: 500 });
  }
}
