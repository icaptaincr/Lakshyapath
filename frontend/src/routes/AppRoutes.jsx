
import { Routes, Route } from "react-router-dom";

import PublicLayout from "../layouts/PublicLayout";
import StudentLayout from "../layouts/StudentLayout";
import ProtectedRoute from "./ProtectedRoute";
import AdminProtectedRoute from "./AdminProtectedRoute";

import Home from "../pages/public/Home";
import Login from "../pages/public/Login";
import Register from "../pages/public/Register";

import Dashboard from "../pages/student/Dashboard";
import Exams from "../pages/student/Exams";
import ExamDetails from "../pages/student/ExamDetails";
import SubjectDetails from "../pages/student/SubjectDetails";
import TopicDetails from "../pages/student/TopicDetails";
import ProgressPage from "../pages/student/Progress";
import MockTests from "../pages/student/MockTests";
import MockTestStart from "../pages/student/MockTestStart";
import MockTestAttempt from "../pages/student/MockTestAttempt";
import MockTestResult from "../pages/student/MockTestResult";
import Payment from "../pages/student/Payment";
import PaymentSuccess from "../pages/student/PaymentSuccess";
import Notifications from "../pages/student/Notifications";

import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminExams from "../pages/admin/AdminExams";
import AdminSubjects from "../pages/admin/AdminSubjects";
import AdminQuestions from "../pages/admin/AdminQuestions";
import AdminTests from "../pages/admin/AdminTests";
import AdminPlans from "../pages/admin/AdminPlans";
import AdminNotifications from "../pages/admin/AdminNotifications";
import AdminHomeContent from "../pages/admin/AdminHomeContent";
import AdminStudents from "../pages/admin/AdminStudents";
import AdminFinance from "../pages/admin/AdminFinance";

function AppRoutes() {
  return (
    <Routes>
      {/* Public pages */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Protected student pages */}
      <Route element={<ProtectedRoute />}>
        <Route element={<StudentLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/exams" element={<Exams />} />

          <Route
            path="/exams/:examId"
            element={<ExamDetails />}
          />

          <Route
            path="/exams/:examId/subjects/:subjectId"
            element={<SubjectDetails />}
          />

          <Route
            path="/exams/:examId/subjects/:subjectId/topics/:topicId"
            element={<TopicDetails />}
          />

          <Route
            path="/exams/:examId/progress"
            element={<ProgressPage />}
          />

          <Route
            path="/exams/:examId/tests"
            element={<MockTests />}
          />

          <Route
            path="/exams/:examId/tests/:testId/start"
            element={<MockTestStart />}
          />

          <Route
            path="/exams/:examId/tests/:testId/attempt/:attemptId"
            element={<MockTestAttempt />}
          />

          <Route
            path="/exams/:examId/tests/:testId/result/:attemptId"
            element={<MockTestResult />}
          />

          <Route
            path="/payment/:planId"
            element={<Payment />}
          />

          <Route
            path="/payment/success/:paymentId"
            element={<PaymentSuccess />}
          />

          <Route
            path="/notifications"
            element={<Notifications />}
          />

          <Route
            path="/progress"
            element={<ProgressPage />}
          />
        </Route>
      </Route>

      {/* Protected admin pages */}
      <Route element={<AdminProtectedRoute />}>
        <Route
          path="/admin/dashboard"
          element={<AdminDashboard />}
        />

        <Route
          path="/admin/exams"
          element={<AdminExams />}
        />

        <Route
          path="/admin/subjects"
          element={<AdminSubjects />}
        />

        <Route
          path="/admin/questions"
          element={<AdminQuestions />}
        />

        <Route
          path="/admin/tests"
          element={<AdminTests />}
        />

        <Route
          path="/admin/plans"
          element={<AdminPlans />}
        />

        <Route
          path="/admin/notifications"
          element={<AdminNotifications />}
        />

        <Route
          path="/admin/home-content"
          element={<AdminHomeContent />}
        />

        <Route
          path="/admin/students"
          element={<AdminStudents />}
        />

        <Route
          path="/admin/finance"
          element={<AdminFinance />}
        />
      </Route>
    </Routes>
  );
}

export default AppRoutes;