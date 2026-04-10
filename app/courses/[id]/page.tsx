'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, BookOpen, FileText } from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  description: string;
  course_id: string;
  order_index: number;
  content: string;
}

interface Course {
  id: string;
  name: string;
  description: string;
}

export default function CoursePage() {
  const params = useParams();
  const courseId = params.id as string;
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const courseRes = await fetch(`/api/courses/${courseId}`);
        if (courseRes.ok) {
          const cData = await courseRes.json();
          setCourse(cData.data);
        }

        const lessonsRes = await fetch(`/api/lessons?courseId=${courseId}`);
        if (lessonsRes.ok) {
          const data = await lessonsRes.json();
          setLessons(data.data.filter((l: any) => l.status === 'approved' || !l.status));
        }
      } catch (error) {
        console.error('Error fetching lessons:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [courseId]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">LearnHub</span>
          </Link>
          <Link href="/admin">
            <Button variant="outline">Admin Portal</Button>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6">
          <ArrowLeft className="w-4 h-4" />
          Quay lại trang chủ
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">{course?.name || 'Bài học'}</h1>
        <p className="text-gray-600 mb-8">{course?.description || 'Chọn một bài để bắt đầu học'}</p>

        {loading ? (
          <div className="text-center py-8 text-gray-500">Đang tải...</div>
        ) : lessons.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">Chưa có bài học nào</p>
          </div>
        ) : (
          <div className="space-y-4">
            {lessons.map((lesson, index) => (
              <Link key={lesson.id} href={`/lessons/${lesson.id}`}>
                <Card className="group p-4 sm:p-6 hover:shadow-md hover:border-blue-400 transition-all cursor-pointer border-2 border-transparent bg-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex-shrink-0 w-12 h-12 bg-blue-50 group-hover:bg-blue-600 rounded-full flex items-center justify-center text-blue-600 group-hover:text-white transition-colors duration-300 font-bold text-lg">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors">{lesson.title}</h3>
                        <p className="text-gray-500 text-sm mt-1 line-clamp-1">{lesson.description || 'Chưa có mô tả'}</p>
                      </div>
                    </div>
                    <div className="hidden sm:flex items-center text-sm font-medium text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      Học bài <ArrowLeft className="w-4 h-4 ml-1 rotate-180" />
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
