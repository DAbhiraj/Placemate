import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import RoleRedirect from './components/Auth/RoleRedirect';
import Dashboard from './pages/student/Dashboard';
// import Applications from './pages/student/MyApplications';
import Profile from './pages/student/Profile';
import Alumni from '../waste/Alumini';
import Admin from './pages/admin/Admin';
import OnboardingModal from './components/Auth/OnboardingModal';
import ProfileSetupModal from './components/Auth/ProfileSetupModal';
import JobOpportunities from './pages/student/JobOppurtunities';
import UpcomingDeadlines from './pages/student/Upcoming';
import RecruiterOnboarding from './pages/recruiter/RecruiterOnboarding';
import ViewJobs from './pages/recruiter/ViewJobs';
import SpocMessages from './pages/recruiter/SpocMessages';
import Candidates from './pages/recruiter/Candidates';
import SpocJobNegotiation from './pages/spoc/SpocJobNegotiation';
import SpocAssignedJobs from './pages/spoc/SpocAssignedJobs';
import SpocStudentGroups from './pages/spoc/SpocStudentGroups';
import LinkedInCallback from './pages/LinkedInCallback';
import RecruiterProfile from './pages/recruiter/RecruiterProfile';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/Dashboard';
import CompanyVerification from './pages/admin/CompanyVerification';
import ManageStudents from './pages/admin/ManageStudents';
import SendNotifications from './pages/admin/SendNotificationPage';
import ViewAllJobs from './pages/admin/ViewJobs';
import SpocManagement from './pages/admin/SpocManagement';
import NotificationPage from './pages/NotifcationPage';
import ApplicationForm from "./pages/student/ApplicationForm"


function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Login/>} />
        <Route path="/auth/linkedin/callback" element={<LinkedInCallback />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            {/* Student routes */}
            <Route path="student/dashboard" element={<Dashboard />} />
            <Route path="student/profile" element={<Profile />} />
            <Route path="student/jobs" element={<JobOpportunities />} />
            <Route path="student/upcoming" element={<UpcomingDeadlines />} />
            <Route path="student/notifications" element={<NotificationPage />} />
             <Route path="student/apply/:jobId" element={<ApplicationForm />} />
            
            {/* Admin routes */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/company-verification" element={<CompanyVerification />} />
            <Route path="/admin/students" element={<ManageStudents />} />
            <Route path="/admin/notifications" element={<SendNotifications/>} />
            <Route path="/admin/viewjobs" element={<ViewAllJobs/>} />
            <Route path="/admin/spocmanagement" element={<SpocManagement/>} />
            <Route path="/admin/allnotifications" element={<NotificationPage />} />

            {/* Recruiter routes */}
            <Route path="/recruiter/profile" element={<RecruiterProfile />} />
            <Route path="/recruiter/viewjobs" element={<ViewJobs />} />
            <Route path="/recruiter/profile" element={<RecruiterProfile />} />
            <Route path="/recruiter/spocmsgs" element={<SpocMessages />} />
            <Route path="/recruiter/candidates" element={<Candidates />} />
            <Route path="/recruiter/verification" element={<RecruiterOnboarding />} />
            <Route path="/recruiter/notifications" element={<NotificationPage />} />

            {/* Spoc routes */}
            <Route path="/spoc/assignedjobs" element={<SpocAssignedJobs />} />
            <Route path="/spoc/recruitermsgs" element={<SpocJobNegotiation />} />
            <Route path="/spoc/studentgrp" element={<SpocStudentGroups />} />
            <Route path="/spoc/notifications" element={<NotificationPage />} />
          </Route>
        </Route>
      </Routes>

      {/* Optional modals (if you still want them) */}
      <OnboardingModal
        isOpen={false}
        onClose={() => {}}
        onComplete={() => {}}
      />
      <ProfileSetupModal
        isOpen={false}
        onClose={() => {}}
        onComplete={() => {}}
      />
    </Router>
  );
}

export default App;
