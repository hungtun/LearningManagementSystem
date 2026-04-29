import { useMemo, useState } from 'react'
import { CATEGORY_COLORS, LEVEL_LABEL } from '../coursesData.js'
import './PublicCatalogView.css'

// Fallback color palette for categories not in CATEGORY_COLORS
const PALETTE = [
  '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444',
  '#10b981', '#06b6d4', '#f97316', '#ec4899',
  '#6366f1', '#84cc16',
]

function getCategoryColor(name, index) {
  return CATEGORY_COLORS[name] || PALETTE[index % PALETTE.length]
}

function StarRating({ rating }) {
  const full = Math.floor(rating)
  const half = rating - full >= 0.5
  return (
    <span className="starRating">
      {Array.from({ length: 5 }, (_, i) => {
        if (i < full) return <span key={i} className="starFull">★</span>
        if (i === full && half) return <span key={i} className="starHalf">★</span>
        return <span key={i} className="starEmpty">★</span>
      })}
      <span className="ratingNum">{rating > 0 ? rating.toFixed(1) : ''}</span>
    </span>
  )
}

function CourseCard({ course, onView, categoryColor }) {
  const color = categoryColor || CATEGORY_COLORS[course.categoryName] || '#64748b'
  return (
    <article className="courseCard" onClick={() => onView(course.id)}>
      <div className="courseThumb" style={{ background: `linear-gradient(135deg, ${color}cc, ${color})` }}>
        <span className="courseThumbCategory">{course.categoryName}</span>
        <span className="courseThumbLevel">{LEVEL_LABEL[course.level] || course.level}</span>
      </div>
      <div className="courseCardBody">
        <h3 className="courseCardTitle">{course.title}</h3>
        <p className="courseCardInstructor">{course.instructorName}</p>
        <p className="courseCardDesc">{course.description}</p>
        {(course.rating ?? 0) > 0 && (
          <div className="courseCardRating">
            <StarRating rating={course.rating} />
            <span className="reviewCount">({course.reviewCount ?? 0})</span>
          </div>
        )}
        <div className="courseCardFooter">
          {(course.learners ?? 0) > 0 && (
            <span className="learnersCount">{(course.learners).toLocaleString()} học viên</span>
          )}
        </div>
      </div>
    </article>
  )
}

export default function PublicCatalogView({ courses, onViewDetail }) {
  const [keyword, setKeyword] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [sortBy, setSortBy] = useState('newest')

  // Derive unique categories from real course data (order by first occurrence)
  const categories = useMemo(() => {
    const seen = new Set()
    const result = []
    courses.forEach((c) => {
      if (c.categoryName && !seen.has(c.categoryName)) {
        seen.add(c.categoryName)
        result.push(c.categoryName)
      }
    })
    return result.sort()
  }, [courses])

  const filtered = useMemo(() => {
    let result = courses.filter((c) => {
      const matchKeyword =
        !keyword ||
        c.title.toLowerCase().includes(keyword.toLowerCase()) ||
        (c.instructorName || '').toLowerCase().includes(keyword.toLowerCase()) ||
        (c.description || '').toLowerCase().includes(keyword.toLowerCase())
      const matchCategory = !filterCategory || c.categoryName === filterCategory
      return matchKeyword && matchCategory
    })

    if (sortBy === 'popular') result = [...result].sort((a, b) => (b.learners ?? 0) - (a.learners ?? 0))
    else if (sortBy === 'rating') result = [...result].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))

    return result
  }, [courses, keyword, filterCategory, sortBy])

  const totalLearners = courses.reduce((sum, c) => sum + (c.learners ?? 0), 0)

  function clearFilters() {
    setKeyword('')
    setFilterCategory('')
  }

  return (
    <div className="catalogRoot">
      {/* Hero */}
      <section className="catalogHero">
        <div className="heroContent">
          <h1>Khám phá khóa học</h1>
          <p>
            Học từ các chuyên gia hàng đầu.{' '}
            {courses.length} khóa học{totalLearners > 0 && `, ${totalLearners.toLocaleString()} học viên`}.
          </p>
          <div className="heroSearch">
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Tìm khóa học, giảng viên..."
            />
            <button type="button">Tìm kiếm</button>
          </div>
        </div>
      </section>

      {/* Category quick-filter — built from real data */}
      {categories.length > 0 && (
        <section className="categoryRow">
          <button
            type="button"
            className={!filterCategory ? 'catBtn active' : 'catBtn'}
            onClick={() => setFilterCategory('')}
          >
            Tất cả
          </button>
          {categories.map((cat, idx) => {
            const color = getCategoryColor(cat, idx)
            const isActive = filterCategory === cat
            return (
              <button
                key={cat}
                type="button"
                className={isActive ? 'catBtn active' : 'catBtn'}
                style={isActive ? { background: color, borderColor: color, color: '#fff' } : {}}
                onClick={() => setFilterCategory(isActive ? '' : cat)}
              >
                {cat}
              </button>
            )
          })}
        </section>
      )}

      {/* Toolbar */}
      <div className="catalogToolbar">
        <p className="resultCount">
          {filtered.length} kết quả{keyword ? ` cho "${keyword}"` : ''}{filterCategory ? ` trong "${filterCategory}"` : ''}
        </p>
        <div className="toolbarRight">
          <select
            className="filterSelect"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Mới nhất</option>
            <option value="popular">Phổ biến nhất</option>
            <option value="rating">Đánh giá cao</option>
          </select>
        </div>
      </div>

      {/* Course grid */}
      {filtered.length === 0 ? (
        <div className="emptyState">
          <p>Không tìm thấy khóa học nào.</p>
          {(keyword || filterCategory) && (
            <button type="button" className="btnSecondary" onClick={clearFilters}>
              Xóa bộ lọc
            </button>
          )}
        </div>
      ) : (
        <div className="courseGrid">
          {filtered.map((course) => {
            const catIdx = categories.indexOf(course.categoryName)
            const color = getCategoryColor(course.categoryName, catIdx)
            return (
              <CourseCard key={course.id} course={course} onView={onViewDetail} categoryColor={color} />
            )
          })}
        </div>
      )}
    </div>
  )
}
