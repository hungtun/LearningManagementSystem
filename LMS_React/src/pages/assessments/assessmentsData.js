// Mock data for Assessments module

export const MOCK_QUIZZES = [
  {
    id: 101,
    quizId: 101,
    lessonId: 12,
    courseId: 1,
    courseTitle: 'Java Spring Boot Cơ bản',
    title: 'Quiz Chương 1 - REST API',
    description: 'Kiểm tra kiến thức về REST API với Spring Boot.',
    passScore: 60,
    duration: 20,
    status: 'PUBLISHED',
    questions: [
      {
        questionId: 1001,
        questionText: '@RestController trong Spring Boot có chức năng gì?',
        optionA: 'Định nghĩa một component thông thường',
        optionB: 'Kết hợp @Controller và @ResponseBody, xử lý REST API',
        optionC: 'Chỉ dùng để inject dependency',
        optionD: 'Dùng để cấu hình database',
      },
      {
        questionId: 1002,
        questionText: 'HTTP method nào thường dùng để tạo mới một tài nguyên?',
        optionA: 'GET',
        optionB: 'DELETE',
        optionC: 'POST',
        optionD: 'PATCH',
      },
      {
        questionId: 1003,
        questionText: 'Status code nào biểu thị tạo tài nguyên thành công?',
        optionA: '200 OK',
        optionB: '201 Created',
        optionC: '404 Not Found',
        optionD: '500 Internal Server Error',
      },
      {
        questionId: 1004,
        questionText: '@PathVariable dùng để làm gì trong Spring Boot?',
        optionA: 'Lấy giá trị từ request body',
        optionB: 'Lấy giá trị từ query string',
        optionC: 'Lấy giá trị từ URL path',
        optionD: 'Inject một bean vào controller',
      },
      {
        questionId: 1005,
        questionText: 'JPA Repository method nào để tìm tất cả bản ghi?',
        optionA: 'findById()',
        optionB: 'findAll()',
        optionC: 'getAll()',
        optionD: 'listAll()',
      },
    ],
  },
  {
    id: 102,
    quizId: 102,
    lessonId: 22,
    courseId: 2,
    courseTitle: 'React Frontend Thực chiến',
    title: 'Quiz Hooks cơ bản',
    description: 'Kiểm tra hiểu biết về React Hooks.',
    passScore: 70,
    duration: 15,
    status: 'PUBLISHED',
    questions: [
      {
        questionId: 2001,
        questionText: 'useState trả về gì?',
        optionA: 'Một object với get/set methods',
        optionB: 'Một mảng gồm [state, setState]',
        optionC: 'Chỉ trả về giá trị state',
        optionD: 'Một Promise',
      },
      {
        questionId: 2002,
        questionText: 'useEffect với dependency array rỗng [] chạy khi nào?',
        optionA: 'Mỗi lần component re-render',
        optionB: 'Chỉ khi state thay đổi',
        optionC: 'Chỉ một lần sau khi component mount',
        optionD: 'Không bao giờ chạy',
      },
      {
        questionId: 2003,
        questionText: 'Hook nào dùng để tối ưu hóa giá trị tính toán?',
        optionA: 'useCallback',
        optionB: 'useRef',
        optionC: 'useMemo',
        optionD: 'useReducer',
      },
    ],
  },
]

export const MOCK_ASSIGNMENTS = [
  {
    id: 201,
    lessonId: 14,
    courseId: 1,
    courseTitle: 'Java Spring Boot Cơ bản',
    title: 'Bài tập: Xây dựng REST API CRUD',
    description: 'Xây dựng hoàn chỉnh REST API cho module Student với đầy đủ CRUD operations, validation và error handling.',
    deadline: '2026-05-15T23:59:00',
    status: 'PUBLISHED',
    submission: null,
  },
  {
    id: 202,
    lessonId: 23,
    courseId: 2,
    courseTitle: 'React Frontend Thực chiến',
    title: 'Bài tập: Todo App với React Hooks',
    description: 'Xây dựng ứng dụng Todo List sử dụng useState, useEffect và local storage.',
    deadline: '2026-05-20T23:59:00',
    status: 'PUBLISHED',
    submission: {
      submissionId: 301,
      originalFilename: 'todo-app.zip',
      submittedAt: '2026-04-25T10:00:00',
      score: null,
      feedback: null,
    },
  },
]

// Mock submissions for instructor view
export const MOCK_SUBMISSIONS = [
  {
    submissionType: 'QUIZ',
    submissionId: 401,
    quizId: 101,
    courseId: 1,
    courseTitle: 'Java Spring Boot Cơ bản',
    lessonId: 12,
    assessmentTitle: 'Quiz Chương 1 - REST API',
    studentId: 99,
    studentName: 'Le Thi C',
    score: 80,
    maxScore: 100,
    feedback: 'Làm tốt!',
    submittedAt: '2026-04-20T09:00:00',
    gradedAt: '2026-04-20T10:00:00',
    // Answers chosen by student: questionId → option letter
    answers: { 1001: 'B', 1002: 'C', 1003: 'B', 1004: 'C', 1005: 'A' },
  },
  {
    submissionType: 'QUIZ',
    submissionId: 402,
    quizId: 101,
    courseId: 1,
    courseTitle: 'Java Spring Boot Cơ bản',
    lessonId: 12,
    assessmentTitle: 'Quiz Chương 1 - REST API',
    studentId: 98,
    studentName: 'Pham Van D',
    score: 60,
    maxScore: 100,
    feedback: '',
    submittedAt: '2026-04-21T14:00:00',
    gradedAt: '2026-04-21T15:00:00',
    answers: { 1001: 'A', 1002: 'C', 1003: 'B', 1004: 'A', 1005: 'B' },
  },
  {
    submissionType: 'ASSIGNMENT',
    submissionId: 403,
    courseId: 1,
    courseTitle: 'Java Spring Boot Cơ bản',
    lessonId: 14,
    assessmentTitle: 'Bài tập: Xây dựng REST API CRUD',
    studentId: 99,
    studentName: 'Le Thi C',
    score: null,
    maxScore: 100,
    feedback: null,
    originalFilename: 'spring-crud.zip',
    submittedAt: '2026-04-25T11:00:00',
    gradedAt: null,
  },
  {
    submissionType: 'ASSIGNMENT',
    submissionId: 404,
    courseId: 2,
    courseTitle: 'React Frontend Thực chiến',
    lessonId: 23,
    assessmentTitle: 'Bài tập: Todo App với React Hooks',
    studentId: 97,
    studentName: 'Tran Minh E',
    score: null,
    maxScore: 100,
    feedback: null,
    originalFilename: 'todo-app.zip',
    submittedAt: '2026-04-25T10:00:00',
    gradedAt: null,
  },
]

export const CORRECT_ANSWERS = {
  1001: 'B',
  1002: 'C',
  1003: 'B',
  1004: 'C',
  1005: 'B',
  2001: 'B',
  2002: 'C',
  2003: 'C',
}

export function formatDuration(minutes) {
  if (minutes < 60) return `${minutes} phút`
  return `${Math.floor(minutes / 60)} giờ ${minutes % 60 > 0 ? minutes % 60 + ' phút' : ''}`
}

export function formatDeadline(isoStr) {
  if (!isoStr) return '—'
  const d = new Date(isoStr)
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}
