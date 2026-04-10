'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Plus, Trash2, FileText, HelpCircle } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Course { id: string; name: string; }
interface LessonFile { id?: string; file_name: string; file_url: string; file_type: string; }
interface QuizAnswer { id?: string; answer_text: string; is_correct: boolean; }
interface QuizQuestion { id?: string; question_text: string; answers: QuizAnswer[]; }
interface Quiz { id?: string; title: string; questions: QuizQuestion[]; }

export default function EditLesson({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [courseId, setCourseId] = useState('');
  const [courses, setCourses] = useState<Course[]>([]);
  const [files, setFiles] = useState<LessonFile[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const [courseRes, lessonRes] = await Promise.all([
          fetch('/api/courses'),
          fetch(`/api/lessons/${id}`)
        ]);

        if (courseRes.ok) {
          const courseData = await courseRes.json();
          setCourses(courseData.data || []);
        }

        const lessonData = await lessonRes.json();
        if (!lessonRes.ok) { setError(lessonData.error || 'Lỗi tải bài học'); return; }

        setTitle(lessonData.data.title || '');
        setContent(lessonData.data.content || '');
        setCourseId(lessonData.data.course_id?.toString() || '');
        setFiles(lessonData.data.files || []);
        setQuizzes(lessonData.data.quizzes || []);
      } catch (err) {
        setError('Không thể kết nối đến máy chủ');
      } finally {
        setFetching(false);
      }
    }
    if (id) fetchData();
  }, [id]);

  // FILE HANDLERS
  const addFile = () => setFiles([...files, { file_name: '', file_url: '', file_type: 'pdf' }]);
  const removeFile = (i: number) => setFiles(files.filter((_, idx) => idx !== i));
  const updateFile = (i: number, field: keyof LessonFile, value: string) => {
    const updated = [...files];
    updated[i] = { ...updated[i], [field]: value };
    setFiles(updated);
  };

  // QUIZ HANDLERS
  const addQuiz = () => setQuizzes([...quizzes, { title: '', questions: [{ question_text: '', answers: [
    { answer_text: '', is_correct: true }, { answer_text: '', is_correct: false },
    { answer_text: '', is_correct: false }, { answer_text: '', is_correct: false }
  ]}]}]);
  const removeQuiz = (qi: number) => setQuizzes(quizzes.filter((_, i) => i !== qi));
  const addQuestion = (qi: number) => {
    const updated = [...quizzes];
    updated[qi].questions.push({ question_text: '', answers: [
      { answer_text: '', is_correct: true }, { answer_text: '', is_correct: false },
      { answer_text: '', is_correct: false }, { answer_text: '', is_correct: false }
    ]});
    setQuizzes(updated);
  };
  const removeQuestion = (qi: number, qqi: number) => {
    const updated = [...quizzes];
    updated[qi].questions = updated[qi].questions.filter((_, i) => i !== qqi);
    setQuizzes(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    try {
      if (!title.trim() || !courseId || !content.trim()) {
        setError('Vui lòng điền đầy đủ Tên bài học, Nội dung và chọn Khóa học');
        setLoading(false); return;
      }

      const res = await fetch(`/api/lessons/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId, title, content,
          files: files.filter(f => f.file_name.trim() && f.file_url.trim()),
          quizzes: quizzes.filter(q => q.title.trim())
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi từ máy chủ');

      setSuccess('Bài học đã được cập nhật thành công!');
      setTimeout(() => { router.push('/admin/dashboard'); }, 2000);
    } catch (err: any) {
      setError(err.message || 'Lỗi khi cập nhật bài học');
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

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
        {success && <Alert className="bg-green-50 border-green-200"><AlertDescription className="text-green-800">{success}</AlertDescription></Alert>}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* === PHẦN 1: THÔNG TIN CƠ BẢN === */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">📝 Thông tin bài học</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Khóa học</label>
                <Select value={courseId} onValueChange={setCourseId}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Chọn khóa học" /></SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id.toString()}>{course.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên bài học</label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ví dụ: Bài 1 - Giới thiệu" disabled={loading} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung chi tiết</label>
                <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Viết nội dung bài học ở đây" disabled={loading} rows={10} />
              </div>
            </div>
          </Card>

          {/* === PHẦN 2: TÀI LIỆU ĐÍNH KÈM === */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" /> Tài liệu đính kèm
              </h2>
              <Button type="button" variant="outline" size="sm" onClick={addFile} className="flex items-center gap-1">
                <Plus className="w-4 h-4" /> Thêm tài liệu
              </Button>
            </div>

            {files.length === 0 && (
              <p className="text-gray-400 text-sm text-center py-4 border-2 border-dashed rounded-lg">
                Chưa có tài liệu nào. Nhấn "+ Thêm tài liệu" để thêm PDF, Word, video...
              </p>
            )}

            <div className="space-y-4">
              {files.map((file, i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700">Tài liệu #{i + 1}</span>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeFile(i)} className="text-red-500 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Tên hiển thị</label>
                      <Input value={file.file_name} onChange={(e) => updateFile(i, 'file_name', e.target.value)} placeholder="Ví dụ: Bài giảng PDF" disabled={loading} />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Link URL (Google Drive, YouTube...)</label>
                      <Input value={file.file_url} onChange={(e) => updateFile(i, 'file_url', e.target.value)} placeholder="https://..." disabled={loading} />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Loại tài liệu</label>
                      <Select value={file.file_type} onValueChange={(val) => updateFile(i, 'file_type', val)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pdf">📄 PDF</SelectItem>
                          <SelectItem value="document">📝 Word/Doc</SelectItem>
                          <SelectItem value="video">🎬 Video (YouTube)</SelectItem>
                          <SelectItem value="image">🖼️ Hình ảnh</SelectItem>
                          <SelectItem value="link">🔗 Link khác</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* === PHẦN 3: QUIZ === */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-green-600" /> Câu hỏi kiểm tra (Quiz)
              </h2>
              <Button type="button" variant="outline" size="sm" onClick={addQuiz} className="flex items-center gap-1">
                <Plus className="w-4 h-4" /> Thêm bộ Quiz
              </Button>
            </div>

            {quizzes.length === 0 && (
              <p className="text-gray-400 text-sm text-center py-4 border-2 border-dashed rounded-lg">
                Chưa có Quiz nào. Nhấn "+ Thêm bộ Quiz" để tạo câu hỏi trắc nghiệm.
              </p>
            )}

            <div className="space-y-6">
              {quizzes.map((quiz, qi) => (
                <div key={qi} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <Input
                      value={quiz.title}
                      onChange={(e) => { const u=[...quizzes]; u[qi].title=e.target.value; setQuizzes(u); }}
                      placeholder={`Tên bộ Quiz #${qi+1} (Ví dụ: Ôn tập chương 1)`}
                      className="font-medium flex-1 mr-2"
                      disabled={loading}
                    />
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeQuiz(qi)} className="text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  {quiz.questions.map((q, qqi) => (
                    <div key={qqi} className="border border-gray-100 rounded-lg p-3 mb-3 bg-gray-50">
                      <div className="flex items-start gap-2 mb-3">
                        <span className="text-sm font-semibold text-gray-600 mt-2 whitespace-nowrap">Câu {qqi+1}:</span>
                        <Textarea
                          value={q.question_text}
                          onChange={(e) => { const u=[...quizzes]; u[qi].questions[qqi].question_text=e.target.value; setQuizzes(u); }}
                          placeholder="Nhập câu hỏi..."
                          rows={2}
                          className="flex-1"
                          disabled={loading}
                        />
                        {quiz.questions.length > 1 && (
                          <Button type="button" variant="ghost" size="sm" onClick={() => removeQuestion(qi, qqi)} className="text-red-400 mt-1">
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.answers.map((ans, ai) => (
                          <div key={ai} className={`flex items-center gap-2 p-2 rounded border ${ans.is_correct ? 'border-green-400 bg-green-50' : 'border-gray-200'}`}>
                            <input
                              type="radio"
                              name={`correct_${qi}_${qqi}`}
                              checked={ans.is_correct}
                              onChange={() => {
                                const u=[...quizzes];
                                u[qi].questions[qqi].answers.forEach((a,i) => a.is_correct = (i===ai));
                                setQuizzes(u);
                              }}
                              className="accent-green-500"
                            />
                            <Input
                              value={ans.answer_text}
                              onChange={(e) => { const u=[...quizzes]; u[qi].questions[qqi].answers[ai].answer_text=e.target.value; setQuizzes(u); }}
                              placeholder={`Đáp án ${String.fromCharCode(65+ai)}`}
                              className={`border-0 p-0 h-auto focus-visible:ring-0 text-sm ${ans.is_correct ? 'font-medium text-green-700' : ''}`}
                              disabled={loading}
                            />
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-gray-400 mt-1">☝️ Nhấn vào ô tròn để chọn đáp án đúng (màu xanh)</p>
                    </div>
                  ))}

                  <Button type="button" variant="ghost" size="sm" onClick={() => addQuestion(qi)} className="text-blue-500 hover:text-blue-700">
                    <Plus className="w-4 h-4 mr-1" /> Thêm câu hỏi
                  </Button>
                </div>
              ))}
            </div>
          </Card>

          {/* === NÚT LƯU === */}
          <div className="flex gap-3">
            <Button type="submit" disabled={loading} className="flex-1 h-12 text-base">
              {loading ? 'Đang cập nhật...' : '💾 Lưu tất cả thay đổi'}
            </Button>
            <Link href="/admin/dashboard" className="flex-1">
              <Button variant="outline" className="w-full h-12">Hủy</Button>
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}
