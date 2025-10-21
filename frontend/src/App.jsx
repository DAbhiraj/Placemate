import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Applications from './pages/Applications';
import Profile from './pages/Profile';
import Alumni from './pages/Alumini';
import Admin from './pages/Admin';
import OnboardingModal from './components/Auth/OnboardingModal';
import ProfileSetupModal from './components/Auth/ProfileSetupModal';
import JobOpportunities from './pages/JobOppurtunities';
import UpcomingDeadlines from './pages/Upcoming';
import { AppProvider } from './context/AppContext'; // <-- Import the provid

function App() {
  return (
    <Router>
      <AppProvider>
      <Routes>
        {/* Public route */}
        <Route path="/" element={<Login />} />

        {/* Routes with navbar (via Layout) */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/applications" element={<Applications />} />
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
