import { useState } from 'react'
import { useCurrentUser } from '../contexts/UserContext.jsx'
import MainLayout from '../layouts/MainLayout.jsx'
import AssessmentsPage from './assessments/AssessmentsPage.jsx'
import CoursesPage from './courses/CoursesPage.jsx'
import LearningPage from './learning/LearningPage.jsx'

export default function WorkspacePage({ onLogout }) {
  const [activeModule, setActiveModule] = useState('courses')
  const { currentUser } = useCurrentUser()

  const role = currentUser?.role || ''
  const isStudent = role === 'STUDENT'

  function getAllowedModule(module) {
    if (!isStudent && module === 'learning') return 'courses'
    if (role === 'ADMIN' && module === 'assessments') return 'courses'
    return module
  }

  const visibleModule = getAllowedModule(activeModule)

  return (
    <MainLayout
      activeModule={visibleModule}
      onChangeModule={(module) => setActiveModule(getAllowedModule(module))}
      role={role}
      onLogout={onLogout}
    >
      {visibleModule === 'courses' && <CoursesPage role={role} />}
      {visibleModule === 'assessments' && <AssessmentsPage role={role} />}
      {visibleModule === 'learning' && isStudent && <LearningPage role={role} />}
    </MainLayout>
  )
}
