import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/student/Dashboard';
import Applications from './pages/student/MyApplications';
import Profile from './pages/student/Profile';
import Alumni from '../waste/Alumini';
import Admin from './pages/admin/Admin';
import OnboardingModal from './components/Auth/OnboardingModal';
import ProfileSetupModal from './components/Auth/ProfileSetupModal';
import JobOpportunities from './pages/student/JobOppurtunities';
import UpcomingDeadlines from './pages/student/Upcoming';
import AdminLogin from './pages/admin/AdminLogin';
import NormalAuth from './pages/NormalLogin';
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


function App() {
  return (
    <Router>
     
      <Routes>
        {/* Public route */}
        <Route path="/" element={<Login />} />
          <Route path="/adminlogin" element={<AdminLogin />} />
          <Route path="/login" element={<NormalAuth />} />
          <Route path="/onboarding" element={<ProfileSetupModal />} />
          <Route path="/auth/linkedin/callback" element={<LinkedInCallback />} />
          <Route path="/recruiter/verification" element={<RecruiterOnboarding />} />

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
          {/* <Route path="/spoc/dashboard" element={<SpocDashboard />} /> */}
          <Route path="/spoc/assignedjobs" element={<SpocAssignedJobs />} />
          <Route path="/spoc/recruitermsgs" element={<SpocJobNegotiation />} />
          <Route path="/spoc/studentgrp" element={<SpocStudentGroups />} />
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
