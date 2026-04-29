import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { useRef, useState } from 'react'
import { useCurrentUser } from '../../../contexts/UserContext.jsx'
import './CertificateView.css'

function CertificateCard({ studentName, courseTitle, instructor, completedDate }) {
  return (
    <div className="certCard">
      <div className="certHeader">
        <span className="certLogo">LMS</span>
        <span className="certTagline">Learning Management System</span>
      </div>

      <div className="certBody">
        <p className="certPreamble">Chứng nhận rằng</p>
        <h1 className="certStudentName">{studentName}</h1>
        <p className="certPreamble2">đã hoàn thành khóa học</p>
        <h2 className="certCourseName">"{courseTitle}"</h2>
        <p className="certInstructor">Giảng viên: {instructor}</p>
      </div>

      <div className="certFooter">
        <div className="certSignature">
          <div className="certSignatureLine" />
          <p>Giảng viên</p>
          <p className="certSignatureName">{instructor}</p>
        </div>
        <div className="certSeal">
          <span className="certSealInner">LMS</span>
        </div>
        <div className="certSignature certRight">
          <div className="certSignatureLine" />
          <p>Ngày cấp</p>
          <p className="certSignatureName">{completedDate}</p>
        </div>
      </div>
    </div>
  )
}

export default function CertificateView({ enrollment, onBack }) {
  const { currentUser } = useCurrentUser()
  const certRef = useRef(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const studentName = currentUser?.fullName || currentUser?.email || 'Học viên'
  const completedDate = new Date().toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })

  async function handleDownload() {
    const el = certRef.current
    if (!el) return
    setIsGenerating(true)
    try {
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [canvas.width / 2, canvas.height / 2] })
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2)
      pdf.save(`certificate-${enrollment?.courseTitle || 'lms'}.pdf`)
    } finally {
      setIsGenerating(false)
    }
  }

  if (!enrollment) {
    return (
      <div className="certRoot">
        <button type="button" className="btnBack" onClick={onBack}>← Quay lại</button>
        <p className="certError">Không tìm thấy thông tin khóa học.</p>
      </div>
    )
  }

  return (
    <div className="certRoot">
      {/* Breadcrumb */}
      <nav className="certBreadcrumb">
        <button type="button" className="btnBack" onClick={onBack}>
          ← Khóa học của tôi
        </button>
        <span className="breadSep">/</span>
        <span>Chứng chỉ</span>
      </nav>

      <div className="certPage">
        {/* Actions */}
        <div className="certActions">
          <h2 className="certPageTitle">Chứng chỉ hoàn thành</h2>
          <div className="certBtns">
            <button type="button" className="btnDownload" onClick={handleDownload} disabled={isGenerating}>
              {isGenerating ? 'Đang tạo PDF...' : 'Tải xuống (PDF)'}
            </button>
          </div>
        </div>

        {/* Certificate */}
        <div ref={certRef}>
          <CertificateCard
            studentName={studentName}
            courseTitle={enrollment.courseTitle}
            instructor={enrollment.instructor}
            completedDate={completedDate}
          />
        </div>

        {/* Info below certificate */}
        <div className="certInfo">
          <div className="certInfoItem">
            <p className="certInfoLabel">Khóa học</p>
            <p className="certInfoValue">{enrollment.courseTitle}</p>
          </div>
          <div className="certInfoItem">
            <p className="certInfoLabel">Giảng viên</p>
            <p className="certInfoValue">{enrollment.instructor}</p>
          </div>
          <div className="certInfoItem">
            <p className="certInfoLabel">Ngày đăng ký</p>
            <p className="certInfoValue">
              {new Date(enrollment.enrolledAt).toLocaleDateString('vi-VN')}
            </p>
          </div>
          <div className="certInfoItem">
            <p className="certInfoLabel">Ngày hoàn thành</p>
            <p className="certInfoValue">{completedDate}</p>
          </div>
          <div className="certInfoItem">
            <p className="certInfoLabel">Số bài học</p>
            <p className="certInfoValue">{enrollment.lessons?.length || 0} bài</p>
          </div>
          <div className="certInfoItem">
            <p className="certInfoLabel">Danh mục</p>
            <p className="certInfoValue">{enrollment.category}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
