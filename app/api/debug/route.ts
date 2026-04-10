import { getSql } from '@/lib/db.real';

export async function GET() {
  const envStatus = {
    DATABASE_URL: !!process.env.DATABASE_URL,
    POSTGRES_URL: !!process.env.POSTGRES_URL,
    GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'not set',
    VERCEL: !!process.env.VERCEL,
    NODE_ENV: process.env.NODE_ENV,
  };

  try {
    const sql = getSql();
    // Test a very simple query
    const result = await sql`SELECT 1 as connection_test`;
    
    return Response.json({
      success: true,
      message: 'Hệ thống đang hoạt động bình thường!',
      env: envStatus,
      db_test: result[0],
    });
  } catch (error: any) {
    return Response.json({
      success: false,
      message: 'Có lỗi xảy ra khi kết nối Database!',
      env: envStatus,
      error: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}
