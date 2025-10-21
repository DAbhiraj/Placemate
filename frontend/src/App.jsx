import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Layout from './components/Layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Applications from './pages/Applications';
import Profile from './pages/Profile';
import Alumni from './pages/Alumini';
import Admin from './pages/Admin';
import OnboardingModal from './components/Auth/OnboardingModal';

function AppContent() {
  const { isAuthenticated, showOnboarding, handleOnboardingComplete } = useApp();

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <>
      <Router>
        <Routes>
          {/* Public route (no navbar) */}
          <Route path="/" element={<LoginPage />} />

          {/* Protected routes (with navbar via Layout) */}
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            {/* <Route path="/companies" element={<Companies />} /> */}
            <Route path="/applications" element={<Applications />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/alumni" element={<Alumni />} />
            <Route path="/admin" element={<Admin />} />
            {/* <Route path="/jobs" element={<JobsPage />} /> */}
            <Route path="/jobs" element={<JobOpportunities />} />
            <Route path="/upcoming" element={<UpcomingDeadlines />} />
          </Route>
        </Routes>
      </Router>
      
      {showOnboarding && (
        <OnboardingModal
          isOpen={showOnboarding}
          onClose={() => {}} // Prevent closing until completed
          onComplete={handleOnboardingComplete}
        />
      )}
    </>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
