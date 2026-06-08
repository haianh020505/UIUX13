import { Component, Suspense, lazy, type ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import AuthApp from '../pages/auth/AuthApp';

const DoctorDashboard = lazy(() => import('../pages/doctor/DoctorDashboard'));
const ManagerApp = lazy(() => import('../pages/manager/ManagerApp'));
const PatientDashboard = lazy(() => import('../pages/patient/PatientDashboard'));

export default function AppRoutes() {
  return (
    <RouteErrorBoundary>
      <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-sm font-bold text-slate-500">Đang tải...</div>}>
        <Routes>
          <Route path="/" element={<AuthApp />} />
          <Route path="/patient-dashboard" element={<PatientDashboard />} />
          <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
          <Route path="/doctor/prescription" element={<DoctorDashboard />} />
          <Route path="/admin-dashboard" element={<ManagerApp />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </RouteErrorBoundary>
  );
}

class RouteErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
          <div className="max-w-lg rounded-xl border border-rose-200 bg-white p-5 text-center shadow-sm">
            <h1 className="text-lg font-extrabold text-rose-600">Không tải được giao diện role</h1>
            <p className="mt-2 text-sm font-semibold text-slate-500">{this.state.error.message}</p>
            <button type="button" onClick={() => window.location.assign(import.meta.env.BASE_URL)} className="mt-4 rounded-lg bg-brand px-4 py-2 text-sm font-bold text-white">
              Quay lại đăng nhập
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
