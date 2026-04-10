import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Không tìm thấy file.' }, { status: 400 });
    }

    // Upload lên Vercel Blob Storage - file sẽ public, không bị 401
    const blob = await put(file.name, file, {
      access: 'public',
    });

    // Trả về URL của file trên Vercel Blob
    return NextResponse.json({
      url: blob.url,
      filename: file.name,
      type: file.type,
      size: file.size,
    });
  } catch (error: any) {
    console.error('Lỗi upload Vercel Blob:', error);
    return NextResponse.json(
      { error: 'Upload thất bại: ' + (error.message || 'Unknown error') },
      { status: 500 }
    );
  }
}
