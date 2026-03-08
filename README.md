# Tên dự án

## Mô tả
Bối cảnh: Sau đại dịch COVID-19, nhu cầu học online tăng cao nhưng nhiều tổ chức chưa có platform phù hợp, phải dùng nhiều công cụ rời rạc (Zoom, Drive, Email).
Giải pháp: Xây dựng LMS cho phép học viên đăng ký khóa học, xem video bài giảng, làm quiz/assignment, theo dõi tiến độ và nhận certificate. Giảng viên tạo khóa học, tạo quiz, chấm bài và xem analytics.
Ðiểm thú vị: Certificate tự động khi hoàn thành, đánh giá khóa học, analytics cho giảng viên, duyệt khóa học.
## Thành viên nhóm
| MSSV | Họ tên | Vai trò |
|------|--------|---------|
| 2251052040| Phạm Hữu Hưng | Nhóm trưởng |
| 2251052051| Đỗ Duy Quốc Khánh | Thành viên |
| 2251052049| Nguyễn Duy Khang | Thành viên |
## Công nghệ sử dụng
- Backend: Spring Boot
- Frontend: React
- Database: MySQL
## Cài đặt và chạy
### Yêu cầu
- Java 21+
- Node.js 18+ (nếu dùng React)
- MySQL
### Chạy Backend
cd backend
./mvnw spring-boot:run
### Chạy Frontend (nếu dùng React)
cd frontend
npm install
npm start
### Truy cập
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080
## Demo
[Link video demo hoặc screenshots]
## Tài liệu
- [Phân tích yêu cầu](docs/requirements.md)
- [Database Design](docs/database-design.md)
- [API Documentation](docs/api-docs.md) 