'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, BookOpen, Download, Play } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface File {
  id: string;
  filename: string;
  file_type: string;
  file_url: string;
  lesson_id: string;
}

interface Quiz {
  id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  content: string;
}

export default function LessonPage() {
  const params = useParams();
  const lessonId = params.id as string;
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const lessonRes = await fetch(`/api/lessons/${lessonId}`);
        if (lessonRes.ok) {
          const lData = await lessonRes.json();
          setLesson(lData.data);
        }

        const filesRes = await fetch(`/api/lessons?lessonId=${lessonId}`);
        if (filesRes.ok) {
          const data = await filesRes.json();
          setFiles(data.data.files || []);
          setQuizzes(data.data.quizzes || []);
        }
      } catch (error) {
        console.error('Error fetching lesson:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [lessonId]);

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
          </Link>
          <Link href="/admin">
            <Button variant="outline">Admin Portal</Button>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6">
          <ArrowLeft className="w-4 h-4" />
          Quay lại
        </Link>

        {lesson && (
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{lesson.title}</h1>
            <p className="text-gray-600 text-lg mb-8">{lesson.description}</p>

            {files.find(f => f.file_type === 'video') && (
              <div className="aspect-video mb-8 w-full bg-black rounded-xl overflow-hidden shadow-xl">
                {files.find(f => f.file_type === 'video')?.file_url.includes('youtu') ? (
                  <iframe 
                    src={files.find(f => f.file_type === 'video')?.file_url.replace('watch?v=', 'embed/')} 
                    className="w-full h-full"
                    allowFullScreen
                  />
                ) : (
                  <video controls className="w-full h-full">
                    <source src={files.find(f => f.file_type === 'video')?.file_url} />
                  </video>
                )}
              </div>
            )}

            <Card className="p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Nội dung bài học</h2>
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-700 whitespace-pre-line">{lesson.content}</p>
              </div>
            </Card>

            {(files.length > 0 || quizzes.length > 0) && (
              <Tabs defaultValue="files" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  {files.length > 0 && <TabsTrigger value="files">Tài nguyên ({files.length})</TabsTrigger>}
                  {quizzes.length > 0 && <TabsTrigger value="quiz">Quiz ({quizzes.length})</TabsTrigger>}
                  {files.length === 0 && quizzes.length === 0 && <TabsTrigger value="empty">Không có</TabsTrigger>}
                </TabsList>

                {files.length > 0 && (
                  <TabsContent value="files" className="space-y-4 mt-4">
                    <h3 className="text-xl font-bold text-gray-900">Các tài nguyên học tập</h3>
                    {files.map((file) => (
                      <Card key={file.id} className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Download className="w-5 h-5 text-blue-600" />
                          <div>
                            <p className="font-semibold text-gray-900">{file.filename}</p>
                            <p className="text-sm text-gray-600">{file.file_type}</p>
                          </div>
                        </div>
                        <a href={file.file_url} target="_blank" rel="noopener noreferrer">
                          <Button size="sm">Tải xuống</Button>
                        </a>
                      </Card>
                    ))}
                  </TabsContent>
                )}

                {quizzes.length > 0 && (
                  <TabsContent value="quiz" className="space-y-6 mt-4">
                    <h3 className="text-xl font-bold text-gray-900">Kiểm tra kiến thức</h3>
                    {quizzes.map((quiz, index) => (
                      <Card key={quiz.id} className="p-6">
                        <p className="text-lg font-semibold text-gray-900 mb-4">
                          Câu {index + 1}: {quiz.question}
                        </p>
                        <div className="space-y-2">
                          {[
                            { key: 'A', text: quiz.option_a },
                            { key: 'B', text: quiz.option_b },
                            { key: 'C', text: quiz.option_c },
                            { key: 'D', text: quiz.option_d }
                          ].map((option) => (
                            <label key={option.key} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                              <input type="radio" name={`quiz-${quiz.id}`} value={option.key} className="w-4 h-4" />
                              <span className="text-gray-700">
                                <strong>{option.key}.</strong> {option.text}
                              </span>
                            </label>
                          ))}
                        </div>
                      </Card>
                    ))}
                  </TabsContent>
                )}
              </Tabs>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
