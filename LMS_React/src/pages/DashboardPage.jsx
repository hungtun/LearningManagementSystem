import { useEffect, useMemo, useRef, useState } from "react";
import { logout } from "../api/auth.js";
import {
  getPublishedCourseDetail,
  listPublishedCourses,
} from "../api/courses.js";
import { createEnrollment, listMyCourses } from "../api/enrollments.js";
import { setToken } from "../api/http.js";
import {
  getCourseProgress,
  listCourseReviews,
} from "../api/learnings.js";
import {
  listCategories,
  listNotifications,
  markAllNotificationsRead,
} from "../api/system.js";
import {
  getCurrentUser,
  updateCurrentUser,
  uploadCurrentUserAvatar,
} from "../api/users.js";
import { useNotificationPolling } from "../hooks/useNotificationPolling.js";

import CourseDetailSection from "./dashboard/components/CourseDetailSection.jsx";
import CourseRailSection from "./dashboard/components/CourseRailSection.jsx";
import HeroSection from "./dashboard/components/HeroSection.jsx";
import HomeFooter from "./dashboard/components/HomeFooter.jsx";
import HomeHeader from "./dashboard/components/HomeHeader.jsx";
import LearningPage from "./dashboard/components/LearningPage.jsx";
import MyCoursesPage from "./dashboard/components/MyCoursesPage.jsx";
import MyCoursesSection from "./dashboard/components/MyCoursesSection.jsx";
import ProfilePage from "./dashboard/components/ProfilePage.jsx";

import { getAccountLabel, getMessage } from "./dashboard/dashboard.utils.js";
import "./DashboardPage.css";

function normalizeNotificationReadFlag(notification) {
  return {
    ...notification,
    read: Boolean(notification?.read ?? notification?.isRead),
  };
}

export default function DashboardPage({
  currentUser: currentUserProp,
  onLoggedOut,
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [globalError, setGlobalError] = useState("");
  const [globalSuccess, setGlobalSuccess] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [activeScreen, setActiveScreen] = useState("home");
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isNotificationMenuOpen, setIsNotificationMenuOpen] = useState(false);

  const actionMenusRef = useRef(null);
  const discoverSectionRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);

  const [currentUser, setCurrentUser] = useState(currentUserProp ?? null);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [categories, setCategories] = useState([]);

  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [selectedCourseDetail, setSelectedCourseDetail] = useState(null);
  const [isLoadingCourseDetail, setIsLoadingCourseDetail] = useState(false);

  const [selectedCourseReviews, setSelectedCourseReviews] = useState([]);
  const [isLoadingCourseReviews, setIsLoadingCourseReviews] = useState(false);

  const [myCourses, setMyCourses] = useState([]);
  const [courseProgressById, setCourseProgressById] = useState({});
  const [notifications, setNotifications] = useState([]);

  const [avatarUrl, setAvatarUrl] = useState(
    currentUserProp?.avatarUrl || ""
  );

  useNotificationPolling((incomingNotifications) => {
    if (!Array.isArray(incomingNotifications)) return;
    setNotifications(
      incomingNotifications.map(normalizeNotificationReadFlag)
    );
  });

  async function handleSelectCourse(courseId) {
    setSelectedCourseId(courseId);
    setActiveScreen("courseDetail");

    setIsLoadingCourseDetail(true);
    setIsLoadingCourseReviews(true);

    setGlobalError("");
    setGlobalSuccess("");

    try {
      const [detail, reviews] = await Promise.all([
        getPublishedCourseDetail(courseId),
        listCourseReviews(courseId).catch(() => []),
      ]);

      setSelectedCourseDetail(detail);
      setSelectedCourseReviews(
        Array.isArray(reviews) ? reviews : []
      );
    } catch (error) {
      setSelectedCourseDetail(null);
      setSelectedCourseReviews([]);
      setGlobalError(getMessage(error, "Unable to load course details"));
    } finally {
      setIsLoadingCourseDetail(false);
      setIsLoadingCourseReviews(false);
    }
  }

  async function handleLogout() {
    try {
      await logout();
    } catch (_) {}
    finally {
      setToken(null);
      onLoggedOut?.();
    }
  }

  async function handleEnroll(event) {
    event.preventDefault();

    if (!selectedCourseId) {
      setGlobalError("Please select a course");
      return;
    }

    try {
      await createEnrollment({ courseId: selectedCourseId });
      setMyCourses(await listMyCourses());
      setGlobalSuccess("Enrollment successful");
    } catch (error) {
      setGlobalError(getMessage(error, "Enrollment failed"));
    }
  }

  function handleStartLearning() {
    if (!selectedCourseDetail?.lessons?.length) {
      setGlobalSuccess("Course has no lessons yet");
      return;
    }
    setActiveScreen("learning");
  }

  if (isLoading) {
    return <main className="dashboardLoading">Loading...</main>;
  }

  return (
    <div className="dashboardRoot">
      <HomeHeader
        avatarUrl={avatarUrl}
        notifications={notifications}
        onLogout={handleLogout}
      />

      {globalError && <p className="alert error">{globalError}</p>}
      {globalSuccess && <p className="alert success">{globalSuccess}</p>}

      {activeScreen === "home" && (
        <>
          <HeroSection categories={categories} />

          <CourseRailSection
            courses={availableCourses}
            onSelectCourse={handleSelectCourse}
          />
        </>
      )}

      {activeScreen === "courseDetail" && (
        <CourseDetailSection
          selectedCourseDetail={selectedCourseDetail}
          selectedCourseReviews={selectedCourseReviews}
          isLoadingCourseDetail={isLoadingCourseDetail}
          isLoadingCourseReviews={isLoadingCourseReviews}
          onEnroll={handleEnroll}
          onStartLearning={handleStartLearning}
        />
      )}

      {activeScreen === "learning" && selectedCourseDetail && (
        <LearningPage courseDetail={selectedCourseDetail} />
      )}

      <HomeFooter />
    </div>
  );
}