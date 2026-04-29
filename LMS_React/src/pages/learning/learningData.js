// Mock data for Learning module

export const MOCK_ENROLLMENTS = [
  {
    id: 1,
    courseId: 1,
    courseTitle: 'Java Spring Boot Cơ bản',
    category: 'Backend',
    instructor: 'Nguyen Van A',
    enrolledAt: '2026-03-01T08:00:00',
    status: 'ACTIVE',
    completedLessons: 2,
    totalLessons: 4,
    lessons: [
      {
        id: 11,
        title: 'Giới thiệu Spring Boot',
        content: 'Spring Boot là framework giúp phát triển ứng dụng Java nhanh chóng. Trong bài này chúng ta sẽ tìm hiểu kiến trúc, cài đặt và tạo project đầu tiên.',
        duration: '20 phút',
        completed: true,
        progressPercent: 100,
      },
      {
        id: 12,
        title: 'REST API đầu tiên',
        content: 'Xây dựng REST API với @RestController, @GetMapping, @PostMapping. Hiểu về HTTP methods và status codes.',
        duration: '35 phút',
        completed: true,
        progressPercent: 100,
      },
      {
        id: 13,
        title: 'Kết nối Database',
        content: 'Tích hợp Spring Data JPA với MySQL. Tạo Entity, Repository và thực hiện CRUD operations.',
        duration: '40 phút',
        completed: false,
        progressPercent: 45,
      },
      {
        id: 14,
        title: 'Spring Security cơ bản',
        content: 'Bảo mật API với Spring Security. JWT authentication và phân quyền role-based.',
        duration: '45 phút',
        completed: false,
        progressPercent: 0,
      },
    ],
  },
  {
    id: 2,
    courseId: 2,
    courseTitle: 'React Frontend Thực chiến',
    category: 'Frontend',
    instructor: 'Tran Thi B',
    enrolledAt: '2026-03-15T09:30:00',
    status: 'ACTIVE',
    completedLessons: 1,
    totalLessons: 3,
    lessons: [
      {
        id: 21,
        title: 'Component & Props',
        content: 'React component là đơn vị UI tái sử dụng. Props truyền dữ liệu từ cha xuống con.',
        duration: '25 phút',
        completed: true,
        progressPercent: 100,
      },
      {
        id: 22,
        title: 'State & Hook',
        content: 'useState quản lý trạng thái nội bộ. useEffect xử lý side effects như fetch API.',
        duration: '30 phút',
        completed: false,
        progressPercent: 60,
      },
      {
        id: 23,
        title: 'useEffect & API calls',
        content: 'Gọi API bằng fetch/axios trong useEffect. Xử lý loading state và error.',
        duration: '35 phút',
        completed: false,
        progressPercent: 0,
      },
    ],
  },
]

// Mock discussions keyed by lessonId
export const MOCK_DISCUSSIONS = {
  11: [
    {
      id: 1001,
      userId: 99,
      userFullName: 'Le Thi C',
      lessonId: 11,
      content: 'Spring Boot khác gì Spring Framework vậy thầy?',
      createdAt: '2026-03-10T10:00:00',
      replies: [
        {
          id: 10011,
          userId: 10,
          userFullName: 'Nguyen Van A (Giảng viên)',
          content: 'Spring Boot tự động cấu hình nhiều thứ giúp bạn, trong khi Spring Framework cần config thủ công nhiều hơn.',
          createdAt: '2026-03-10T10:30:00',
        },
      ],
    },
    {
      id: 1002,
      userId: 98,
      userFullName: 'Pham Van D',
      lessonId: 11,
      content: 'Bài học rất dễ hiểu, cảm ơn thầy!',
      createdAt: '2026-03-12T14:00:00',
      replies: [],
    },
  ],
  12: [
    {
      id: 1003,
      userId: 97,
      userFullName: 'Tran Minh E',
      lessonId: 12,
      content: 'Sự khác biệt giữa @GetMapping và @RequestMapping là gì?',
      createdAt: '2026-03-14T09:00:00',
      replies: [],
    },
  ],
}

// Mock reviews keyed by courseId
export const MOCK_REVIEWS = {
  1: [
    {
      id: 2001,
      courseId: 1,
      userId: 99,
      userFullName: 'Le Thi C',
      rating: 5,
      comment: 'Khóa học rất hay, giảng viên nhiệt tình và dễ hiểu.',
      createdAt: '2026-03-20T08:00:00',
    },
    {
      id: 2002,
      courseId: 1,
      userId: 98,
      userFullName: 'Pham Van D',
      rating: 4,
      comment: 'Nội dung tốt nhưng muốn có thêm bài tập thực hành.',
      createdAt: '2026-03-22T16:00:00',
    },
  ],
  2: [],
}

export function calcProgress(enrollment) {
  if (!enrollment.totalLessons) return 0
  return Math.round((enrollment.completedLessons / enrollment.totalLessons) * 100)
}

export function calcProgressFromLessons(lessons) {
  if (!lessons || lessons.length === 0) return 0
  const completed = lessons.filter((l) => l.completed).length
  return Math.round((completed / lessons.length) * 100)
}

export function getNextLesson(lessons) {
  const sorted = [...lessons].sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0))
  return sorted.find((l) => !l.completed) || sorted[sorted.length - 1]
}

export const CATEGORY_COLORS = {
  Backend: '#3b82f6',
  Frontend: '#8b5cf6',
  Database: '#f59e0b',
  DevOps: '#ef4444',
  'AI/ML': '#10b981',
  Mobile: '#06b6d4',
}
