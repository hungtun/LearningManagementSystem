# API Documentation

> **Base URL:** `http://localhost:8090`  
> **Auth:** Bearer JWT — thêm header `Authorization: Bearer <token>` cho tất cả endpoint cần xác thực.  
> **Swagger UI:** `http://localhost:8090/swagger-ui/index.html`

---

## Response format

Hầu hết endpoint trả về envelope:
```json
{ "message": "SUCCESS", "data": { ... } }
```
Một số endpoint trả trực tiếp (không bọc `data`): `GET /api/courses`, `GET /api/courses/{id}`, `GET /api/courses/lessons/{id}`.

---

## 1. Auth

### POST `/api/auth/login`
Đăng nhập, nhận JWT token.

**Body:**
```json
{ "email": "string", "password": "string" }
```
**Response:**
```json
{
  "token": "eyJ...",
  "user": { "id": 1, "email": "...", "fullName": "...", "avatarUrl": "...", "roles": ["STUDENT"] }
}
```

---

### POST `/api/auth/register`
Đăng ký tài khoản mới (role STUDENT mặc định).

**Body:**
```json
{ "email": "string", "password": "string", "fullName": "string" }
```

---

### GET `/api/auth/logout` 🔒
Blacklist token hiện tại.

---

## 2. Users

### GET `/api/users/me` 🔒
Lấy thông tin user hiện tại.

### PUT `/api/users/me` 🔒
Cập nhật thông tin cá nhân.
```json
{ "fullName": "string", "avatarUrl": "string" }
```

### POST `/api/users/me/avatar` 🔒
Upload ảnh đại diện (multipart `file`).

---

## 3. Courses (Public)

### GET `/api/courses` 🔒
Danh sách khóa học PUBLISHED.

**Response:** `CourseSummaryResponse[]`
```json
[{ "id": 1, "title": "...", "description": "...", "categoryName": "...", "instructorName": "...", "instructorAvatarUrl": "...", "publicationStatus": "PUBLISHED" }]
```

### GET `/api/courses/{id}` 🔒
Chi tiết khóa học + danh sách lesson outline.

```json
{ "id": 1, "title": "...", "lessons": [{ "id": 10, "title": "...", "orderIndex": 0 }] }
```

### GET `/api/courses/my` 🔒 *(Instructor)*
Danh sách khóa học của giảng viên đang đăng nhập (mọi trạng thái).

### GET `/api/courses/lessons/{lessonId}` 🔒
Nội dung chi tiết 1 lesson.

```json
{ "id": 10, "courseId": 1, "title": "...", "content": "...", "orderIndex": 0 }
```

### POST `/api/courses` 🔒 *(Instructor/Admin)*
Tạo khóa học mới.
```json
{ "title": "string", "description": "string", "categoryId": 1, "instructorId": 1, "submitForReview": false }
```

### PUT `/api/courses/{id}` 🔒 *(Instructor/Admin)*
Cập nhật khóa học. `submitForReview: true` sẽ đổi trạng thái sang PENDING_REVIEW.

### DELETE `/api/courses/{id}` 🔒 *(Instructor/Admin)*
Xóa khóa học (không được có enrollment).

### POST `/api/courses/{id}/lessons` 🔒 *(Instructor/Admin)*
Thêm lesson vào khóa học.
```json
{ "title": "string", "content": "string" }
```

### PUT `/api/courses/lessons/{lessonId}` 🔒
Cập nhật lesson.

### DELETE `/api/courses/lessons/{lessonId}` 🔒
Xóa lesson.

### PATCH `/api/courses/lessons/{lessonId}/reorder` 🔒
Đổi thứ tự lesson.
```json
{ "position": 2 }
```

---

## 4. Admin — Courses

### GET `/api/admin/courses/pending` 🔒 *(Admin)*
Danh sách khóa học đang chờ duyệt (PENDING_REVIEW).

### PATCH `/api/admin/courses/{id}/status` 🔒 *(Admin)*
Duyệt hoặc từ chối khóa học.
```json
{ "status": "PUBLISHED" }
// hoặc
{ "status": "REJECTED", "reason": "Nội dung chưa đầy đủ" }
```

---

## 5. Enrollments

### POST `/api/enrollments` 🔒
Đăng ký khóa học.
```json
{ "courseId": 1 }
```

### GET `/api/enrollments/my-courses` 🔒
Danh sách khóa học đã đăng ký.
```json
[{ "enrollmentId": 5, "courseId": 1, "courseTitle": "...", "status": "ACTIVE", "enrolledAt": "..." }]
```

### GET `/api/enrollments/course/{courseId}/students` 🔒 *(Instructor/Admin)*
Danh sách học viên của 1 khóa học.

### GET `/api/enrollments/stats` 🔒
Thống kê số enrollment theo ngày. Query params: `from`, `to` (ISO date).

---

## 6. Learnings

### PATCH `/api/learnings/video` 🔒
Cập nhật tiến độ bài học.
```json
{ "lessonId": 10, "progressPercent": 100 }
```
**Response:** `{ "lessonId": 10, "progressPercent": 100, "status": "COMPLETED", "completedAt": "..." }`

### GET `/api/learnings/course/{courseId}/progress` 🔒
Tiến độ tổng khóa học.
```json
{ "courseId": 1, "completionPercent": 66.7, "completedLessons": 2, "totalLessons": 3 }
```

### GET `/api/learnings/course/{courseId}/lesson-progress` 🔒
Tiến độ từng lesson trong khóa học.
```json
[{ "lessonId": 10, "progressPercent": 100, "status": "COMPLETED" }]
```

### POST `/api/learnings/discussions` 🔒
Đăng bình luận.
```json
{ "lessonId": 10, "content": "string" }
```

### GET `/api/learnings/discussions/{lessonId}` 🔒
Danh sách bình luận của 1 lesson.

### POST `/api/learnings/reviews` 🔒
Đánh giá khóa học (1 lần/user/course).
```json
{ "courseId": 1, "rating": 5, "comment": "Rất hay!" }
```

### GET `/api/learnings/certificate/{courseId}` 🔒
Tải certificate. Query param `format=pdf` (mặc định) hoặc `format=png`.
Response: binary file với header `Content-Disposition: attachment`.

---

## 7. Assessments

### GET `/api/assessments/quiz/{id}` 🔒
Lấy quiz + câu hỏi (không có đáp án đúng).

### POST `/api/assessments/quiz/submit` 🔒
Nộp bài quiz.
```json
{ "quizId": 1, "answers": [{ "questionId": 5, "selectedOption": "B" }] }
```

### POST `/api/assessments/assignments/submit` 🔒 *(multipart)*
Nộp assignment. Fields: `lessonId`, `file`, `note` (optional).

### GET `/api/assessments/instructor/submissions` 🔒 *(Instructor)*
Xem tất cả bài nộp của khóa học mình.

### PATCH `/api/assessments/instructor/grade` 🔒 *(Instructor)*
Chấm điểm bài nộp.
```json
{ "submissionId": 3, "submissionType": "ASSIGNMENT", "score": 85, "feedback": "Tốt!" }
```

---

## 8. System

### GET `/api/system/categories`
Danh sách categories (public).

### GET `/api/system/analytics/instructor` 🔒 *(Instructor)*
```json
{ "totalCourses": 5, "publishedCourses": 3, "totalEnrollments": 120 }
```

### GET `/api/system/analytics/admin` 🔒 *(Admin)*
```json
{ "totalUsers": 50, "totalInstructors": 5, "totalCourses": 20, "publishedCourses": 15, "totalEnrollments": 300, "totalCategories": 8 }
```

### GET `/api/system/notifications` 🔒
Danh sách thông báo của user hiện tại.
```json
[{ "id": 1, "title": "...", "content": "...", "read": false, "createdAt": "..." }]
```

### PATCH `/api/system/notifications/read-all` 🔒
Đánh dấu tất cả thông báo của user là đã đọc.

---

## 9. Admin — System

### POST `/api/admin/system/categories` 🔒 *(Admin)*
Tạo category. `{ "name": "...", "description": "..." }`

### PUT `/api/admin/system/categories/{id}` 🔒 *(Admin)*
Cập nhật category.

### DELETE `/api/admin/system/categories/{id}` 🔒 *(Admin)*
Xóa category (soft delete).

### POST `/api/admin/system/notifications/broadcast` 🔒 *(Admin)*
Gửi thông báo tới tất cả user active.
```json
{ "title": "string", "content": "string" }
```

---

## 10. Admin — Users

### GET `/api/admin/users` 🔒 *(Admin)*
Danh sách tất cả users.

### POST `/api/admin/users` 🔒 *(Admin)*
Tạo user.
```json
{ "email": "...", "password": "...", "fullName": "...", "roleName": "INSTRUCTOR" }
```

### PUT `/api/admin/users/{id}` 🔒 *(Admin)*
Cập nhật tên user. `{ "fullName": "..." }`

### PATCH `/api/admin/users/{id}/role` 🔒 *(Admin)*
Đổi role. `{ "roleName": "INSTRUCTOR" }`

### DELETE `/api/admin/users/{id}` 🔒 *(Admin)*
Vô hiệu hóa user (soft delete).

---

## Error Responses

```json
{ "message": "Error description", "errors": { "field": "detail" } }
```

| HTTP | Ý nghĩa |
|------|---------|
| 400 | Dữ liệu không hợp lệ |
| 401 | Chưa đăng nhập / token hết hạn |
| 403 | Không có quyền |
| 404 | Không tìm thấy |
| 409 | Xung đột (đã tồn tại, đã đánh giá...) |
| 422 | Lỗi nghiệp vụ (khóa học chưa hoàn thành...) |
