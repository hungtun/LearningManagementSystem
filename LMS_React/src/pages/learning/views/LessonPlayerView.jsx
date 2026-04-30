import { useRef, useState } from 'react'
import { useCurrentUser } from '../../../contexts/UserContext.jsx'
import { calcProgressFromLessons } from '../learningData.js'
import './LessonPlayerView.css'

// Convert any YouTube/Vimeo watch URL to an embeddable iframe src
function toEmbedUrl(url) {
  if (!url) return null
  // YouTube: watch?v=ID or youtu.be/ID
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/)
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`
  // Vimeo: vimeo.com/ID
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`
  // Already an embed URL or other direct URL - use as-is
  return url
}

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

function RoleBadge({ role }) {
  if (role === 'INSTRUCTOR') return <span className="roleBadge roleInstructor">Giảng viên</span>
  if (role === 'ADMIN') return <span className="roleBadge roleAdmin">Quản trị</span>
  return null
}

// Single discussion item (root or reply)
function DiscussionItem({ item, isReply, onReply }) {
  return (
    <div className={isReply ? 'replyItem' : 'discussItem'}>
      <div className={isReply ? 'replyAvatar' : 'discussAvatar'}>
        {(item.userFullName?.[0] || 'U').toUpperCase()}
      </div>
      <div className="discussBody">
        <div className="discussMeta">
          <strong>{item.userFullName}</strong>
          <RoleBadge role={item.userRole} />
          <span className="discussDate">
            {new Date(item.createdAt).toLocaleDateString('vi-VN')}
          </span>
        </div>
        <p className="discussContent">{item.content}</p>
        {!isReply && (
          <button type="button" className="btnReply" onClick={() => onReply(item.id, item.userFullName)}>
            Trả lời
          </button>
        )}
      </div>
    </div>
  )
}

// ----- Discussion section -----
function DiscussionSection({ discussions, onAdd }) {
  const [text, setText] = useState('')
  const [replyingTo, setReplyingTo] = useState(null) // { id, userFullName }
  const [replyText, setReplyText] = useState('')
  const { currentUser } = useCurrentUser()

  function submitRoot(e) {
    e.preventDefault()
    if (!text.trim()) return
    onAdd(text.trim(), currentUser, null)
    setText('')
  }

  function submitReply(e) {
    e.preventDefault()
    if (!replyText.trim() || !replyingTo) return
    onAdd(replyText.trim(), currentUser, replyingTo.id)
    setReplyText('')
    setReplyingTo(null)
  }

  function cancelReply() {
    setReplyingTo(null)
    setReplyText('')
  }

  const totalCount = discussions.reduce(
    (sum, d) => sum + 1 + (d.replies?.length || 0), 0
  )

  return (
    <div className="discussSection">
      <h4 className="discussTitle">Thảo luận ({totalCount})</h4>

      <form className="discussForm" onSubmit={submitRoot}>
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
            <li key={item.id}>
              <DiscussionItem
                item={item}
                isReply={false}
                onReply={(id, name) => { setReplyingTo({ id, userFullName: name }); setReplyText('') }}
              />

              {/* Inline reply form for this specific discussion */}
              {replyingTo?.id === item.id && (
                <form className="replyForm" onSubmit={submitReply}>
                  <p className="replyFormLabel">
                    Trả lời <strong>{replyingTo.userFullName}</strong>
                  </p>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Nhập phản hồi của bạn..."
                    rows={2}
                    autoFocus
                  />
                  <div className="replyFormActions">
                    <button type="button" className="btnCancel" onClick={cancelReply}>Hủy</button>
                    <button type="submit" className="btnPost" disabled={!replyText.trim()}>
                      Gửi phản hồi
                    </button>
                  </div>
                </form>
              )}

              {/* Replies thread */}
              {item.replies?.length > 0 && (
                <ul className="replyList">
                  {item.replies.map((reply) => (
                    <li key={reply.id}>
                      <DiscussionItem item={reply} isReply={true} onReply={() => {}} />
                    </li>
                  ))}
                </ul>
              )}
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

function formatBytes(bytes) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
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

              {/* Video player */}
              {toEmbedUrl(activeLesson.videoUrl) ? (
                <div className="videoWrapper">
                  <iframe
                    src={toEmbedUrl(activeLesson.videoUrl)}
                    title={activeLesson.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="videoFrame"
                  />
                </div>
              ) : (
                <div className="videoPlaceholder">
                  <div className="videoIcon">▶</div>
                  <p>Chưa có video cho bài học này.</p>
                </div>
              )}

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

                  {/* Attachments list */}
                  {activeLesson.attachments?.length > 0 && (
                    <div className="attachmentsBlock">
                      <p className="attachmentsTitle">Tài liệu bài học</p>
                      <ul className="attachmentsList">
                        {activeLesson.attachments.map((a) => (
                          <li key={a.id} className="attachmentsItem">
                            <a href={a.fileUrl} target="_blank" rel="noreferrer" className="attachmentsLink">
                              <span className="attachmentsIcon">
                                {a.fileType?.includes('pdf') ? 'PDF'
                                  : a.fileType?.includes('word') ? 'DOC'
                                  : a.fileType?.includes('presentation') ? 'PPT'
                                  : a.fileType?.includes('sheet') || a.fileType?.includes('excel') ? 'XLS'
                                  : 'FILE'}
                              </span>
                              <span className="attachmentsName">{a.fileName}</span>
                              {a.fileSize && (
                                <span className="attachmentsSize">{formatBytes(a.fileSize)}</span>
                              )}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
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
