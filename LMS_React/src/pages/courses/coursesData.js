// Mock data for Courses module

export const MOCK_COURSES = [
  {
    id: 1,
    title: 'Java Spring Boot Cơ bản',
    description:
      'Học lập trình backend với Spring Boot từ đầu đến thực chiến. Bạn sẽ xây dựng REST API hoàn chỉnh, kết nối database và deploy lên server.',
    instructorId: 10,
    instructorName: 'Nguyen Van A',
    instructorAvatarUrl: '',
    categoryId: 1,
    categoryName: 'Backend',
    level: 'BEGINNER',
    publicationStatus: 'PUBLISHED',
    learners: 1260,
    rating: 4.7,
    reviewCount: 320,
    thumbnailUrl: '',
    lessons: [
      { id: 11, title: 'Giới thiệu Spring Boot', content: 'Nội dung bài 1...', orderIndex: 0, duration: '20 phút' },
      { id: 12, title: 'REST API đầu tiên', content: 'Nội dung bài 2...', orderIndex: 1, duration: '35 phút' },
      { id: 13, title: 'Kết nối Database', content: 'Nội dung bài 3...', orderIndex: 2, duration: '40 phút' },
      { id: 14, title: 'Spring Security cơ bản', content: 'Nội dung bài 4...', orderIndex: 3, duration: '45 phút' },
    ],
  },
  {
    id: 2,
    title: 'React Frontend Thực chiến',
    description:
      'Xây dựng giao diện web hiện đại với React 19 và Vite. Từ component, hooks đến state management và deploy.',
    instructorId: 11,
    instructorName: 'Tran Thi B',
    instructorAvatarUrl: '',
    categoryId: 2,
    categoryName: 'Frontend',
    level: 'INTERMEDIATE',
    publicationStatus: 'PUBLISHED',
    learners: 980,
    rating: 4.5,
    reviewCount: 215,
    thumbnailUrl: '',
    lessons: [
      { id: 21, title: 'Component & Props', content: 'Nội dung bài 1...', orderIndex: 0, duration: '25 phút' },
      { id: 22, title: 'State & Hook', content: 'Nội dung bài 2...', orderIndex: 1, duration: '30 phút' },
      { id: 23, title: 'useEffect & API calls', content: 'Nội dung bài 3...', orderIndex: 2, duration: '35 phút' },
    ],
  },
  {
    id: 3,
    title: 'MySQL cho LMS',
    description:
      'Thiết kế và tối ưu cơ sở dữ liệu cho hệ thống học tập trực tuyến. Schema design, indexing, query optimization.',
    instructorId: 12,
    instructorName: 'Le Van C',
    instructorAvatarUrl: '',
    categoryId: 3,
    categoryName: 'Database',
    level: 'BEGINNER',
    publicationStatus: 'DRAFT',
    learners: 0,
    rating: 0,
    reviewCount: 0,
    thumbnailUrl: '',
    lessons: [],
  },
  {
    id: 4,
    title: 'DevOps CI/CD Pipeline',
    description:
      'Xây dựng pipeline CI/CD với GitHub Actions, Docker và deploy lên AWS. Tự động hóa toàn bộ quy trình.',
    instructorId: 13,
    instructorName: 'Pham Minh D',
    instructorAvatarUrl: '',
    categoryId: 4,
    categoryName: 'DevOps',
    level: 'ADVANCED',
    publicationStatus: 'PENDING_REVIEW',
    learners: 0,
    rating: 0,
    reviewCount: 0,
    thumbnailUrl: '',
    lessons: [
      { id: 41, title: 'Giới thiệu DevOps', content: 'Nội dung...', orderIndex: 0, duration: '30 phút' },
      { id: 42, title: 'Docker cơ bản', content: 'Nội dung...', orderIndex: 1, duration: '50 phút' },
    ],
  },
  {
    id: 5,
    title: 'Python Machine Learning',
    description:
      'Nhập môn Machine Learning với Python, scikit-learn và pandas. Xây dựng mô hình dự đoán thực tế.',
    instructorId: 14,
    instructorName: 'Nguyen Thi E',
    instructorAvatarUrl: '',
    categoryId: 5,
    categoryName: 'AI/ML',
    level: 'INTERMEDIATE',
    publicationStatus: 'PUBLISHED',
    learners: 670,
    rating: 4.8,
    reviewCount: 180,
    thumbnailUrl: '',
    lessons: [
      { id: 51, title: 'Python cơ bản', content: 'Nội dung...', orderIndex: 0, duration: '40 phút' },
      { id: 52, title: 'Pandas & NumPy', content: 'Nội dung...', orderIndex: 1, duration: '45 phút' },
      { id: 53, title: 'Linear Regression', content: 'Nội dung...', orderIndex: 2, duration: '60 phút' },
    ],
  },
  {
    id: 6,
    title: 'Flutter Mobile App',
    description:
      'Xây dựng ứng dụng di động đa nền tảng với Flutter và Dart. Từ UI design đến publish lên App Store.',
    instructorId: 15,
    instructorName: 'Tran Van F',
    instructorAvatarUrl: '',
    categoryId: 6,
    categoryName: 'Mobile',
    level: 'BEGINNER',
    publicationStatus: 'PUBLISHED',
    learners: 540,
    rating: 4.3,
    reviewCount: 95,
    thumbnailUrl: '',
    lessons: [
      { id: 61, title: 'Flutter & Dart basics', content: 'Nội dung...', orderIndex: 0, duration: '35 phút' },
      { id: 62, title: 'Widget & Layout', content: 'Nội dung...', orderIndex: 1, duration: '40 phút' },
    ],
  },
]

// Courses pending admin review
export const MOCK_PENDING_COURSES = MOCK_COURSES.filter(
  (c) => c.publicationStatus === 'PENDING_REVIEW'
)

export const LEVELS = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED']
export const PUBLICATION_STATUSES = ['DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'REJECTED']

export const PUBLICATION_STATUS_LABEL = {
  DRAFT:          'Bản nháp',
  PENDING_REVIEW: 'Chờ duyệt',
  PUBLISHED:      'Đã duyệt',
  REJECTED:       'Từ chối',
}
export const CATEGORIES = ['Backend', 'Frontend', 'Database', 'DevOps', 'AI/ML', 'Mobile']

export const CATEGORY_COLORS = {
  Backend: '#3b82f6',
  Frontend: '#8b5cf6',
  Database: '#f59e0b',
  DevOps: '#ef4444',
  'AI/ML': '#10b981',
  Mobile: '#06b6d4',
}

export const LEVEL_LABEL = {
  BEGINNER: 'Cơ bản',
  INTERMEDIATE: 'Trung cấp',
  ADVANCED: 'Nâng cao',
}

export function emptyCoursForm() {
  return {
    title: '',
    description: '',
    instructorId: '',
    categoryId: '',
    level: 'BEGINNER',
    publicationStatus: 'DRAFT',
  }
}

export function emptyLessonForm() {
  return { title: '', content: '', videoUrl: '' }
}
