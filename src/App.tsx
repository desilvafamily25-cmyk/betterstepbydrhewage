import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

import { AuthPage } from './pages/auth/AuthPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';

import { PatientHome } from './pages/patient/PatientHome';
import { PatientOnboarding } from './pages/patient/PatientOnboarding';
import { PatientCheckIn } from './pages/patient/PatientCheckIn';
import { PatientMedication } from './pages/patient/PatientMedication';
import { PatientProgress } from './pages/patient/PatientProgress';
import { PatientReminders } from './pages/patient/PatientReminders';
import { PatientEducation } from './pages/patient/PatientEducation';
import { PatientReviewSummary } from './pages/patient/PatientReviewSummary';
import { PatientBookReview } from './pages/patient/PatientBookReview';

import { ClinicianDashboard } from './pages/clinician/ClinicianDashboard';
import { ClinicianPatientDetail } from './pages/clinician/ClinicianPatientDetail';
import { ClinicianFlags } from './pages/clinician/ClinicianFlags';
import { ClinicianTemplates } from './pages/clinician/ClinicianTemplates';
import { ClinicianSettings } from './pages/clinician/ClinicianSettings';

function LoadingScreen() {
  return (
    <div className="min-h-dvh bg-gradient-to-br from-[#0f2640] to-[#135c47] flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 rounded-3xl bg-white/10 flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl font-black text-white">BS</span>
        </div>
        <div className="w-8 h-1 bg-white/30 rounded-full mx-auto overflow-hidden">
          <div className="h-full w-1/2 bg-white rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const { user, role, patientId, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  // Determine where to redirect from root
  const rootRedirect = () => {
    if (!user) return '/auth';
    if (role === 'clinician') return '/clinician/dashboard';
    if (role === 'patient') {
      return patientId ? '/patient/home' : '/patient/onboarding';
    }
    return '/patient/onboarding';
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Auth routes */}
        <Route path="/auth" element={user ? <Navigate to={rootRedirect()} replace /> : <AuthPage />} />
        <Route path="/auth/reset-password" element={<ResetPasswordPage />} />

        {/* Root redirect */}
        <Route path="/" element={<Navigate to={rootRedirect()} replace />} />

        {/* Patient routes — require authentication */}
        {user && (role === 'patient' || role === null) && (
          <>
            {/* Onboarding: accessible whether or not patient record exists */}
            <Route path="/patient/onboarding" element={<PatientOnboarding />} />

            {/* Protected patient routes — require completed onboarding */}
            {patientId ? (
              <>
                <Route path="/patient/home" element={<PatientHome />} />
                <Route path="/patient/check-in" element={<PatientCheckIn />} />
                <Route path="/patient/medication" element={<PatientMedication />} />
                <Route path="/patient/progress" element={<PatientProgress />} />
                <Route path="/patient/reminders" element={<PatientReminders />} />
                <Route path="/patient/education" element={<PatientEducation />} />
                <Route path="/patient/review-summary" element={<PatientReviewSummary />} />
                <Route path="/patient/book-review" element={<PatientBookReview />} />
              </>
            ) : (
              /* No patient record yet — redirect everything to onboarding */
              <Route path="/patient/*" element={<Navigate to="/patient/onboarding" replace />} />
            )}
          </>
        )}

        {/* Clinician routes */}
        {user && role === 'clinician' && (
          <>
            <Route path="/clinician/dashboard" element={<ClinicianDashboard />} />
            <Route path="/clinician/patient/:id" element={<ClinicianPatientDetail />} />
            <Route path="/clinician/flags" element={<ClinicianFlags />} />
            <Route path="/clinician/templates" element={<ClinicianTemplates />} />
            <Route path="/clinician/settings" element={<ClinicianSettings />} />
          </>
        )}

        {/* Fallback */}
        <Route path="*" element={<Navigate to={rootRedirect()} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
