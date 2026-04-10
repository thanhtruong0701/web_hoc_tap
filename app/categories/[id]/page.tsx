'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, BookOpen } from 'lucide-react';

interface Course {
  id: string;
  name: string;
  description: string;
  category_id: string;
  image_url?: string;
}

interface Category {
  id: string;
  title: string;
  description: string;
}

export default function CategoryPage() {
  const params = useParams();
  const categoryId = params.id as string;
  const [category, setCategory] = useState<Category | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const coursesRes = await fetch(`/api/courses?categoryId=${categoryId}`);
        if (coursesRes.ok) {
          const data = await coursesRes.json();
          setCourses(data.data);
          // Set category title from first course if available
          if (data.data.length > 0) {
            setCategory({
              id: categoryId,
              title: 'Khóa học',
              description: 'Danh sách các khóa học'
            });
          }
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [categoryId]);

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

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Khóa học</h1>
        <p className="text-gray-600 mb-8">Chọn một khóa học để bắt đầu học</p>

        {loading ? (
          <div className="text-center py-8 text-gray-500">Đang tải...</div>
        ) : courses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">Chưa có khóa học nào</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Link key={course.id} href={`/courses/${course.id}`}>
                <Card className="h-full flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all overflow-hidden border border-gray-200">
                  <div className="h-48 relative overflow-hidden bg-gray-100">
                    {course.image_url ? (
                      <img 
                        src={course.image_url} 
                        alt={course.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex justify-center items-center">
                         <BookOpen className="w-14 h-14 text-white opacity-80" />
                      </div>
                    )}
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">{course.name}</h3>
                    <p className="text-gray-600 mb-6 text-sm flex-1 line-clamp-3">{course.description}</p>
                    <Button className="w-full bg-indigo-600 hover:bg-indigo-700">Vào học ngay</Button>
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
