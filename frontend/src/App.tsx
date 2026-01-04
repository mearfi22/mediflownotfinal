import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";
import Queue from "./pages/Queue";
import MedicalRecords from "./pages/MedicalRecords";
import Reports from "./pages/Reports";
import PreListing from "./pages/PreListing";
import PublicDisplay from "./pages/PublicDisplay";
import DoctorManagement from "./pages/DoctorManagement";
import UserManagement from "./pages/UserManagement";
import DepartmentManagement from "./pages/DepartmentManagement";
import SystemSettings from "./pages/SystemSettings";
import AuditLogs from "./pages/AuditLogs";
import SystemAnalytics from "./pages/SystemAnalytics";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/pre-register" element={<PreListing />} />
          <Route path="/public-display" element={<PublicDisplay />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="patients" element={<Patients />} />
            <Route path="queue" element={<Queue />} />
            <Route path="medical-records" element={<MedicalRecords />} />
            <Route path="reports" element={<Reports />} />
            <Route path="doctor-management" element={<DoctorManagement />} />
            <Route path="user-management" element={<UserManagement />} />
            <Route path="department-management" element={<DepartmentManagement />} />
            <Route path="system-settings" element={<SystemSettings />} />
            <Route path="audit-logs" element={<AuditLogs />} />
            <Route path="system-analytics" element={<SystemAnalytics />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;