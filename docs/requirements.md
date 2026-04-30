# Phân tích yêu cầu

## 1. Bối cảnh

Sau đại dịch COVID-19, nhu cầu học online tăng cao nhưng nhiều tổ chức vẫn phải dùng nhiều công cụ rời rạc (Zoom, Google Drive, Email). Dự án xây dựng một nền tảng LMS tích hợp hoàn chỉnh, cho phép học viên, giảng viên và quản trị viên vận hành trong cùng một hệ thống.

---

## 2. Các bên liên quan (Stakeholders)

| Vai trò | Mô tả |
|---------|-------|
| **Student** | Học viên đăng ký và học các khóa học |
| **Instructor** | Giảng viên tạo nội dung và quản lý khóa học |
| **Admin** | Quản trị viên vận hành hệ thống |

---

## 3. Yêu cầu chức năng

### 3.1 Học viên

| ID | Tính năng | Mô tả |
|----|-----------|-------|
| S01 | Tìm kiếm khóa học | Tìm theo tên, mô tả, giảng viên, danh mục. Lọc theo category |
| S02 | Đăng ký khóa học | Đăng ký miễn phí. Không thể đăng ký trùng |
| S03 | Xem nội dung bài học | Xem tiêu đề, nội dung text của từng lesson |
| S04 | Theo dõi tiến độ | % hoàn thành = trung bình tiến độ các lesson. Đánh dấu bài đã học (100%) |
| S05 | Làm quiz | Làm bài trắc nghiệm gắn với lesson, xem kết quả |
| S06 | Nộp assignment | Upload file đính kèm + ghi chú, gắn với lesson |
| S07 | Thảo luận bài học | Đăng và xem bình luận theo từng lesson |
| S08 | Đánh giá khóa học | Rating 1-5 sao kèm comment. Mỗi user chỉ đánh giá 1 lần |
| S09 | Nhận certificate | Tải chứng chỉ (PDF hoặc PNG) khi hoàn thành 100% tất cả lesson |
| S10 | Nhận thông báo | Nhận thông báo broadcast từ admin, xem và đánh dấu đã đọc |

### 3.2 Giảng viên

| ID | Tính năng | Mô tả |
|----|-----------|-------|
| I01 | Quản lý khóa học | Tạo, cập nhật, xóa khóa học của bản thân (không xóa được nếu có enrollment) |
| I02 | Quản lý bài học | Thêm, sửa, xóa lesson trong khóa học. Lesson có tiêu đề + nội dung text |
| I03 | Submit duyệt | Submit khóa học DRAFT/REJECTED lên PENDING_REVIEW để admin duyệt |
| I04 | Xem học viên | Xem danh sách học viên đã đăng ký mỗi khóa học |
| I05 | Chấm assignment | Xem tất cả bài nộp, chấm điểm (0-100) + feedback |
| I06 | Trả lời thảo luận | Đăng bình luận vào thảo luận lesson của khóa học mình |
| I07 | Analytics | Xem tổng số khóa học, số published, tổng enrollment |
| I08 | Nhận thông báo | Nhận thông báo broadcast như học viên |

### 3.3 Quản trị viên

| ID | Tính năng | Mô tả |
|----|-----------|-------|
| A01 | Duyệt khóa học | Xem danh sách PENDING_REVIEW, duyệt (PUBLISHED) hoặc từ chối (kèm lý do) |
| A02 | Quản lý users | Xem, tạo, cập nhật tên, đổi role, vô hiệu hóa (soft delete) |
| A03 | Quản lý categories | Tạo, cập nhật, xóa danh mục khóa học |
| A04 | Báo cáo hệ thống | Xem tổng: users, instructors, courses, published courses, enrollments, categories |
| A05 | Broadcast notification | Gửi thông báo tới toàn bộ user đang active |

---

## 4. Yêu cầu phi chức năng

| Yêu cầu | Chi tiết |
|---------|---------|
| Bảo mật | JWT stateless, blacklist token khi logout, BCrypt hash password |
| Phân quyền | RBAC: STUDENT / INSTRUCTOR / ADMIN. Kiểm tra quyền theo từng endpoint |
| Upload file | Avatar: Cloudinary. Assignment: lưu file path trên server |
| Certificate | Sinh tự động bằng OpenPDF (PDF) hoặc Java 2D (PNG) |
| Soft delete | Tất cả entity có cột `is_active`, xóa = đánh dấu false |
| Audit | Tất cả entity có `created_at`, `updated_at` tự động |

---

## 5. Luồng trạng thái khóa học

```
DRAFT → PENDING_REVIEW → PUBLISHED
                      ↘ REJECTED → DRAFT (instructor sửa rồi submit lại)
```
