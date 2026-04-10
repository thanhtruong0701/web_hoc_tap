'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Upload, Loader2, Image as ImageIcon } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const CLOUDINARY_CLOUD_NAME = 'dndqwxqlr';
const CLOUDINARY_UPLOAD_PRESET = 'learnhub_uploads';

interface Category { id: string; name: string; }

export default function EditCourse({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const [catRes, courseRes] = await Promise.all([
          fetch('/api/categories'),
          fetch(`/api/courses/${id}`)
        ]);
        if (catRes.ok) { const d = await catRes.json(); setCategories(d.data || []); }
        const courseData = await courseRes.json();
        if (!courseRes.ok) { setError(courseData.error || 'Lỗi tải khóa học'); return; }
        setTitle(courseData.data.name || '');
        setDescription(courseData.data.description || '');
        setCategoryId(courseData.data.category_id?.toString() || '');
        setImageUrl(courseData.data.image_url || '');
      } catch (err) {
        setError('Không thể kết nối đến máy chủ');
      } finally {
        setFetching(false);
      }
    }
    if (id) fetchData();
  }, [id]);

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
      if (!title.trim() || !categoryId) {
        setError('Vui lòng điền tên khóa học và chọn mục học tập');
        setLoading(false); return;
      }
      const res = await fetch(`/api/courses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryId, name: title, description, image_url: imageUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi từ máy chủ');
      setSuccess('Khóa học đã được cập nhật thành công!');
      setTimeout(() => { router.push('/admin/dashboard'); }, 2000);
    } catch (err: any) {
      setError(err.message || 'Lỗi khi cập nhật khóa học');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-500">Đang tải dữ liệu...</p>
    </div>
  );

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
        <Card className="p-8 shadow-lg">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Chỉnh sửa khóa học</h1>
          {error && (<Alert variant="destructive" className="mb-6"><AlertDescription>{error}</AlertDescription></Alert>)}
          {success && (<Alert className="mb-6 bg-green-50 border-green-200"><AlertDescription className="text-green-800">{success}</AlertDescription></Alert>)}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mục học tập</label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Chọn mục học tập" /></SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tên khóa học</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ví dụ: Toán học cơ bản" disabled={loading} className="w-full h-10" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Mô tả chi tiết về khóa học" disabled={loading} className="w-full" rows={4} />
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-blue-500" /> Ảnh bìa khóa học
              </label>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                   <label className="text-xs text-gray-500 mb-1 block">Tải ảnh mới từ máy</label>
                   <div className="relative">
                     <Input 
                       type="file" 
                       accept="image/*"
                       className="hidden" 
                       id="course-edit-image-upload"
                       onChange={handleImageUpload}
                       disabled={isUploading || loading}
                     />
                     <label 
                       htmlFor="course-edit-image-upload"
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
                           <span className="text-sm font-medium text-blue-600">Chọn ảnh mới</span>
                         </>
                       )}
                     </label>
                   </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-500 mb-1 block">Hoặc dán URL mới</label>
                  <Input
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    disabled={loading || isUploading}
                    className="w-full h-10"
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
              <Button type="submit" disabled={loading || isUploading} className="flex-1 h-12 text-lg font-bold">
                {loading ? 'Đang cập nhật...' : '💾 Cập nhật khóa học'}
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
