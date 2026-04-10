'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, BookOpen, FileText, HelpCircle, CheckCircle2, XCircle, ExternalLink, Download } from 'lucide-react';

interface LessonFile {
  id: string;
  file_name: string;
  file_type: string;
  file_url: string;
}

// Helper: Lấy URL có thể mở xem được (cho PDF dùng Google Docs Viewer)
function getViewUrl(file: LessonFile): string {
  const url = file.file_url;
  if (!url) return '#';
  
  // Nếu là PDF, dùng Google Docs Viewer để đảm bảo mở được trên mọi trình duyệt
  if (file.file_type === 'pdf' || url.toLowerCase().endsWith('.pdf')) {
    return `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`;
  }
  
  // Nếu là document (Word, Excel), dùng Google Docs Viewer
  if (file.file_type === 'document') {
    return `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`;
  }
  
  return url;
}

// Helper: Lấy URL tải về (thêm fl_attachment cho Cloudinary)
function getDownloadUrl(file: LessonFile): string {
  const url = file.file_url;
  if (!url) return '#';
  
  // Nếu là URL Cloudinary, thêm flag fl_attachment để ép tải về
  if (url.includes('res.cloudinary.com')) {
    // Chèn fl_attachment vào sau /upload/
    return url.replace('/upload/', '/upload/fl_attachment/');
  }
  
  return url;
}

interface QuizAnswer {
  id: string;
  answer_text: string;
  is_correct: boolean;
}

interface QuizQuestion {
  id: string;
  question_text: string;
  answers: QuizAnswer[];
}

interface Quiz {
  id: string;
  title: string;
  questions: QuizQuestion[];
}

interface Lesson {
  id: string;
  title: string;
  content: string;
  course_name?: string;
  files: LessonFile[];
  quizzes: Quiz[];
}

export default function LessonPage() {
  const params = useParams();
  const lessonId = params.id as string;
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  // Quiz interaction state: { [questionId]: selectedAnswerId }
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/lessons/${lessonId}`);
        if (res.ok) {
          const data = await res.json();
          setLesson(data.data);
        }
      } catch (error) {
        console.error('Error fetching lesson:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [lessonId]);

  const getFileIcon = (type: string) => {
    const icons: Record<string, string> = { pdf: '📄', document: '📝', video: '🎬', image: '🖼️', link: '🔗' };
    return icons[type] || '📎';
  };

  const handleSelectAnswer = (questionId: string, answerId: string) => {
    if (submitted[questionId]) return; // Can't change after submitting
    setSelectedAnswers(prev => ({ ...prev, [questionId]: answerId }));
  };

  const handleCheckAnswer = (questionId: string) => {
    if (!selectedAnswers[questionId]) return;
    setSubmitted(prev => ({ ...prev, [questionId]: true }));
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-gray-500">Đang tải...</div>
    </div>
  );

  if (!lesson) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-gray-500">Không tìm thấy bài học</div>
    </div>
  );

  // Find video type files
  const videoFiles = lesson.files?.filter(f => f.file_type === 'video') || [];
  const otherFiles = lesson.files?.filter(f => f.file_type !== 'video') || [];

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

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6">
          <ArrowLeft className="w-4 h-4" /> Quay lại
        </Link>

        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">{lesson.title}</h1>
        {lesson.course_name && <p className="text-gray-500 mb-6">📚 {lesson.course_name}</p>}

        {/* VIDEO (if any) */}
        {videoFiles.map(file => (
          <div key={file.id} className="aspect-video mb-8 w-full bg-black rounded-xl overflow-hidden shadow-xl">
            {file.file_url.includes('youtu') ? (
              <iframe
                src={file.file_url.replace('watch?v=', 'embed/').replace('youtu.be/', 'www.youtube.com/embed/')}
                className="w-full h-full"
                allowFullScreen
                title={file.file_name}
              />
            ) : (
              <video controls className="w-full h-full">
                <source src={file.file_url} />
              </video>
            )}
          </div>
        ))}

        {/* NỘI DUNG BÀI HỌC */}
        <Card className="p-6 sm:p-8 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">📖 Nội dung bài học</h2>
          <div className="text-gray-700 whitespace-pre-line leading-relaxed">{lesson.content}</div>
        </Card>

        {/* TÀI LIỆU ĐÍNH KÈM */}
        {otherFiles.length > 0 && (
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-500" /> Tài liệu đính kèm ({otherFiles.length})
            </h2>
            <div className="space-y-3">
              {otherFiles.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getFileIcon(file.file_type)}</span>
                    <div>
                      <p className="font-semibold text-gray-900">{file.file_name}</p>
                      <p className="text-xs text-gray-500 capitalize">{file.file_type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a href={getViewUrl(file)} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" className="flex items-center gap-1">
                        <ExternalLink className="w-3 h-3" /> Mở xem
                      </Button>
                    </a>
                    <a href={getDownloadUrl(file)} download={file.file_name} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="outline" className="flex items-center gap-1">
                        <Download className="w-3 h-3" /> Tải về
                      </Button>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* QUIZ */}
        {lesson.quizzes && lesson.quizzes.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-green-500" /> Kiểm tra kiến thức
            </h2>
            {lesson.quizzes.map((quiz) => (
              <Card key={quiz.id} className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">🏆 {quiz.title}</h3>
                <div className="space-y-6">
                  {quiz.questions?.map((question, qi) => {
                    const isSubmitted = submitted[question.id];
                    const selectedId = selectedAnswers[question.id];
                    const correctAnswer = question.answers?.find(a => a.is_correct);
                    const isCorrect = isSubmitted && selectedId === correctAnswer?.id;

                    return (
                      <div key={question.id} className={`p-4 rounded-lg border-2 transition-colors ${
                        isSubmitted
                          ? isCorrect ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'
                          : 'border-gray-200 bg-white'
                      }`}>
                        <p className="font-semibold text-gray-900 mb-3">
                          Câu {qi + 1}: {question.question_text}
                        </p>
                        <div className="space-y-2">
                          {question.answers?.map((answer, ai) => {
                            const isSelected = selectedId === answer.id;
                            const showCorrect = isSubmitted && answer.is_correct;
                            const showWrong = isSubmitted && isSelected && !answer.is_correct;

                            return (
                              <label
                                key={answer.id}
                                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                                  showCorrect ? 'border-green-400 bg-green-100 text-green-800 font-medium'
                                  : showWrong ? 'border-red-400 bg-red-100 text-red-800'
                                  : isSelected ? 'border-blue-400 bg-blue-50'
                                  : 'border-gray-200 hover:bg-gray-50'
                                }`}
                                onClick={() => handleSelectAnswer(question.id, answer.id)}
                              >
                                <input type="radio" name={`q_${question.id}`} checked={isSelected} readOnly className="accent-blue-500" />
                                <span className="font-medium text-gray-600 text-sm">{String.fromCharCode(65 + ai)}.</span>
                                <span>{answer.answer_text}</span>
                                {showCorrect && <CheckCircle2 className="w-4 h-4 text-green-600 ml-auto" />}
                                {showWrong && <XCircle className="w-4 h-4 text-red-600 ml-auto" />}
                              </label>
                            );
                          })}
                        </div>
                        {!isSubmitted && (
                          <Button
                            size="sm"
                            className="mt-3"
                            disabled={!selectedId}
                            onClick={() => handleCheckAnswer(question.id)}
                          >
                            Kiểm tra đáp án
                          </Button>
                        )}
                        {isSubmitted && (
                          <p className={`mt-3 font-semibold ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                            {isCorrect ? '✅ Chính xác!' : `❌ Sai rồi! Đáp án đúng là: "${correctAnswer?.answer_text}"`}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
