import { Navigate, Route, Routes } from 'react-router-dom';
import AuthApp from '../pages/auth/AuthApp';
import DoctorDashboard from '../pages/doctor/DoctorDashboard';
import ExpertDashboard from '../pages/expert/ExpertDashboard';
import ManagerApp from '../pages/manager/ManagerApp';
import PatientDashboard from '../pages/patient/PatientDashboard';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<AuthApp />} />
      <Route path="/patient-dashboard" element={<PatientDashboard />} />
      <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
      <Route path="/expert-dashboard" element={<ExpertDashboard />} />
      <Route path="/admin-dashboard" element={<ManagerApp />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
