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
import RecruiterDashboard from './pages/recruiter/RecruiterDashboard';
import RecruiterProfile from './pages/recruiter/RecruiterProfile';
import Login from './pages/Login';


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
            <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/applications" element={<Applications />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/alumni" element={<Alumni />} />
            <Route path="/jobs" element={<JobOpportunities />} />
            <Route path="/upcoming" element={<UpcomingDeadlines />} />
            
            {/* Admin routes */}
            <Route path="/admin" element={<Admin />} />

            {/* Recruiter routes */}
            <Route path="/recruiter/viewjobs" element={<ViewJobs />} />
            <Route path="/recruiter/profile" element={<RecruiterProfile />} />
            <Route path="/recruiter/spocmsgs" element={<SpocMessages />} />
            <Route path="/recruiter/candidates" element={<Candidates />} />

            {/* Spoc routes */}
            <Route path="/spoc/assignedjobs" element={<SpocAssignedJobs />} />
            <Route path="/spoc/recruitermsgs" element={<SpocJobNegotiation />} />
            <Route path="/spoc/studentgrp" element={<SpocStudentGroups />} />
            <Route path="/recruiter/verification" element={<RecruiterOnboarding />} />
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
