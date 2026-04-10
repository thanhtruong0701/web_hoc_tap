# 🚀 Hướng dẫn Triển khai LearnHub lên Vercel

Chúc mừng bạn! Mã nguồn đã được đẩy lên GitHub thành công. Bây giờ chỉ còn vài bước nữa để trang web của bạn chạy thật trên Internet.

## Bước 1: Kết nối Vercel với GitHub
1. Truy cập [Vercel.com](https://vercel.com) và đăng nhập bằng GitHub.
2. Bấm **"Add New"** -> **"Project"**.
3. Tìm kho lưu trữ `web_hoc_tap` và bấm **"Import"**.

---

## Bước 2: Tạo Cơ sở dữ liệu (Neon Postgres)
Mặc dù tôi đã cấu hình code, nhưng bạn cần một "máy chủ" SQL thật trên Vercel:
1. Tại màn hình cấu hình Project trên Vercel, nhìn lên thanh menu chọn tab **"Storage"**.
2. Chọn **"Postgres"** -> **"Create"**.
3. Làm theo các bước đồng ý điều khoản cho đến khi nó hiện chữ **"Connected"** vào Project của bạn. 
   *(Vercel sẽ tự động thêm biến `POSTGRES_URL` vào máy cho bạn).*

---

## Bước 3: Cấu hình Biến môi trường (Environment Variables)
Đây là phần quan trọng nhất để Đăng nhập Google hoạt động. Bạn vào **Settings** -> **Environment Variables** và dán 3 mục sau:

| Tên Biến | Giá trị |
| :--- | :--- |
| `NEXTAUTH_SECRET` | Gõ một chuỗi bất kỳ dài khoảng 32 ký tự (Ví dụ: `nguyentraihoclieuvipvn2024`) |
| `GOOGLE_CLIENT_ID` | Copy cái mã ID bạn lấy từ Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | Copy cái mã Secret bạn lấy từ Google Cloud Console |
| `NEXTAUTH_URL` | Dán địa chỉ web Vercel của bạn (Ví dụ: `https://web-hoc-tap.vercel.app`) |

> [!IMPORTANT]
> **Đừng quên:** Bạn phải quay lại [Google Cloud Credentials](https://console.cloud.google.com/apis/credentials) và thêm địa chỉ web Vercel của bạn vào mục **"Authorized redirect URIs"** như sau:
> `https://ten-mien-cua-ban.vercel.app/api/auth/callback/google`

---

## Bước 4: Chạy tập lệnh tạo Bảng (Database Schema)
Sau khi web đã "Deployed", bạn vào mục **Storage** -> **Postgres** -> **Console** trên Vercel và dán nội dung file `scripts/001_create_schema.sql` để tạo các bảng dữ liệu.

**Bây giờ bạn có thể tận hưởng thành quả của mình!**
