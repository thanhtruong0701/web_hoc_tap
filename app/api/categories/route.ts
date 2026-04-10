import { getCategories, createCategory } from '@/lib/db';

export async function GET() {
  try {
    const categories = await getCategories();
    return Response.json({ success: true, data: categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return Response.json({ success: false, error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, description } = body;

    if (!name) {
      return Response.json({ success: false, error: 'Name is required' }, { status: 400 });
    }

    const category = await createCategory(name, description || '');
    return Response.json({ success: true, data: category });
  } catch (error) {
    console.error('Error creating category:', error);
    return Response.json({ success: false, error: 'Failed to create category' }, { status: 500 });
  }
}
