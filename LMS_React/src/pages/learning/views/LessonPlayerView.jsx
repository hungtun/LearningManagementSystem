import { useRef, useState } from 'react'
import { useCurrentUser } from '../../../contexts/UserContext.jsx'
import { calcProgressFromLessons } from '../learningData.js'
import './LessonPlayerView.css'

// ----- Video progress slider -----
function VideoProgressBar({ progressPercent, onChange }) {
  return (
    <div className="videoProgressWrap">
      <span className="vpLabel">Tiến độ bài học</span>
      <input
        type="range"
        min={0}
        max={100}
        value={progressPercent}
        onChange={(e) => onChange(Number(e.target.value))}
        className="vpSlider"
      />
      <span className="vpPct">{progressPercent}%</span>
    </div>
  )
}

// ----- Star picker -----
function StarPicker({ value, onChange }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="starPicker">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={star <= (hover || value) ? 'starBtn active' : 'starBtn'}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(star)}
        >
          ★
        </button>
      ))}
    </div>
  )
}

// ----- Discussion section -----
function DiscussionSection({ discussions, onAdd }) {
  const [text, setText] = useState('')
  const { currentUser } = useCurrentUser()

  function submit(e) {
    e.preventDefault()
    if (!text.trim()) return
    onAdd(text.trim(), currentUser)
    setText('')
  }

  return (
    <div className="discussSection">
      <h4 className="discussTitle">Thảo luận ({discussions.length})</h4>

      <form className="discussForm" onSubmit={submit}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Đặt câu hỏi hoặc chia sẻ suy nghĩ về bài học này..."
          rows={3}
        />
        <button type="submit" className="btnPost" disabled={!text.trim()}>
          Đăng
        </button>
      </form>

      {discussions.length === 0 ? (
        <p className="discussEmpty">Chưa có thảo luận nào. Hãy là người đầu tiên đặt câu hỏi!</p>
      ) : (
        <ul className="discussList">
          {discussions.map((item) => (
            <li key={item.id} className="discussItem">
              <div className="discussAvatar">
                {(item.userFullName?.[0] || 'U').toUpperCase()}
              </div>
              <div className="discussBody">
                <div className="discussMeta">
                  <strong>{item.userFullName}</strong>
                  <span className="discussDate">
                    {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                <p className="discussContent">{item.content}</p>
                {item.replies?.length > 0 && (
                  <ul className="replyList">
                    {item.replies.map((reply) => (
                      <li key={reply.id} className="replyItem">
                        <div className="replyAvatar">
                          {(reply.userFullName?.[0] || 'U').toUpperCase()}
                        </div>
                        <div className="discussBody">
                          <div className="discussMeta">
                            <strong>{reply.userFullName}</strong>
                            <span className="discussDate">
                              {new Date(reply.createdAt).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                          <p className="discussContent">{reply.content}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ----- Review section -----
function ReviewSection({ reviews, onAdd, hasCompleted }) {
  const { currentUser } = useCurrentUser()
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : 0

  function submit(e) {
    e.preventDefault()
    if (!rating) return
    onAdd(rating, comment.trim(), currentUser)
    setSubmitted(true)
  }

  return (
    <div className="reviewSection">
      <h4 className="reviewTitle">Đánh giá khóa học</h4>

      {reviews.length > 0 && (
        <div className="reviewSummary">
          <span className="reviewAvg">{avgRating}</span>
          <span className="reviewStars">{'★'.repeat(Math.round(avgRating))}{'☆'.repeat(5 - Math.round(avgRating))}</span>
          <span className="reviewCount">({reviews.length} đánh giá)</span>
        </div>
      )}

      {/* Write review */}
      {hasCompleted && !submitted && (
        <form className="reviewForm" onSubmit={submit}>
          <p className="reviewFormLabel">Viết đánh giá của bạn</p>
          <StarPicker value={rating} onChange={setRating} />
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Chia sẻ trải nghiệm học của bạn..."
            rows={3}
          />
          <button type="submit" className="btnPost" disabled={!rating}>
            Gửi đánh giá
          </button>
        </form>
      )}

      {submitted && (
        <p className="reviewSubmitted">Cảm ơn bạn đã đánh giá khóa học!</p>
      )}

      {!hasCompleted && !submitted && (
        <p className="reviewNote">Hoàn thành khóa học để viết đánh giá.</p>
      )}

      {/* Reviews list */}
      {reviews.length > 0 && (
        <ul className="reviewList">
          {reviews.map((r) => (
            <li key={r.id} className="reviewItem">
              <div className="reviewAvatar">{(r.userFullName?.[0] || 'U').toUpperCase()}</div>
              <div className="reviewBody">
                <div className="reviewMeta">
                  <strong>{r.userFullName}</strong>
                  <span className="reviewStarsSmall">
                    {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                  </span>
                  <span className="reviewDate">
                    {new Date(r.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                {r.comment && <p className="reviewComment">{r.comment}</p>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ----- Main LessonPlayerView -----
export default function LessonPlayerView({
  enrollment,
  activeLesson,
  discussions,
  reviews,
  onSelectLesson,
  onUpdateProgress,
  onAddDiscussion,
  onAddReview,
  onOpenCertificate,
  onBack,
}) {
  const [activeTab, setActiveTab] = useState('content')
  const progressTimerRef = useRef(null)

  function handleProgressChange(percent) {
    // Debounce update to parent
    clearTimeout(progressTimerRef.current)
    progressTimerRef.current = setTimeout(() => {
      onUpdateProgress(activeLesson.id, percent)
    }, 600)
  }

  function handleMarkComplete() {
    onUpdateProgress(activeLesson.id, 100)
  }

  const allLessons = enrollment.lessons || []
  const courseProgress = calcProgressFromLessons(allLessons)
  const isCompleted = enrollment.status === 'COMPLETED'
  const sortedLessons = [...allLessons].sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0))
  const activeIdx = sortedLessons.findIndex((l) => l.id === activeLesson?.id)

  function goPrev() {
    if (activeIdx > 0) onSelectLesson(sortedLessons[activeIdx - 1].id)
  }

  function goNext() {
    if (activeIdx < sortedLessons.length - 1) onSelectLesson(sortedLessons[activeIdx + 1].id)
  }

  return (
    <div className="playerRoot">
      {/* Top bar */}
      <div className="playerTopBar">
        <button type="button" className="btnBack" onClick={onBack}>
          ← Khóa học của tôi
        </button>
        <div className="playerCourseInfo">
          <span className="playerCourseTitle">{enrollment.courseTitle}</span>
          <span className="playerProgress">{courseProgress}% hoàn thành</span>
        </div>
        {isCompleted && (
          <button type="button" className="btnCert" onClick={onOpenCertificate}>
            Nhận chứng chỉ
          </button>
        )}
      </div>

      <div className="playerLayout">
        {/* Sidebar: lesson list */}
        <aside className="playerSidebar">
          <div className="sidebarHead">
            <p className="sidebarCourseTitle">{enrollment.courseTitle}</p>
            <div className="sidebarProgressTrack">
              <div className="sidebarProgressFill" style={{ width: `${courseProgress}%` }} />
            </div>
            <p className="sidebarProgressLabel">
              {allLessons.filter((l) => l.completed).length}/{allLessons.length} bài
            </p>
          </div>

          <ul className="sidebarLessonList">
            {sortedLessons.map((lesson, idx) => (
              <li key={lesson.id}>
                <button
                  type="button"
                  className={
                    lesson.id === activeLesson?.id
                      ? 'sidebarLesson active'
                      : lesson.completed
                      ? 'sidebarLesson completed'
                      : 'sidebarLesson'
                  }
                  onClick={() => onSelectLesson(lesson.id)}
                >
                  <span className="sidebarLessonCheck">
                    {lesson.completed ? '✓' : idx + 1}
                  </span>
                  <span className="sidebarLessonTitle">{lesson.title}</span>
                  <span className="sidebarLessonDur">{lesson.duration}</span>
                </button>
                {lesson.progressPercent > 0 && lesson.progressPercent < 100 && (
                  <div className="sidebarMiniProgress">
                    <div style={{ width: `${lesson.progressPercent}%` }} />
                  </div>
                )}
              </li>
            ))}
          </ul>
        </aside>

        {/* Main content */}
        <div className="playerMain">
          {!activeLesson ? (
            <p className="noLesson">Chọn bài học từ danh sách bên trái.</p>
          ) : (
            <>
              {/* Lesson header */}
              <div className="lessonHeader">
                <h2 className="lessonTitle">{activeLesson.title}</h2>
                <div className="lessonNav">
                  <button type="button" className="btnNavLesson" onClick={goPrev} disabled={activeIdx === 0}>
                    ← Trước
                  </button>
                  <button
                    type="button"
                    className="btnNavLesson"
                    onClick={goNext}
                    disabled={activeIdx === sortedLessons.length - 1}
                  >
                    Tiếp →
                  </button>
                </div>
              </div>

              {/* Video placeholder */}
              <div className="videoPlaceholder">
                <div className="videoIcon">▶</div>
                <p>Nội dung video bài học</p>
              </div>

              {/* Video progress */}
              <VideoProgressBar
                progressPercent={activeLesson.progressPercent || 0}
                onChange={handleProgressChange}
              />

              {/* Mark complete button */}
              {!activeLesson.completed && (
                <button type="button" className="btnMarkDone" onClick={handleMarkComplete}>
                  Đánh dấu hoàn thành
                </button>
              )}
              {activeLesson.completed && (
                <p className="completedNote">Bài học đã hoàn thành</p>
              )}

              {/* Tab navigation */}
              <div className="contentTabs">
                {['content', 'discussion', 'review'].map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    className={activeTab === tab ? 'contentTab active' : 'contentTab'}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab === 'content' && 'Nội dung bài học'}
                    {tab === 'discussion' && `Thảo luận (${discussions.length})`}
                    {tab === 'review' && `Đánh giá (${reviews.length})`}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              {activeTab === 'content' && (
                <div className="lessonContent">
                  <p>{activeLesson.content || 'Nội dung bài học sẽ hiển thị ở đây.'}</p>
                </div>
              )}

              {activeTab === 'discussion' && (
                <DiscussionSection
                  discussions={discussions}
                  onAdd={onAddDiscussion}
                />
              )}

              {activeTab === 'review' && (
                <ReviewSection
                  reviews={reviews}
                  onAdd={onAddReview}
                  hasCompleted={isCompleted}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
