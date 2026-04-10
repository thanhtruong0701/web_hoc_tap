# LearnHub - Nền tảng học tập trực tuyến

Một ứng dụng web học tập hiện đại với admin dashboard toàn diện.

## Tính năng chính

### Trang công khai
- **Trang chủ**: Hiển thị thống kê thực (số mục, bài viết, lượt xem, người online)
- **Danh sách mục**: Menu chia nhanh học tập phân loại theo từng phần
- **Khóa học**: Danh sách các khóa học trong mỗi mục
- **Bài học**: Chi tiết nội dung, tài nguyên, và quiz

### Admin Dashboard
- **Thống kê real-time**: 
  - Số lượng mục học tập
  - Số lượng bài viết
  - Tổng lượt xem
  - Số người đang online (cập nhật mỗi 5 phút)
  - Bài học được xem nhiều nhất
- **Quản lý nội dung**: Thêm, chỉnh sửa, xóa mục, khóa, bài học
- **Biểu đồ thống kê**: Biểu đồ cột, tròn hiển thị dữ liệu trực quan
- **Quản lý tài nguyên**: Upload PDF, Word, Video

## Cấu trúc dự án

```
app/
├── page.tsx                 # Trang chủ
├── categories/[id]/         # Trang danh sách mục
├── courses/[id]/            # Trang danh sách khóa
├── lessons/[id]/            # Trang chi tiết bài
├── admin/
│   ├── page.tsx            # Đăng nhập admin
│   ├── dashboard/          # Admin dashboard
│   ├── categories/create/  # Tạo mục mới
│   ├── courses/create/     # Tạo khóa mới
│   └── lessons/create/     # Tạo bài mới
└── api/
    ├── categories/         # API danh mục
    ├── courses/            # API khóa học
    ├── lessons/            # API bài học
    └── stats/              # API thống kê

lib/
└── db.ts                    # Database utilities

scripts/
├── 001_create_schema.sql   # Tạo bảng database
└── 002_seed_demo_data.sql  # Dữ liệu demo
```

## Cách sử dụng

### 1. Đăng nhập Admin
- Truy cập: `/admin`
- Mật khẩu: `Truongvu2007` (demo)

### 2. Dashboard
- Xem thống kê toàn bộ nền tảng
- Biểu đồ thống kê tự động cập nhật mỗi 5 giây
- Bảng xếp hạng bài học được xem nhiều nhất

### 3. Quản lý nội dung
Trong admin, bạn có thể:

#### Thêm mục học tập
- Điền tên mục (ví dụ: "Toán học", "Tiếng Anh")
- Thêm mô tả chi tiết
- Lưu

#### Thêm khóa học
- Chọn mục học tập
- Điền tên khóa
- Thêm mô tả
- Lưu

#### Thêm bài học
- Chọn khóa học
- Điền tiêu đề bài
- Viết nội dung chi tiết
- Upload tài nguyên (PDF, Word, Video)
- Thêm câu hỏi quiz
- Lưu

## Database Schema

### Categories (Mục)
```sql
- id: UUID
- title: String
- description: Text
- order_index: Integer
- created_at: Timestamp
```

### Courses (Khóa học)
```sql
- id: UUID
- title: String
- description: Text
- category_id: FK
- created_at: Timestamp
```

### Lessons (Bài học)
```sql
- id: UUID
- title: String
- description: Text
- content: Text
- course_id: FK
- order_index: Integer
- created_at: Timestamp
```

### Files (Tài nguyên)
```sql
- id: UUID
- filename: String
- file_type: String
- file_url: String
- lesson_id: FK
- created_at: Timestamp
```

### Quizzes (Câu hỏi)
```sql
- id: UUID
- question: String
- option_a, b, c, d: String
- correct_answer: String
- lesson_id: FK
- order_index: Integer
```

### PageViews (Theo dõi lượt xem)
```sql
- id: UUID
- lesson_id: FK
- ip_address: String
- view_count: Integer
- last_viewed_at: Timestamp
```

### UserSessions (Phiên người dùng)
```sql
- id: UUID
- session_id: String
- ip_address: String
- last_activity_at: Timestamp
- created_at: Timestamp
```

## API Endpoints

### Public API
- `GET /api/categories` - Danh sách mục
- `GET /api/courses?categoryId=...` - Khóa học theo mục
- `GET /api/lessons?courseId=...` - Bài học theo khóa
- `GET /api/lessons?lessonId=...` - Chi tiết bài học + theo dõi view
- `GET /api/stats` - Thống kê toàn bộ

## Thống kê

### Real-time Tracking
- **Lượt xem**: Theo dõi bằng IP address
- **Người online**: Dựa vào session activity trong 5 phút gần nhất
- **Tự động cập nhật**: Dashboard cập nhật mỗi 5 giây

### Dữ liệu Demo
- 3 mục: Toán học, Khoa học, Tiếng Anh
- 6 khóa học (2 khóa per mục)
- 12 bài học (2 bài per khóa)
- 8 câu hỏi quiz
- 50 lượt xem mẫu

## Phát triển tiếp theo

Sau khi tạo scaffold này, bạn có thể:

1. **Thêm authentication người dùng**: Đăng nhập, theo dõi tiến độ
2. **Lưu trữ files**: Integrate với Vercel Blob hoặc S3
3. **Cải thiện admin**: Cho phép edit/delete nội dung
4. **Certificates**: Cấp chứng chỉ sau hoàn thành khóa
5. **Comments**: Cho phép người dùng thảo luận
6. **Mobile app**: Phát triển mobile version

## Ghi chú

- Database: Neon PostgreSQL (Serverless)
- Framework: Next.js 16 + React 19
- UI: shadcn/ui + Tailwind CSS
- Charts: Recharts
- Icons: Lucide React

## Hỗ trợ

Nếu gặp vấn đề, hãy kiểm tra:
1. Database connection (env variables)
2. Neon dashboard
3. Console logs trong preview
4. API responses trong Network tab

---

**Chúc bạn thành công với dự án!** 🚀
