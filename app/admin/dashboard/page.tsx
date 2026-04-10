'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { BookOpen, Users, Eye, Layers, LogOut, Plus, Edit, Trash2 } from 'lucide-react';

interface Stats {
  totalLessons: number;
  totalCategories: number;
  totalViews: number;
  activeUsers: number;
  topLessons: any[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({
    totalLessons: 0,
    totalCategories: 0,
    totalViews: 0,
    activeUsers: 0,
    topLessons: []
  });
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [lessons, setLessons] = useState<any[]>([]);
  const [loadingLessons, setLoadingLessons] = useState(false);

  async function fetchCategories() {
    setLoadingCategories(true);
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoadingCategories(false);
    }
  }

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa mục này?')) return;
    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchCategories();
      }
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  async function fetchCourses() {
    setLoadingCourses(true);
    try {
      const res = await fetch('/api/courses');
      if (res.ok) {
        const data = await res.json();
        setCourses(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoadingCourses(false);
    }
  }

  const handleDeleteCourse = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa khóa học này?')) return;
    try {
      const res = await fetch(`/api/courses/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchCourses();
      }
    } catch (error) {
      console.error('Error deleting course:', error);
    }
  };

  async function fetchLessons() {
    setLoadingLessons(true);
    try {
      const res = await fetch('/api/lessons');
      if (res.ok) {
        const data = await res.json();
        setLessons(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching lessons:', error);
    } finally {
      setLoadingLessons(false);
    }
  }

  const handleDeleteLesson = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bài học này?')) return;
    try {
      const res = await fetch(`/api/lessons/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchLessons();
      }
    } catch (error) {
      console.error('Error deleting lesson:', error);
    }
  };

  const handleApproveLesson = async (id: string, courseId: string, title: string, content: string) => {
    if (!confirm('Bạn duyệt cho bài viết này được hiển thị công khai?')) return;
    try {
      const res = await fetch(`/api/lessons/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, title, content, status: 'approved' })
      });
      if (res.ok) {
        fetchLessons();
      }
    } catch (error) {
      console.error('Error approving lesson:', error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin');
    }
  }, [router]);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data.data);
          
          // Prepare chart data
          setChartData([
            { name: 'Mục', value: data.data.totalCategories },
            { name: 'Bài viết', value: data.data.totalLessons },
            { name: 'Lượt xem', value: Math.floor(data.data.totalViews / 10) },
            { name: 'Online', value: data.data.activeUsers }
          ]);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
    fetchCategories();
    fetchCourses();
    fetchLessons();
    const interval = setInterval(fetchStats, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    router.push('/admin');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">LearnHub</span>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded ml-2">Admin</span>
          </Link>
          <Button variant="ghost" onClick={handleLogout} className="flex items-center gap-2">
            <LogOut className="w-4 h-4" />
            Đăng xuất
          </Button>
        </div>
      </header>

      {/* Sidebar Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="categories">Quản lý mục</TabsTrigger>
            <TabsTrigger value="courses">Quản lý khóa</TabsTrigger>
            <TabsTrigger value="lessons">Quản lý bài học</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
              <p className="text-gray-600">Tổng quan về thống kê nền tảng</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Mục học tập</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalCategories}</p>
                  </div>
                  <Layers className="w-10 h-10 text-blue-600 opacity-20" />
                </div>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Bài viết</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalLessons}</p>
                  </div>
                  <BookOpen className="w-10 h-10 text-green-600 opacity-20" />
                </div>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Lượt xem</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalViews.toLocaleString()}</p>
                  </div>
                  <Eye className="w-10 h-10 text-orange-600 opacity-20" />
                </div>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Đang online</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.activeUsers}</p>
                  </div>
                  <Users className="w-10 h-10 text-purple-600 opacity-20" />
                </div>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Phân bố dữ liệu</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Tỷ lệ thống kê</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {COLORS.map((color, index) => (
                        <Cell key={`cell-${index}`} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </div>

            {/* Top Lessons */}
            {stats.topLessons.length > 0 && (
              <Card className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Bài học được xem nhiều nhất</h3>
                <div className="space-y-3">
                  {stats.topLessons.map((lesson, index) => (
                    <div key={lesson.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-lg text-gray-900 w-6">{index + 1}.</span>
                        <div>
                          <p className="font-semibold text-gray-900">{lesson.title}</p>
                          <p className="text-sm text-gray-600">{lesson.course_title}</p>
                        </div>
                      </div>
                      <span className="font-semibold text-gray-900">{lesson.total_views} lượt xem</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Quản lý mục học tập</h2>
                <p className="text-gray-600 mt-1">Tạo, chỉnh sửa hoặc xóa các mục học tập</p>
              </div>
              <Link href="/admin/categories/create">
                <Button className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Thêm mục mới
                </Button>
              </Link>
            </div>
            <Card className="p-6">
              {loadingCategories ? (
                <p className="text-gray-600">Đang tải...</p>
              ) : categories.length === 0 ? (
                <p className="text-gray-600">Chưa có mục học tập nào.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-gray-700">
                    <thead className="bg-gray-50 text-gray-900 border-b">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Tên mục</th>
                        <th className="px-4 py-3 font-semibold w-1/2">Mô tả</th>
                        <th className="px-4 py-3 font-semibold text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {categories.map((cat) => (
                        <tr key={cat.id} className="hover:bg-gray-50/50">
                          <td className="px-4 py-3 font-medium text-gray-900">{cat.name}</td>
                          <td className="px-4 py-3">{cat.description}</td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-2">
                              <Link href={`/admin/categories/${cat.id}/edit`}>
                                <Button variant="outline" size="icon" className="h-8 w-8 text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Button 
                                variant="outline" 
                                size="icon" 
                                className="h-8 w-8 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                                onClick={() => handleDeleteCategory(cat.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="courses" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Quản lý khóa học</h2>
                <p className="text-gray-600 mt-1">Tạo, chỉnh sửa hoặc xóa các khóa học</p>
              </div>
              <Link href="/admin/courses/create">
                <Button className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Thêm khóa mới
                </Button>
              </Link>
            </div>
            <Card className="p-6">
              {loadingCourses ? (
                <p className="text-gray-600">Đang tải...</p>
              ) : courses.length === 0 ? (
                <p className="text-gray-600">Chưa có khóa học nào.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-gray-700">
                    <thead className="bg-gray-50 text-gray-900 border-b">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Tên khóa học</th>
                        <th className="px-4 py-3 font-semibold">Mục học tập</th>
                        <th className="px-4 py-3 font-semibold">Mô tả</th>
                        <th className="px-4 py-3 font-semibold text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {courses.map((course) => (
                        <tr key={course.id} className="hover:bg-gray-50/50">
                          <td className="px-4 py-3 font-medium text-gray-900">{course.name}</td>
                          <td className="px-4 py-3 text-blue-600">
                            {course.category_name}
                          </td>
                          <td className="px-4 py-3">{course.description}</td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-2">
                              <Link href={`/admin/courses/${course.id}/edit`}>
                                <Button variant="outline" size="icon" className="h-8 w-8 text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Button 
                                variant="outline" 
                                size="icon" 
                                className="h-8 w-8 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                                onClick={() => handleDeleteCourse(course.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="lessons" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Quản lý bài học</h2>
                <p className="text-gray-600 mt-1">Tạo, chỉnh sửa hoặc xóa bài học</p>
              </div>
              <Link href="/admin/lessons/create">
                <Button className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Thêm bài mới
                </Button>
              </Link>
            </div>
            <Card className="p-6">
              {loadingLessons ? (
                <p className="text-gray-600">Đang tải...</p>
              ) : lessons.length === 0 ? (
                <p className="text-gray-600">Chưa có bài học nào.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-gray-700">
                    <thead className="bg-gray-50 text-gray-900 border-b">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Tên bài học</th>
                        <th className="px-4 py-3 font-semibold">Khóa học</th>
                        <th className="px-4 py-3 font-semibold">Tác giả</th>
                        <th className="px-4 py-3 font-semibold">Trạng thái</th>
                        <th className="px-4 py-3 font-semibold text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {lessons.map((lesson) => (
                        <tr key={lesson.id} className="hover:bg-gray-50/50">
                          <td className="px-4 py-3 font-medium text-gray-900">{lesson.title}</td>
                          <td className="px-4 py-3 text-purple-600">
                            {lesson.course_name}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {lesson.author_email || 'Admin'}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${lesson.status === 'pending' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'}`}>
                              {lesson.status === 'pending' ? 'Chờ duyệt' : 'Công khai'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-2">
                              {lesson.status === 'pending' && (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="text-green-600 border-green-200 hover:bg-green-50"
                                  onClick={() => handleApproveLesson(lesson.id, lesson.course_id, lesson.title, lesson.content)}
                                >
                                  Duyệt
                                </Button>
                              )}
                              <Link href={`/admin/lessons/${lesson.id}/edit`}>
                                <Button variant="outline" size="icon" className="h-8 w-8 text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Button 
                                variant="outline" 
                                size="icon" 
                                className="h-8 w-8 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                                onClick={() => handleDeleteLesson(lesson.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
