import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import Companies from './pages/Companies';
import Applications from './pages/Applications';
import Profile from './pages/Profile';
import Alumni from './pages/Alumini';
import Admin from './pages/Admin';
import LoginPage from './pages/Login';
import JobsPage from './pages/JobPage';

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          {/* Public route (no navbar) */}
          <Route path="/" element={<LoginPage />} />

          {/* Protected routes (with navbar via Layout) */}
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/companies" element={<Companies />} />
            <Route path="/applications" element={<Applications />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/alumni" element={<Alumni />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/jobs" element={<JobsPage />} />
          </Route>
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;
