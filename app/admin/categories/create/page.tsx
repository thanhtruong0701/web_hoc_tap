'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function CreateCategory() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (!title.trim()) {
        setError('Vui lòng nhập tên mục');
        setLoading(false);
        return;
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
            <ArrowLeft className="w-4 h-4" />
            Quay lại Dashboard
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🖼️ Ảnh bìa (dán link URL ảnh từ internet)
              </label>
              <Input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Ví dụ: https://images.unsplash.com/photo-..."
                disabled={loading}
                className="w-full"
              />
              {imageUrl && (
                <div className="mt-3 rounded-lg overflow-hidden border border-gray-200 h-40 bg-gray-100">
                  <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" onError={(e: any) => { e.target.style.display='none'; }} />
                </div>
              )}
              <p className="text-xs text-gray-500 mt-1">
                💡 Tìm ảnh miễn phí tại{' '}
                <a href="https://unsplash.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">unsplash.com</a>
                {' '}→ Click ảnh → Nhấn nút "Copy image address"
              </p>
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Đang thêm...' : 'Thêm mục'}
              </Button>
              <Link href="/admin/dashboard" className="flex-1">
                <Button variant="outline" className="w-full">Hủy</Button>
              </Link>
            </div>
          </form>
        </Card>
      </main>
    </div>
  );
}
