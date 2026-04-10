import { updateCategory, deleteCategory, getCategoryById } from '@/lib/db';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const category = await getCategoryById(resolvedParams.id);
    if (!category) {
      return Response.json({ success: false, error: 'Category not found' }, { status: 404 });
    }
    return Response.json({ success: true, data: category });
  } catch (error) {
    console.error('Error fetching category:', error);
    return Response.json({ success: false, error: 'Failed to fetch category' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const body = await req.json();
    const { name, description } = body;

    if (!name) {
      return Response.json({ success: false, error: 'Name is required' }, { status: 400 });
    }

    const category = await updateCategory(resolvedParams.id, name, description || '');
    
    if (!category) {
      return Response.json({ success: false, error: 'Category not found' }, { status: 404 });
    }

    return Response.json({ success: true, data: category });
  } catch (error) {
    console.error('Error updating category:', error);
    return Response.json({ success: false, error: 'Failed to update category' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    await deleteCategory(resolvedParams.id);
    return Response.json({ success: true });
  } catch (error) {
    console.error('Error deleting category:', error);
    return Response.json({ success: false, error: 'Failed to delete category' }, { status: 500 });
  }
}
