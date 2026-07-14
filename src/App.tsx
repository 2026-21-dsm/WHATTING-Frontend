import { Navigate, Route, Routes } from "react-router-dom";
import { GlobalStyles } from "./styles/GlobalStyles";
import {
  TeacherAlertCreatePage,
  TeacherAlertDashboardPage,
  TeacherAlertTypePage,
  TeacherHelpDetailPage,
  TeacherHelpRequestsPage,
  TeacherHomePage,
  TeacherLoginPage,
  TeacherResultPage,
  TeacherSignupPage,
  TeacherStudentConfirmPage,
  TeacherStudentListPage,
} from "./pages/teacher/TeacherPages";

function App() {
  return (
    <>
      <GlobalStyles />
      <Routes>
        <Route path="/" element={<Navigate to="/teacher/login" replace />} />
        <Route path="/login" element={<Navigate to="/teacher/login" replace />} />
        <Route path="/teacher" element={<Navigate to="/teacher/login" replace />} />
        <Route path="/teacher/login" element={<TeacherLoginPage />} />
        <Route path="/teacher/signup" element={<TeacherSignupPage />} />
        <Route path="/teacher/home" element={<TeacherHomePage />} />
        <Route path="/teacher/active" element={<TeacherAlertDashboardPage />} />
        <Route path="/teacher/alert/new" element={<TeacherAlertCreatePage />} />
        <Route path="/teacher/alert/type" element={<TeacherAlertTypePage />} />
        <Route path="/teacher/students" element={<TeacherStudentListPage />} />
        <Route path="/teacher/students/confirm" element={<TeacherStudentConfirmPage />} />
        <Route path="/teacher/help" element={<TeacherHelpRequestsPage />} />
        <Route path="/teacher/help/detail" element={<TeacherHelpDetailPage />} />
        <Route path="/teacher/result" element={<TeacherResultPage />} />

        <Route path="*" element={<Navigate to="/teacher/login" replace />} />
      </Routes>
    </>
  );
}

export default App;
