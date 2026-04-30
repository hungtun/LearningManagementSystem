# Learning Management System (LMS)

## Mô tả

Sau đại dịch COVID-19, nhu cầu học online tăng cao nhưng nhiều tổ chức vẫn phải dùng nhiều công cụ rời rạc. Dự án này xây dựng một nền tảng LMS hoàn chỉnh cho phép học viên, giảng viên và quản trị viên tương tác trong cùng một hệ thống.

## Thành viên nhóm

| MSSV | Họ tên | Vai trò |
|------|--------|---------|
| 2251052040 | Phạm Hữu Hưng | Nhóm trưởng |
| 2251052051 | Đỗ Duy Quốc Khánh | Thành viên |
| 2251052049 | Nguyễn Duy Khang | Thành viên |

## Tính năng

### Học viên
- Tìm kiếm và đăng ký khóa học (miễn phí)
- Xem nội dung bài học, theo dõi tiến độ từng bài
- Làm quiz / nộp assignment
- Theo dõi % hoàn thành khóa học
- Tải certificate PDF/PNG khi hoàn thành 100%
- Đánh giá khóa học (rating + comment)
- Thảo luận bình luận theo từng bài học

### Giảng viên
- Tạo, chỉnh sửa, xóa khóa học và bài học
- Submit khóa học để admin duyệt
- Xem danh sách học viên đã đăng ký
- Chấm điểm assignment (score + feedback)
- Trả lời thảo luận bài học
- Xem analytics (tổng khóa học, enrollments)
- Nhận thông báo hệ thống

### Quản trị viên
- Duyệt / từ chối khóa học mới (kèm lý do từ chối)
- Quản lý users: tạo, cập nhật, đổi role, vô hiệu hóa
- Quản lý categories (CRUD)
- Xem báo cáo hệ thống (users, courses, enrollments)
- Gửi broadcast notification tới toàn bộ người dùng

## Công nghệ sử dụng

| Layer | Công nghệ |
|-------|-----------|
| Backend | Spring Boot 4.x, Spring Security, Spring Data JPA |
| Frontend | React 18, Vite |
| Database | MySQL (TiDB Cloud) |
| Auth | JWT (JJWT), BCrypt |
| Storage | Cloudinary (avatar upload) |
| Certificate | OpenPDF, Java 2D (PNG) |

## Kiến trúc

```
LMS_React/          # Frontend (React + Vite)
├── src/
│   ├── api/        # API client functions
│   ├── hooks/      # Custom hooks (notification polling...)
│   └── pages/      # DashboardPage, InstructorDashboard, AdminDashboard...

LMS_Spring/         # Backend (Spring Boot)
└── src/main/java/com/ou/LMS_Spring/
    ├── modules/
    │   ├── users/          # Auth, User CRUD
    │   ├── courses/        # Course & Lesson CRUD
    │   ├── enrollments/    # Enrollment, progress stats
    │   ├── learnings/      # Lesson progress, discussion, review, certificate
    │   ├── assessments/    # Quiz, Assignment submit/grade
    │   └── system/         # Categories, Analytics, Notifications
    └── Entities/           # JPA entities
```

## Cài đặt và chạy

### Yêu cầu
- Java 21+
- Node.js 18+
- MySQL 8+ (hoặc TiDB)

### Chạy Backend

```bash
cd LMS_Spring
./mvnw spring-boot:run
```

Backend chạy tại: `http://localhost:8090`

### Chạy Frontend

```bash
cd LMS_React
npm install
npm run dev
```

Frontend chạy tại: `http://localhost:5173`

### Tài khoản mặc định (seed data)

| Email | Password | Role |
|-------|----------|------|
| admin@lms.local | 123456 | ADMIN |
| instructor@lms.local | 123456 | INSTRUCTOR |
| student1@lms.local | 123456 | STUDENT |
| student2@lms.local | 123456 | STUDENT |

## API

Swagger UI: `http://localhost:8090/swagger-ui/index.html`

Các nhóm endpoint chính:

| Prefix | Mô tả |
|--------|-------|
| `POST /api/auth/login` | Đăng nhập |
| `POST /api/auth/register` | Đăng ký |
| `GET /api/courses` | Danh sách khóa học public |
| `GET /api/enrollments/my-courses` | Khóa học đã đăng ký |
| `GET /api/learnings/course/{id}/progress` | Tiến độ khóa học |
| `GET /api/learnings/certificate/{id}` | Tải certificate |
| `GET /api/assessments/quiz/{id}` | Lấy quiz |
| `POST /api/assessments/assignments/submit` | Nộp assignment |
| `GET /api/system/notifications` | Thông báo của user |
| `GET /api/admin/courses/pending` | Duyệt khóa học (Admin) |

## Tài liệu

- [Phân tích yêu cầu](docs/requirements.md)
- [Database Design](docs/database-design.md)
- [API Documentation](docs/api-docs.md)
