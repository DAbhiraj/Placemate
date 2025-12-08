import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/student/Dashboard';
// import Applications from './pages/student/MyApplications';
import Profile from './pages/student/Profile';
import Alumni from '../waste/Alumini';
import Admin from './pages/admin/Admin';
import OnboardingModal from './components/Auth/OnboardingModal';
import ProfileSetupModal from './components/Auth/ProfileSetupModal';
import JobOpportunities from './pages/student/JobOppurtunities';
import UpcomingDeadlines from './pages/student/Upcoming';
import { AppProvider } from './context/AppContext'; // <-- Import the provid
import AdminLogin from './pages/admin/AdminLogin';
import NormalAuth from './pages/NormalLogin';


function App() {
  return (
    <Router>
      <AppProvider>
      <Routes>
        {/* Public route */}
        <Route path="/" element={<Login />} />
          <Route path="/adminlogin" element={<AdminLogin />} />
          <Route path="/login" element={<NormalAuth />} />
          <Route path="/onboarding" element={<ProfileSetupModal />} />

        {/* Routes with navbar (via Layout) */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          {/* <Route path="/applications" element={<Applications />} /> */}
          <Route path="/profile" element={<Profile />} />
          <Route path="/alumni" element={<Alumni />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/jobs" element={<JobOpportunities />} />
          <Route path="/upcoming" element={<UpcomingDeadlines />} />
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
      </AppProvider>
    </Router>
  );
}

export default App;
