# Database Design

> **Database:** MySQL (TiDB Cloud)  
> **Convention:** Tất cả bảng kế thừa `BaseEntity` gồm: `id` (PK, AUTO_INCREMENT), `is_active` (BOOLEAN DEFAULT true), `created_at`, `updated_at`.

---

## Sơ đồ quan hệ (tóm tắt)

```
users ──< user_roles >── roles

categories ──< courses >── users (instructor)
courses ──< lessons
courses ──< enrollments >── users
courses ──< course_reviews >── users

lessons ──< lesson_progress >── users
lessons ──< lesson_discussions >── users
lessons ──< assessment_quizzes ──< assessment_quiz_questions
assessment_quiz_questions ──< assessment_question_options
assessment_quizzes ──< assessment_quiz_submissions >── users
assessment_quiz_submissions ──< assessment_quiz_submission_answers

lessons ──< assignment_submissions >── users (student + graded_by)

users ──< user_notifications
blacklisted_tokens
```

---

## Mô tả chi tiết các bảng

### users
| Cột | Kiểu | Ghi chú |
|-----|------|---------|
| id | BIGINT PK | |
| email | VARCHAR UNIQUE NOT NULL | |
| password_hash | VARCHAR NOT NULL | BCrypt |
| full_name | VARCHAR NOT NULL | |
| avatar_url | VARCHAR(2048) | Cloudinary URL |
| is_active | BOOLEAN DEFAULT true | |
| created_at | DATETIME | |
| updated_at | DATETIME | |

### roles
| Cột | Kiểu | Ghi chú |
|-----|------|---------|
| id | BIGINT PK | |
| name | VARCHAR | STUDENT / INSTRUCTOR / ADMIN |

### user_roles *(bảng trung gian)*
| Cột | Kiểu |
|-----|------|
| user_id | FK → users |
| role_id | FK → roles |

### blacklisted_tokens
| Cột | Kiểu | Ghi chú |
|-----|------|---------|
| id | BIGINT PK | |
| token | TEXT NOT NULL | JWT đã logout |
| created_at | DATETIME | |

---

### categories
| Cột | Kiểu | Ghi chú |
|-----|------|---------|
| id | BIGINT PK | |
| name | VARCHAR UNIQUE NOT NULL | |
| description | TEXT | |
| is_active | BOOLEAN | |

### courses
| Cột | Kiểu | Ghi chú |
|-----|------|---------|
| id | BIGINT PK | |
| title | VARCHAR(500) NOT NULL | |
| description | TEXT | |
| category_id | FK → categories | |
| instructor_id | FK → users | |
| publication_status | ENUM | DRAFT / PENDING_REVIEW / PUBLISHED / REJECTED |
| rejection_reason | TEXT | Lý do từ chối khi REJECTED |
| is_active | BOOLEAN | |

### lessons
| Cột | Kiểu | Ghi chú |
|-----|------|---------|
| id | BIGINT PK | |
| course_id | FK → courses | |
| title | VARCHAR(500) NOT NULL | |
| content | TEXT | Nội dung bài học |
| order_index | INT NOT NULL | Thứ tự trong khóa học |
| is_active | BOOLEAN | |

---

### enrollments
| Cột | Kiểu | Ghi chú |
|-----|------|---------|
| id | BIGINT PK | |
| user_id | FK → users | |
| course_id | FK → courses | |
| status | ENUM | ACTIVE / COMPLETED |
| enrolled_at | DATETIME | |
| **UK** | (user_id, course_id) | Mỗi user chỉ đăng ký 1 lần |

### lesson_progress
| Cột | Kiểu | Ghi chú |
|-----|------|---------|
| id | BIGINT PK | |
| user_id | FK → users | |
| lesson_id | FK → lessons | |
| status | ENUM | NOT_STARTED / IN_PROGRESS / COMPLETED |
| progress_percent | INT DEFAULT 0 | 0 – 100 |
| completed_at | DATETIME | NULL nếu chưa xong |
| **UK** | (user_id, lesson_id) | |

---

### lesson_discussions
| Cột | Kiểu | Ghi chú |
|-----|------|---------|
| id | BIGINT PK | |
| user_id | FK → users | |
| lesson_id | FK → lessons | |
| content | TEXT NOT NULL | |
| is_active | BOOLEAN | |

### course_reviews
| Cột | Kiểu | Ghi chú |
|-----|------|---------|
| id | BIGINT PK | |
| user_id | FK → users | |
| course_id | FK → courses | |
| rating | INT NOT NULL | 1 – 5 |
| comment | TEXT | |
| **UK** | (user_id, course_id) | Mỗi user chỉ đánh giá 1 lần |

---

### assessment_quizzes
| Cột | Kiểu | Ghi chú |
|-----|------|---------|
| id | BIGINT PK | |
| lesson_id | FK → lessons | |
| title | VARCHAR NOT NULL | |
| description | TEXT | |
| pass_score | INT DEFAULT 0 | Điểm đạt |

### assessment_quiz_questions
| Cột | Kiểu | Ghi chú |
|-----|------|---------|
| id | BIGINT PK | |
| quiz_id | FK → assessment_quizzes | |
| question_text | TEXT NOT NULL | |
| option_a / b / c / d | VARCHAR | 4 đáp án |
| correct_option | CHAR | 'A' / 'B' / 'C' / 'D' |

### assessment_quiz_submissions
| Cột | Kiểu | Ghi chú |
|-----|------|---------|
| id | BIGINT PK | |
| quiz_id | FK → assessment_quizzes | |
| student_id | FK → users | |
| score | INT | Điểm đạt được |
| passed | BOOLEAN | |
| submitted_at | DATETIME | |

### assessment_quiz_submission_answers
| Cột | Kiểu | Ghi chú |
|-----|------|---------|
| id | BIGINT PK | |
| submission_id | FK → assessment_quiz_submissions | |
| question_id | FK → assessment_quiz_questions | |
| selected_option | CHAR | Đáp án học viên chọn |

### assignment_submissions
| Cột | Kiểu | Ghi chú |
|-----|------|---------|
| id | BIGINT PK | |
| lesson_id | FK → lessons | |
| student_id | FK → users | |
| file_path | VARCHAR NOT NULL | Đường dẫn file đã upload |
| original_filename | VARCHAR NOT NULL | Tên file gốc |
| note | TEXT | Ghi chú của học viên |
| score | INT | Điểm (null nếu chưa chấm) |
| feedback | TEXT | Nhận xét của giảng viên |
| graded_by | FK → users | Giảng viên chấm |
| graded_at | DATETIME | |
| submitted_at | DATETIME | |

---

### user_notifications
| Cột | Kiểu | Ghi chú |
|-----|------|---------|
| id | BIGINT PK | |
| user_id | FK → users | Người nhận |
| title | VARCHAR NOT NULL | |
| content | TEXT NOT NULL | |
| is_read | BOOLEAN DEFAULT false | Riêng theo từng user |
| is_active | BOOLEAN | |
| created_at | DATETIME | |
