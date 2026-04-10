'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BookOpen, Users, Eye, Layers } from 'lucide-react';

interface Category {
  id: string;
  title: string;
  name: string;
  description: string;
  image_url?: string;
}

interface Stats {
  totalLessons: number;
  totalCategories: number;
  totalViews: number;
  activeUsers: number;
}

export default function Home() {
  const { data: session } = useSession();
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalLessons: 0,
    totalCategories: 0,
    totalViews: 0,
    activeUsers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [categoriesRes, statsRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/stats')
        ]);

        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json();
          setCategories(categoriesData.data);
        }

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">LearnHub</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            {session ? (
              <>
                 <Link href="/submit">
                   <Button variant="default" className="bg-green-600 hover:bg-green-700 hidden sm:flex">
                     Viết Bài
                   </Button>
                 </Link>
                 <Button variant="ghost" onClick={() => signOut()} className="hidden md:flex">Đăng xuất</Button>
              </>
            ) : (
              <Link href="/login">
                <Button variant="default" className="bg-blue-600 hover:bg-blue-700">Đăng nhập / Đăng ký</Button>
              </Link>
            )}
            <Link href="/admin">
              <Button variant="outline">Admin</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Nền tảng học tập trực tuyến
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Học tập từ các khóa học chất lượng cao với nội dung phong phú
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <Layers className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-3xl font-bold text-gray-900">{stats.totalCategories}</div>
            <div className="text-gray-600 text-sm mt-1">Mục học tập</div>
          </Card>
          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <BookOpen className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-3xl font-bold text-gray-900">{stats.totalLessons}</div>
            <div className="text-gray-600 text-sm mt-1">Bài viết</div>
          </Card>
          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <Eye className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <div className="text-3xl font-bold text-gray-900">{stats.totalViews.toLocaleString()}</div>
            <div className="text-gray-600 text-sm mt-1">Lượt xem</div>
          </Card>
          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <div className="text-3xl font-bold text-gray-900">{stats.activeUsers}</div>
            <div className="text-gray-600 text-sm mt-1">Đang online</div>
          </Card>
        </div>
      </section>

      {/* Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Khám phá các mục học tập</h2>
        {loading ? (
          <div className="text-center py-8 text-gray-500">Đang tải...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Link key={category.id} href={`/categories/${category.id}`}>
                <Card className="h-full hover:shadow-lg hover:scale-105 transition-all cursor-pointer overflow-hidden border-2 border-transparent hover:border-blue-500 flex flex-col">
                  <div className="h-40 relative overflow-hidden">
                    {category.image_url ? (
                      <img
                        src={category.image_url}
                        alt={category.name || category.title}
                        className="w-full h-full object-cover"
                        onError={(e: any) => {
                          e.target.parentElement.innerHTML = '<div class="w-full h-full bg-gradient-to-r from-blue-500 to-cyan-500 flex justify-center items-center"><svg xmlns=\'http://www.w3.org/2000/svg\' width=\'48\' height=\'48\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'white\' stroke-width=\'2\'><polygon points=\'12 2 2 7 12 12 22 7 12 2\'></polygon><polyline points=\'2 17 12 22 22 17\'></polyline><polyline points=\'2 12 12 17 22 12\'></polyline></svg></div>';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-r from-blue-500 to-cyan-500 flex justify-center items-center">
                        <Layers className="w-12 h-12 text-white opacity-90" />
                      </div>
                    )}
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{category.name || category.title}</h3>
                    <p className="text-gray-600 mb-6 flex-1">{category.description}</p>
                    <Button className="w-full mt-auto bg-blue-600 hover:bg-blue-700">Khám Phá Ngay</Button>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 border-t border-gray-200 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 LearnHub. Nền tảng học tập hiện đại.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
