'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Upload, Loader2, Image as ImageIcon } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';

const CLOUDINARY_CLOUD_NAME = 'dndqwxqlr';
const CLOUDINARY_UPLOAD_PRESET = 'learnhub_uploads';

export default function CreateCategory() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Lỗi upload');

      setImageUrl(data.secure_url);
    } catch (err: any) {
      setError('Lỗi khi tải ảnh lên: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);

    try {
      if (!title.trim()) {
        setError('Vui lòng nhập tên mục');
        setLoading(false); return;
      }

      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: title, description, image_url: imageUrl }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi từ máy chủ');

      setSuccess('Mục học tập đã được thêm thành công!');
      setTimeout(() => { router.push('/admin/dashboard'); }, 2000);
    } catch (err: any) {
      setError(err.message || 'Lỗi khi thêm mục học tập');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/admin/dashboard" className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
            <ArrowLeft className="w-4 h-4" /> Quay lại Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Thêm mục học tập mới</h1>

          {error && (<Alert variant="destructive" className="mb-6"><AlertDescription>{error}</AlertDescription></Alert>)}
          {success && (<Alert className="mb-6 bg-green-50 border-green-200"><AlertDescription className="text-green-800">{success}</AlertDescription></Alert>)}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tên mục học tập</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ví dụ: Toán học cơ bản" disabled={loading} className="w-full" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Mô tả chi tiết về mục học tập" disabled={loading} className="w-full" rows={3} />
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-blue-500" /> Ảnh bìa (Hình ảnh)
              </label>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                   <label className="text-xs text-gray-500 mb-1 block">Tải ảnh lên từ máy</label>
                   <div className="relative">
                     <Input 
                       type="file" 
                       accept="image/*"
                       className="hidden" 
                       id="category-image-upload"
                       onChange={handleImageUpload}
                       disabled={isUploading || loading}
                     />
                     <label 
                       htmlFor="category-image-upload"
                       className={`flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed rounded-lg cursor-pointer transition-colors h-10 ${
                         isUploading ? 'bg-gray-100 border-gray-300' : 'bg-white border-blue-200 hover:border-blue-400 hover:bg-blue-50'
                       }`}
                     >
                       {isUploading ? (
                         <>
                           <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                           <span className="text-sm font-medium text-blue-600">Đang tải...</span>
                         </>
                       ) : (
                         <>
                           <Upload className="w-4 h-4 text-blue-600" />
                           <span className="text-sm font-medium text-blue-600">Chọn ảnh từ PC</span>
                         </>
                       )}
                     </label>
                   </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Hoặc dán URL ảnh</label>
                  <Input
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    disabled={loading || isUploading}
                    className="w-full"
                  />
                </div>
              </div>

              {imageUrl && (
                <div className="mt-3 rounded-lg overflow-hidden border border-gray-200 h-48 bg-gray-100 relative group">
                  <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button type="button" variant="destructive" size="sm" onClick={() => setImageUrl('')}>Xóa ảnh</Button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={loading || isUploading} className="flex-1 h-12 text-lg">
                {loading ? 'Đang lưu...' : 'Tạo mục mới'}
              </Button>
              <Link href="/admin/dashboard" className="flex-1">
                <Button variant="outline" className="w-full h-12 text-lg">Hủy</Button>
              </Link>
            </div>
          </form>
        </Card>
      </main>
    </div>
  );
}
