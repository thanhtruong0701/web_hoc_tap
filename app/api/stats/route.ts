import { getTotalLessons, getTotalCategories, getTotalViews, getActiveUsersCount, getTopLessons } from '@/lib/db';

export async function GET() {
  try {
    const [totalLessons, totalCategories, totalViews, activeUsers, topLessons] = await Promise.all([
      getTotalLessons(),
      getTotalCategories(),
      getTotalViews(),
      getActiveUsersCount(),
      getTopLessons(5)
    ]);

    return Response.json({
      success: true,
      data: {
        totalLessons,
        totalCategories,
        totalViews,
        activeUsers,
        topLessons
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return Response.json({ success: false, error: 'Failed to fetch stats' }, { status: 500 });
  }
}
