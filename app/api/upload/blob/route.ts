import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Không tìm thấy file.' }, { status: 400 });
    }

    // Thử upload lên Vercel Blob trước
    try {
      const { put } = await import('@vercel/blob');
      const blob = await put(file.name, file, { access: 'public' });
      console.log('✅ Upload Vercel Blob thành công:', blob.url);
      return NextResponse.json({
        url: blob.url,
        filename: file.name,
        type: file.type,
      });
    } catch (blobError: any) {
      console.warn('⚠️ Vercel Blob không khả dụng, dùng Cloudinary fallback:', blobError.message);
    }

    // Fallback: Upload lên Cloudinary qua server-side (signed upload)
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64File = `data:${file.type};base64,${buffer.toString('base64')}`;

    const cloudinaryFormData = new FormData();
    cloudinaryFormData.append('file', base64File);
    cloudinaryFormData.append('upload_preset', 'learnhub_uploads');
    // Ép resource_type=auto để Cloudinary xử lý đúng
    
    const cloudRes = await fetch(
      `https://api.cloudinary.com/v1_1/dndqwxqlr/auto/upload`,
      {
        method: 'POST',
        body: cloudinaryFormData,
      }
    );

    const cloudData = await cloudRes.json();
    
    if (!cloudRes.ok) {
      console.error('❌ Cloudinary upload failed:', cloudData);
      throw new Error(cloudData.error?.message || 'Cloudinary upload failed');
    }

    console.log('✅ Upload Cloudinary thành công:', cloudData.secure_url);
    return NextResponse.json({
      url: cloudData.secure_url,
      filename: file.name,
      type: file.type,
    });
  } catch (error: any) {
    console.error('❌ Upload thất bại:', error);
    return NextResponse.json(
      { error: 'Upload thất bại: ' + (error.message || 'Unknown error') },
      { status: 500 }
    );
  }
}
