import { Navigate, Route, Routes } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Departments from "./pages/Departments";
import Professors from "./pages/Professors";
import Courses from "./pages/Courses";
import Students from "./pages/Students";
import Enrollments from "./pages/Enrollments";
import StudentDashboard from "./pages/StudentDashboard";
import ProfessorDashboard from "./pages/ProfessorDashboard";
import AttendanceQR from "./pages/AttendanceQR";
import StudentScan from "./pages/StudentScan";
import ProfessorAttendanceReport from "./pages/ProfessorAttendanceReport";
import ProfessorCourseAttendance from "./pages/ProfessorCourseAttendance";
import StudentAttendance from "./pages/StudentAttendance";

import { useAuth } from "./context/AuthContext";

function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { token } = useAuth();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function RoleRoute({
  role,
  children,
}: {
  role: "ADMIN" | "PROFESSOR" | "STUDENT";
  children: React.ReactNode;
}) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== role) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function App() {
  return (
    <Routes>

      <Route path="/login" element={<Login />} />

      <Route
        path="/register"
        element={<Register />}
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <RoleRoute role="ADMIN">
              <AdminDashboard />
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/departments"
        element={
          <ProtectedRoute>
            <RoleRoute role="ADMIN">
              <Departments />
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/professors"
        element={
          <ProtectedRoute>
            <RoleRoute role="ADMIN">
              <Professors />
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/courses"
        element={
          <ProtectedRoute>
            <RoleRoute role="ADMIN">
              <Courses />
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/students"
        element={
          <ProtectedRoute>
            <RoleRoute role="ADMIN">
              <Students />
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/enrollments"
        element={
          <ProtectedRoute>
            <RoleRoute role="ADMIN">
              <Enrollments />
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/professor"
        element={
          <ProtectedRoute>
            <RoleRoute role="PROFESSOR">
              <ProfessorDashboard />
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/professor/attendance"
        element={
          <ProtectedRoute>
            <RoleRoute role="PROFESSOR">
              <AttendanceQR />
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/professor/attendance-report"
        element={
          <ProtectedRoute>
            <RoleRoute role="PROFESSOR">
              <ProfessorAttendanceReport />
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/professor/course-attendance"
        element={
          <ProtectedRoute>
            <RoleRoute role="PROFESSOR">
              <ProfessorCourseAttendance />
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/student"
        element={
          <ProtectedRoute>
            <RoleRoute role="STUDENT">
              <StudentDashboard />
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/student/scan"
        element={
          <ProtectedRoute>
            <RoleRoute role="STUDENT">
              <StudentScan />
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/student/attendance"
        element={
          <ProtectedRoute>
            <RoleRoute role="STUDENT">
              <StudentAttendance />
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/"
        element={<Navigate to="/dashboard" replace />}
      />

      <Route
        path="*"
        element={<Navigate to="/dashboard" replace />}
      />
    </Routes>
  );
}

export default App;