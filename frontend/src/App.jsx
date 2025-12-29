import React from 'react'; // Refreshed
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminLayout from './pages/admin/AdminLayout';
import AdminJobsPage from './pages/admin/AdminJobsPage';
import AdminCandidatesPage from './pages/admin/AdminCandidatesPage';
import AdminInterviewsPage from './pages/admin/AdminInterviewsPage';
import AdminUsers from './pages/admin/AdminUsers';
import AdminApplications from './pages/admin/AdminApplications';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminLogs from './pages/admin/AdminLogs';
import AdminExports from './pages/admin/AdminExports';

import InterviewerDashboard from './pages/interviewer/InterviewerDashboard';
import InterviewerApplicants from './pages/interviewer/InterviewerApplicants';
import InterviewerInterviews from './pages/interviewer/InterviewerInterviews';
import InterviewerRankings from './pages/interviewer/InterviewerRankings';
import InterviewerQuestionPage from './pages/interviewer/InterviewerQuestionPage.jsx';
import InterviewerLayout from './pages/interviewer/InterviewerLayout';
import CandidateDashboard from './pages/candidate/CandidateDashboard';
import CandidateLayout from './pages/candidate/CandidateLayout';
import CandidateJobsPage from './pages/candidate/CandidateJobsPage';
import CandidateApplicationsPage from './pages/candidate/CandidateApplicationsPage';
import LiveInterviewPage from './pages/interviewer/LiveInterviewPage';
import TestResultPage from './pages/interviewer/TestResultPage';
import CandidateLivePage from './pages/candidate/CandidateLivePage';
import InterviewerHistory from './pages/interviewer/InterviewerHistory';
import InterviewerNotes from './pages/interviewer/InterviewerNotes';
import CandidateResume from './pages/candidate/CandidateResume';
import CandidateInterviewPrep from './pages/candidate/CandidateInterviewPrep';
import CandidateFeedback from './pages/candidate/CandidateFeedback';
import CandidateStatus from './pages/candidate/CandidateStatus';
import HiredCandidates from './pages/interviewer/HiredCandidates';
import NotificationPage from './pages/NotificationPage';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import VerifyEmail from './pages/auth/VerifyEmail';
import HelpCenter from './pages/support/HelpCenter';
import FAQPage from './pages/support/FAQPage';
import ContactSupport from './pages/support/ContactSupport';
import ContactPage from './pages/marketing/ContactPage';
import FeaturesPage from './pages/marketing/FeaturesPage';
import HowItWorksPage from './pages/marketing/HowItWorksPage';
import PricingPage from './pages/marketing/PricingPage';
import ProfilePage from './components/profile/ProfilePage';
import PrivateRoute from './components/PrivateRoute';

import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import Toast from './components/Toast';

const App = () => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <Toast />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/features" element={<FeaturesPage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/help" element={<HelpCenter />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/contact-support" element={<ContactSupport />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/notifications" element={<NotificationPage />} />

            {/* Protected Routes */}
            <Route path="/admin" element={
              <PrivateRoute role="admin">
                <AdminLayout />
              </PrivateRoute>
            }>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="jobs" element={<AdminJobsPage />} />
              <Route path="interviews" element={<AdminInterviewsPage />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="applications" element={<AdminApplications />} />
              <Route path="analytics" element={<AdminAnalytics />} />
              <Route path="candidates" element={<AdminCandidatesPage />} />
              <Route path="logs" element={<AdminLogs />} />
              <Route path="exports" element={<AdminExports />} />

              <Route path="profile" element={<ProfilePage />} />
            </Route>

            {/* Full Screen Live Routes */}
            <Route path="/interviewer/interviews/:id/live" element={
              <PrivateRoute role="interviewer">
                <LiveInterviewPage />
              </PrivateRoute>
            } />
            <Route path="/interviewer/interviews/:id/result" element={
              <PrivateRoute role="interviewer">
                <TestResultPage />
              </PrivateRoute>
            } />
            <Route path="/candidate/interview/:id/prep" element={
              <PrivateRoute role="candidate">
                <CandidateInterviewPrep />
              </PrivateRoute>
            } />
            <Route path="/candidate/interview/:id/feedback" element={
              <PrivateRoute role="candidate">
                <CandidateFeedback />
              </PrivateRoute>
            } />
            <Route path="/candidate/interview/:id" element={
              <PrivateRoute role="candidate">
                <CandidateLivePage />
              </PrivateRoute>
            } />

            <Route path="/interviewer" element={
              <PrivateRoute role="interviewer">
                <InterviewerLayout />
              </PrivateRoute>
            }>
              <Route path="dashboard" element={<InterviewerDashboard />} />
              <Route path="applicants" element={<InterviewerApplicants />} />
              <Route path="interviews" element={<InterviewerInterviews />} />
              <Route path="interviews/:id/notes" element={<InterviewerNotes />} />
              <Route path="question-bank" element={<InterviewerQuestionPage />} />
              <Route path="rankings" element={<InterviewerRankings />} />
              <Route path="hired" element={<HiredCandidates />} />
              <Route path="history" element={<InterviewerHistory />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>

            <Route path="/candidate" element={
              <PrivateRoute role="candidate">
                <CandidateLayout />
              </PrivateRoute>
            }>
              <Route path="dashboard" element={<CandidateDashboard />} />
              <Route path="jobs" element={<CandidateJobsPage />} />
              <Route path="applications" element={<CandidateApplicationsPage />} />
              <Route path="applications/:id/status" element={<CandidateStatus />} />
              <Route path="interviews/:id/prepare" element={<CandidateInterviewPrep />} />
              <Route path="resume" element={<CandidateResume />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>
          </Routes>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
};

export default App;
