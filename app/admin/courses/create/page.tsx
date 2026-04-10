'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Category {
  id: string;
  name: string;
}

export default function CreateCourse() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('/api/categories');
        if (res.ok) {
          const data = await res.json();
          setCategories(data.data);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    }
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (!title.trim() || !categoryId) {
        setError('Vui lòng điền đầy đủ thông tin');
        setLoading(false);
        return;
      }

      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryId, name: title, description, image_url: imageUrl }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi từ máy chủ');

      setSuccess('Khóa học đã được thêm thành công!');
      setTimeout(() => {
        router.push('/admin/dashboard');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Lỗi khi thêm khóa học');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/admin/dashboard" className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
            <ArrowLeft className="w-4 h-4" />
            Quay lại Dashboard
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Thêm khóa học mới</h1>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-6 bg-green-50 border-green-200">
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mục học tập
              </label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn mục học tập" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên khóa học
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ví dụ: Cộng trừ hai chữ số"
                disabled={loading}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mô tả
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả chi tiết về khóa học"
                disabled={loading}
                className="w-full"
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🖼️ Ảnh bìa khóa học (dán link URL ảnh từ internet)
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
              <p className="text-xs text-gray-500 mt-1">💡 Tìm ảnh miễn phí tại <a href="https://unsplash.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">unsplash.com</a></p>
            </div>

            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Đang thêm...' : 'Thêm khóa'}
              </Button>
              <Link href="/admin/dashboard" className="flex-1">
                <Button variant="outline" className="w-full">
                  Hủy
                </Button>
              </Link>
            </div>
          </form>
        </Card>
      </main>
    </div>
  );
}
