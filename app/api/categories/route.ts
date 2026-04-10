import { getCategories, createCategory } from '@/lib/db';

export async function GET() {
  try {
    const categories = await getCategories();
    return Response.json({ success: true, data: categories });
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    return Response.json({ 
      success: false, 
      error: 'Failed to fetch categories', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
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
  } catch (error: any) {
    console.error('Error creating category:', error);
    return Response.json({ 
      success: false, 
      error: 'Failed to create category', 
      details: error.message,
      env_check: {
        has_db_url: !!(process.env.DATABASE_URL || process.env.POSTGRES_URL),
        node_env: process.env.NODE_ENV
      }
    }, { status: 500 });
  }
}
