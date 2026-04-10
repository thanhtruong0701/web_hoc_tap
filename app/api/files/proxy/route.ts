import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const fileUrl = searchParams.get('url');
  const fileName = searchParams.get('name') || 'file';
  const isDownload = searchParams.get('download') === '1';

  if (!fileUrl) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
  }

  try {
    // Fetch file từ Cloudinary phía server
    const response = await fetch(fileUrl);

    if (!response.ok) {
      console.error(`Proxy fetch failed: ${response.status} ${response.statusText} for URL: ${fileUrl}`);
      return NextResponse.json(
        { error: `Không thể tải file. Status: ${response.status}` },
        { status: response.status }
      );
    }

    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const fileBuffer = await response.arrayBuffer();

    // Xác định content-disposition: inline (xem) hoặc attachment (tải về)
    const disposition = isDownload
      ? `attachment; filename="${encodeURIComponent(fileName)}"`
      : `inline; filename="${encodeURIComponent(fileName)}"`;

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': disposition,
        'Content-Length': fileBuffer.byteLength.toString(),
        'Cache-Control': 'public, max-age=86400', // Cache 1 ngày
      },
    });
  } catch (error) {
    console.error('File proxy error:', error);
    return NextResponse.json({ error: 'Lỗi khi tải file' }, { status: 500 });
  }
}
