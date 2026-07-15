import { Navigate, Route, Routes } from "react-router-dom";
import { GlobalStyles } from "./styles/GlobalStyles";
import {
  TeacherAlertCreatePage,
  TeacherAlertDashboardPage,
  TeacherAlertTypePage,
  TeacherDashboardPage,
  TeacherHelpDetailPage,
  TeacherHelpRequestsPage,
  TeacherHomePage,
  TeacherResultPage,
  TeacherSignupPage,
  TeacherStudentConfirmPage,
  TeacherStudentListPage,
} from "./pages/teacher/TeacherPages";
import {
  StudentActiveAlertPage,
  StudentHelpRequestPage,
  StudentHomePage,
  StudentMyHelpPage,
  StudentSignupPage,
} from "./pages/student/StudentPages";
import { LoginPage } from "./pages/auth/LoginPage";

function App() {
  return (
    <>
      <GlobalStyles />
      <Routes>
        <Route path="/" element={<Navigate to="/teacher/login" replace />} />
        <Route path="/login" element={<Navigate to="/teacher/login" replace />} />
        <Route path="/teacher" element={<Navigate to="/teacher/login" replace />} />
        <Route path="/teacher/login" element={<LoginPage signupRole="teacher" />} />
        <Route path="/teacher/signup" element={<TeacherSignupPage />} />
        <Route path="/teacher/home" element={<TeacherHomePage />} />
        <Route path="/teacher/active" element={<TeacherAlertDashboardPage />} />
        <Route path="/teacher/alert/new" element={<TeacherAlertCreatePage />} />
        <Route path="/teacher/alert/type" element={<TeacherAlertTypePage />} />
        <Route path="/teacher/students" element={<TeacherStudentListPage />} />
        <Route path="/teacher/students/confirm" element={<TeacherStudentConfirmPage />} />
        <Route path="/teacher/help" element={<TeacherHelpRequestsPage />} />
        <Route path="/teacher/help/detail" element={<Navigate to="/teacher/help" replace />} />
        <Route path="/teacher/help/:helpRequestId" element={<TeacherHelpDetailPage />} />
        <Route path="/teacher/dashboard" element={<TeacherDashboardPage />} />
        <Route path="/teacher/result" element={<TeacherResultPage />} />

        <Route path="/student/login" element={<LoginPage signupRole="student" />} />
        <Route path="/student/signup" element={<StudentSignupPage />} />
        <Route path="/student/home" element={<StudentHomePage />} />
        <Route path="/student/alerts" element={<StudentActiveAlertPage />} />
        <Route path="/student/help/new" element={<StudentHelpRequestPage />} />
        <Route path="/student/help/me" element={<StudentMyHelpPage />} />

        <Route path="*" element={<Navigate to="/teacher/login" replace />} />
      </Routes>
    </>
  );
}

export default App;
