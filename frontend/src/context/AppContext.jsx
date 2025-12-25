import React, { createContext, useContext, useState, useEffect } from "react"
import axiosClient from "../api/axiosClient"

const AppContext = createContext(undefined)

export const useApp = () => {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider")
  }
  return context
}

export const AppProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [userRole, setUserRole] = useState("student")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showProfileSetup, setShowProfileSetup] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [companies] = useState([
    {
      id: "1",
      name: "Amazon",
      logo: "🔍",
      package: "₹45-55 LPA",
      location: "Bangalore, Hyderabad",
      eligibleBranches: [
        "Computer Science",
        "Electronics",
        "Information Technology"
      ],
      minCGPA: 8.0,
      deadline: "2025-09-26",
      jobType: "Full-time",
      description:
        "Software Engineer role focusing on scalable systems and innovative solutions.",
      requirements: [
        "Strong programming skills",
        "8.0+ CGPA",
        "Problem-solving abilities"
      ],
      appliedCount: 156
    },
    {
      id: "2",
      name: "Microsoft",
      logo: "🪟",
      package: "₹42-50 LPA",
      location: "Hyderabad, Bangalore",
      eligibleBranches: [
        "Computer Science",
        "Information Technology",
        "Electronics"
      ],
      minCGPA: 7.5,
      deadline: "2025-02-20",
      jobType: "Full-time",
      description:
        "Join Microsoft to build next-generation cloud and AI solutions.",
      requirements: ["Cloud technologies", "7.5+ CGPA", "Team collaboration"],
      appliedCount: 203
    },
    {
      id: "3",
      name: "Amazon",
      logo: "📦",
      package: "₹40-48 LPA",
      location: "Chennai, Hyderabad",
      eligibleBranches: ["Computer Science", "Electronics", "Mechanical"],
      minCGPA: 7.0,
      deadline: "2025-02-25",
      jobType: "Full-time",
      description:
        "Software Development Engineer role in AWS and e-commerce platforms.",
      requirements: ["System design", "7.0+ CGPA", "Leadership principles"],
      appliedCount: 189
    }
  ])

  const [applications, setApplications] = useState([
    {
      id: "1",
      studentId: "1",
      companyId: "1",
      status: "interviewed",
      appliedDate: "2025-01-15",
      lastUpdate: "2025-01-20"
    },
    {
      id: "2",
      studentId: "1",
      companyId: "2",
      status: "shortlisted",
      appliedDate: "2025-01-18",
      lastUpdate: "2025-01-22"
    }
  ])

  const [students] = useState([
    {
      id: "1",
      name: "Arjun Sharma",
      email: "arjun.sharma@student.nitw.ac.in",
      rollNumber: "21071A0501",
      branch: "Computer Science",
      cgpa: 8.5,
      skills: ["React", "Node.js", "Python", "Machine Learning"],
      resumeScore: 85,
      status: "approved",
      profileComplete: true
    },
    {
      id: "2",
      name: "Priya Reddy",
      email: "priya.reddy@student.nitw.ac.in",
      rollNumber: "21071A0502",
      branch: "Electronics",
      cgpa: 9.2,
      skills: ["VLSI", "Embedded Systems", "C++", "MATLAB"],
      resumeScore: 92,
      status: "approved",
      profileComplete: true
    }
  ])

  // Check authentication on app load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Verify token and get user data
      axiosClient.get('/profile')
        .then(res => {
          if (res.data.success) {
            setCurrentUser(res.data.data);
            setIsAuthenticated(true);
            setShowOnboarding(!res.data.data.profile_completed);
            setShowProfileSetup(!res.data.data.branch || !res.data.data.cgpa);
          } else {
            localStorage.removeItem('token');
          }
        })
        .catch(() => {
          localStorage.removeItem('token');
        });
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      setNotifications([
        {
          id: "1",
          title: "Google Interview Scheduled",
          message:
            "Your technical interview is scheduled for Jan 25, 2025 at 2:00 PM",
          type: "interview",
          date: "2025-01-23",
          read: false
        },
        {
          id: "2",
          title: "Microsoft Application Deadline",
          message: "Application deadline is approaching - Feb 20, 2025",
          type: "deadline",
          date: "2025-01-22",
          read: false
        },
        {
          id: "3",
          title: "Profile Score Updated",
          message: "Your resume score has been updated to 85/100",
          type: "general",
          date: "2025-01-21",
          read: true
        }
      ]);
    }
  }, [isAuthenticated])

  const markNotificationAsRead = id => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    )
  }

  const addApplication = application => {
    setApplications(prev => [...prev, application])
  }

  const updateApplicationStatus = (id, status) => {
    setApplications(prev =>
      prev.map(app =>
        app.id === id
          ? {
              ...app,
              status,
              lastUpdate: new Date().toISOString().split("T")[0]
            }
          : app
      )
    )
  }

  const handleGoogleSignIn = (user) => {
    setCurrentUser(user.user);
    setIsAuthenticated(true);
    setShowOnboarding(!user.profile_completed);
    setShowProfileSetup(!user.branch || !user.cgpa);
  };

  const handleOnboardingComplete = (userData) => {
    setCurrentUser(prev => ({ ...prev, ...userData, profile_completed: true }));
    setShowOnboarding(false);
  };

  const handleProfileSetupComplete = (userData) => {
    setCurrentUser(prev => ({ ...prev, ...userData }));
    setShowProfileSetup(false);
  };

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
    setIsAuthenticated(false);
    setShowOnboarding(false);
    setShowProfileSetup(false);
  };

  const value = {
    currentUser,
    userRole,
    isAuthenticated,
    showOnboarding,
    showProfileSetup,
    notifications,
    companies,
    applications,
    students,
    setCurrentUser,
    setUserRole,
    setIsAuthenticated,
    setShowOnboarding,
    setShowProfileSetup,
    setNotifications,
    markNotificationAsRead,
    addApplication,
    updateApplicationStatus,
    handleGoogleSignIn,
    handleOnboardingComplete,
    handleProfileSetupComplete,
    handleSignOut
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
