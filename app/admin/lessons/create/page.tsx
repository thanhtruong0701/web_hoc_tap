'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Plus, Trash2, FileText, HelpCircle, Upload, Loader2, Check, BookOpen } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Course { id: string; name: string; }
interface LessonFile { file_name: string; file_url: string; file_type: string; }
interface QuizAnswer { answer_text: string; is_correct: boolean; }
interface QuizQuestion { question_text: string; answers: QuizAnswer[]; }
interface Quiz { title: string; questions: QuizQuestion[]; }

const CLOUDINARY_CLOUD_NAME = 'dndqwxqlr';
const CLOUDINARY_UPLOAD_PRESET = 'learnhub_uploads';

export default function CreateLesson() {
  const router = useRouter();

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
  
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  useEffect(() => {
    async function fetchCourses() {
      try {
        const res = await fetch('/api/courses');
        if (res.ok) {
          const data = await res.json();
          setCourses(data.data || []);
        }
      } catch (err) {
        setError('Không thể kết nối đến máy chủ');
      } finally {
        setFetching(false);
      }
    }
    fetchCourses();
  }, []);

  // FILE HANDLERS
  const addFile = () => setFiles([...files, { file_name: '', file_url: '', file_type: 'pdf' }]);
  const removeFile = (i: number) => setFiles(files.filter((_, idx) => idx !== i));
  const updateFile = (i: number, field: keyof LessonFile, value: string) => {
    const updated = [...files];
    updated[i] = { ...updated[i], [field]: value };
    setFiles(updated);
  };

  const handleFileUpload = async (i: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingIndex(i);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Lỗi upload');

      const updatedFiles = [...files];
      updatedFiles[i] = {
        ...updatedFiles[i],
        file_name: updatedFiles[i].file_name || file.name,
        file_url: data.secure_url,
        file_type: file.type.includes('pdf') ? 'pdf' : 
                   file.type.includes('video') ? 'video' : 
                   file.type.includes('image') ? 'image' : 
                   file.type.includes('excel') || file.type.includes('spreadsheetml') ? 'document' : 'link'
      };
      setFiles(updatedFiles);
    } catch (err: any) {
      setError('Lỗi khi tải file lên: ' + err.message);
    } finally {
      setUploadingIndex(null);
    }
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

      const res = await fetch('/api/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId, title, content,
          files: files.filter(f => f.file_name.trim() && f.file_url.trim()),
          quizzes: quizzes.filter(q => q.title.trim())
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi từ máy chủ');

      setSuccess('Bài học đã được thêm thành công!');
      setTimeout(() => { router.push('/admin/dashboard'); }, 2000);
    } catch (err: any) {
      setError(err.message || 'Lỗi khi tạo bài học');
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
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
               <BookOpen className="w-5 h-5 text-blue-600" /> Thông tin bài học mới
            </h2>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề bài học</label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ví dụ: Bài 1 - Giới thiệu về động cơ" disabled={loading} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung bài học</label>
                <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Viết nội dung bài học chi tiết tại đây..." disabled={loading} rows={10} />
              </div>
            </div>
          </Card>

          {/* === PHẦN 2: TÀI LIỆU ĐÍNH KÈM === */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" /> Tài liệu đính kèm (PDF, Excel...)
              </h2>
              <Button type="button" variant="outline" size="sm" onClick={addFile} className="flex items-center gap-1">
                <Plus className="w-4 h-4" /> Thêm tài liệu
              </Button>
            </div>

            <div className="space-y-4">
              {files.map((file, i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-4 bg-gray-50 relative">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => removeFile(i)} 
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Tên hiển thị</label>
                        <Input value={file.file_name} onChange={(e) => updateFile(i, 'file_name', e.target.value)} placeholder="Ví dụ: Tài liệu học tập.pdf" disabled={loading} />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Loại</label>
                        <Select value={file.file_type} onValueChange={(val) => updateFile(i, 'file_type', val)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pdf">📄 PDF</SelectItem>
                            <SelectItem value="document">📝 Tài liệu (Excel, Word...)</SelectItem>
                            <SelectItem value="video">🎬 Video (MP4, YouTube...)</SelectItem>
                            <SelectItem value="image">🖼️ Hình ảnh</SelectItem>
                            <SelectItem value="link">🔗 Link khác</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Tải file từ máy tính</label>
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <Input 
                              type="file" 
                              className="hidden" 
                              id={`file-upload-create-${i}`}
                              onChange={(e) => handleFileUpload(i, e)}
                              disabled={uploadingIndex !== null}
                            />
                            <label 
                              htmlFor={`file-upload-create-${i}`}
                              className={`flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                                uploadingIndex === i ? 'bg-gray-100 border-gray-300' : 'bg-white border-blue-200 hover:border-blue-400 hover:bg-blue-50'
                              }`}
                            >
                              {uploadingIndex === i ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                                  <span className="text-sm font-medium text-blue-600">Đang tải...</span>
                                </>
                              ) : (
                                <>
                                  <Upload className="w-4 h-4 text-blue-600" />
                                  <span className="text-sm font-medium text-blue-600">Chọn file</span>
                                </>
                              )}
                            </label>
                          </div>
                          {file.file_url && (
                             <div className="flex items-center justify-center w-10 h-10 border border-green-200 bg-green-50 rounded-lg text-green-600">
                               <Check className="w-5 h-5" />
                             </div>
                           )}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Hoặc dán URL</label>
                        <Input value={file.file_url} onChange={(e) => updateFile(i, 'file_url', e.target.value)} placeholder="https://..." disabled={loading} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {files.length === 0 && (
                <p className="text-gray-400 text-sm text-center py-4 border-2 border-dashed rounded-lg">Chưa có tài liệu. Nhấn "Thêm tài liệu" để bắt đầu.</p>
              )}
            </div>
          </Card>

          {/* === PHẦN 3: QUIZ === */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-green-600" /> Câu hỏi trắc nghiệm (Quiz)
              </h2>
              <Button type="button" variant="outline" size="sm" onClick={addQuiz} className="flex items-center gap-1">
                <Plus className="w-4 h-4" /> Thêm bộ Quiz
              </Button>
            </div>

            <div className="space-y-6">
              {quizzes.map((quiz, qi) => (
                <div key={qi} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <Input
                      value={quiz.title}
                      onChange={(e) => { const u=[...quizzes]; u[qi].title=e.target.value; setQuizzes(u); }}
                      placeholder="Tên bộ Quiz (Ví dụ: Trắc nghiệm kiến thức cơ bản)"
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
                        <span className="text-sm font-semibold text-gray-600 mt-2">Câu {qqi+1}:</span>
                        <Textarea
                          value={q.question_text}
                          onChange={(e) => { const u=[...quizzes]; u[qi].questions[qqi].question_text=e.target.value; setQuizzes(u); }}
                          placeholder="Nhập nội dung câu hỏi..."
                          rows={2}
                          className="flex-1"
                          disabled={loading}
                        />
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeQuestion(qi, qqi)} className="text-red-400 mt-1">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.answers.map((ans, ai) => (
                          <div key={ai} className={`flex items-center gap-2 p-2 rounded border ${ans.is_correct ? 'border-green-400 bg-green-50' : 'border-gray-200'}`}>
                            <input
                              type="radio"
                              name={`correct_create_${qi}_${qqi}`}
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
                              className="border-0 p-0 h-auto focus-visible:ring-0 text-sm bg-transparent"
                              disabled={loading}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  <Button type="button" variant="ghost" size="sm" onClick={() => addQuestion(qi)} className="text-blue-500 hover:text-blue-700 text-xs mt-2">
                    <Plus className="w-3 h-3 mr-1" /> Thêm câu hỏi cho bộ này
                  </Button>
                </div>
              ))}
              {quizzes.length === 0 && (
                <p className="text-gray-400 text-sm text-center py-4 border-2 border-dashed rounded-lg">Chưa có Quiz. Nhấn "Thêm bộ Quiz" để tạo trắc nghiệm.</p>
              )}
            </div>
          </Card>

          {/* === NÚT LƯU === */}
          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={loading || uploadingIndex !== null} className="flex-1 h-12 text-lg font-bold shadow-lg">
              {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
              {loading ? 'Đang lưu bài học...' : '🚀 Tạo bài học mới'}
            </Button>
            <Link href="/admin/dashboard" className="flex-1">
              <Button variant="outline" className="w-full h-12 text-lg">Hủy</Button>
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}
