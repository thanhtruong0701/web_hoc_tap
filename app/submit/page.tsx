'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Upload, Link as LinkIcon } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Course {
  id: string;
  name: string;
}

export default function SubmitLessonPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [courseId, setCourseId] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    async function fetchCourses() {
      try {
        const res = await fetch('/api/courses');
        if (res.ok) {
          const data = await res.json();
          setCourses(data.data || []);
        }
      } catch (err) {
        console.error('Error fetching courses:', err);
      }
    }
    fetchCourses();
  }, []);

  if (status === 'loading') {
    return <div className="text-center p-8">Đang kiểm tra đăng nhập...</div>;
  }

  if (status === 'unauthenticated' || !session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold mb-4">Bạn chưa đăng nhập</h2>
          <p className="text-gray-600 mb-6">Vui lòng đăng nhập bằng Google để có thể gửi bài viết mới.</p>
          <Button onClick={() => signIn('google')} className="w-full">
            Đăng nhập bằng Google
          </Button>
          <div className="mt-4">
            <Link href="/" className="text-blue-600 hover:underline">Quay lại trang chủ</Link>
          </div>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (!title.trim() || !courseId || !content.trim()) {
        setError('Vui lòng điền đầy đủ thông tin');
        setLoading(false);
        return;
      }

      const uploadedFiles = [];
      if (selectedFile) {
        const fd = new FormData();
        fd.append('file', selectedFile);
        const upRes = await fetch('/api/upload', { method: 'POST', body: fd });
        if (upRes.ok) {
          const uData = await upRes.json();
          uploadedFiles.push({ file_url: uData.url, file_name: uData.filename, file_type: selectedFile.type.includes('video') ? 'video' : 'document' });
        }
      }

      if (videoUrl) {
        uploadedFiles.push({ file_url: videoUrl, file_name: 'Video liên kết', file_type: 'video' });
      }

      const res = await fetch('/api/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          courseId, 
          title, 
          content,
          status: 'pending',
          authorEmail: session.user?.email,
          files: uploadedFiles
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi từ máy chủ');

      setSuccess('Gửi bài thành công! Bài viết đang chờ Admin phê duyệt.');
      setTitle('');
      setContent('');
      setCourseId('');
      setVideoUrl('');
      setSelectedFile(null);
    } catch (err: any) {
      setError(err.message || 'Lỗi khi gửi bài học');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
            <ArrowLeft className="w-4 h-4" />
            Quay lại Học Tập
          </Link>
          <div className="text-sm font-medium text-gray-700">
            Đăng nhập dưới tư cách: <span className="text-blue-600 border px-3 py-1 rounded bg-blue-50">{session.user?.email}</span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Đóng góp bài học mới</h1>
          <p className="text-gray-600 mb-6">Chia sẻ kiến thức của bạn. Bài học sẽ được đăng lên sau khi Admin duyệt.</p>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-6 bg-green-50 border-green-200">
              <AlertDescription className="text-green-800 font-medium">{success}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bạn muốn đăng vào Khóa học nào?
              </label>
              <Select value={courseId} onValueChange={setCourseId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn khóa học" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id.toString()}>
                      {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tiêu đề bài viết
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ví dụ: Phân tích bài thơ ABC"
                disabled={loading}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nội dung chi tiết
              </label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Nhập nội dung giảng dạy..."
                disabled={loading}
                className="w-full"
                rows={12}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-lg border border-dashed border-gray-300">
              <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">
                   Đính kèm File Tài liệu (PDF, Word...)
                 </label>
                 <Input 
                   type="file" 
                   onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                   disabled={loading}
                 />
              </div>
              <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                   <LinkIcon className="w-4 h-4"/> Nối Link Video YouTube (Nếu có)
                 </label>
                 <Input 
                   type="text" 
                   placeholder="https://youtube.com/watch?v=..."
                   value={videoUrl}
                   onChange={(e) => setVideoUrl(e.target.value)}
                   disabled={loading}
                 />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full text-lg"
            >
              {loading ? 'Đang gửi...' : 'Gửi bài nộp'}
            </Button>
          </form>
        </Card>
      </main>
    </div>
  );
}
