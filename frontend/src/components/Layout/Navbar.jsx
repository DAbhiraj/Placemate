import React, { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import { GraduationCap, Bell, User, ChevronDown } from "lucide-react"
import { getNotificationTypeColor } from "../../utils/helpers"
import axios from "axios"

const API_URL = import.meta.env.VITE_API_URL ;

const Navbar = () => {
  const location = useLocation()
  const { currentUser, userRole, setUserRole } = useApp()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [loadingNotifications, setLoadingNotifications] = useState(false)

  // Fetch user info from localStorage on mount
  useEffect(() => {
    console.log("--- Navbar component rendering... ---");
    const user = localStorage.getItem("name")
    const email = localStorage.getItem("email")
    const branch = localStorage.getItem("branch")
    const cgpa = localStorage.getItem("cgpa")
    const role = localStorage.getItem("role")
    const userId = localStorage.getItem("id")

    if (user && email && branch && cgpa && role) {
      setCurrentUser({
        name: user,
        email,
        branch,
        cgpa,
        role,
        id: userId
      })
      setUserRole(role.toLowerCase()) // for nav logic

      // Fetch notifications if user is a student
      console.log(role.toLowerCase() === "student");
      if (role.toLowerCase() === "student" && userId) {
        fetchNotifications(userId)
      }
    }
  }, [])

  // Fetch notifications from backend
  const fetchNotifications = async (userId) => {
    try {
      setLoadingNotifications(true)
      console.log("response in navbar1");
      const response = await axios.get(`${API_URL}/notifications/${userId}`)
      console.log("response in navbar2");
      console.log(response.data);
      setNotifications(response.data)
    } catch (error) {
      console.error("Failed to fetch notifications:", error)
    } finally {
      setLoadingNotifications(false)
    }
  }

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`${API_URL}/notifications/${notificationId}/read`)
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, is_read: true } : notif
        )
      )
    } catch (error) {
      console.error("Failed to mark notification as read:", error)
    }
  }

  const unreadNotifications = notifications.filter(n => !n.is_read).length

  const isActive = path => {
    return location.pathname === path
  }

  const role = localStorage.getItem("role"); // get role from localStorage

  const navItems = role.toLowerCase() === "admin"
    ? [
      { path: "/admin", label: "Admin Panel" }
    ]
    : [
      { path: "/dashboard", label: "Dashboard" },
      { path: "/upcoming", label: "Upcoming Deadlines" },
      { path: "/jobs", label: "Jobs" },
      { path: "/applications", label: "My Applications" },
      { path: "/alumni", label: "Alumni Stories" },
    ];


  const handleSignOut = () => {
    localStorage.clear()
    window.location.href = "/" // redirect to login page
  }

  return (
    <nav className="bg-white shadow-lg border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center">
              <GraduationCap className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <h1 className="text-xl font-bold text-gray-900">
                  NIT Warangal
                </h1>
                <p className="text-xs text-gray-500">
                  Career & Placement Portal
                </p>
              </div>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive(item.path)
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                    }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications)
                  if (!showNotifications && currentUser?.id) {
                    fetchNotifications(currentUser.id)
                  }
                }}
                className="relative p-2 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
              >
                <Bell className="h-5 w-5" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadNotifications}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-medium text-gray-900">
                        Notifications
                      </h3>
                      <button
                        onClick={() => setShowNotifications(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        ×
                      </button>
                    </div>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {loadingNotifications ? (
                        <p className="text-gray-500 text-center py-4">
                          Loading notifications...
                        </p>
                      ) : notifications.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">
                          No notifications
                        </p>
                      ) : (
                        notifications.map(notification => (
                          <div
                            key={notification.id}
                            onClick={() => !notification.is_read && markAsRead(notification.id)}
                            className={`p-3 rounded-lg border cursor-pointer ${getNotificationTypeColor(
                              notification.type
                            )} ${!notification.is_read ? "ring-2 ring-blue-200" : ""
                              }`}
                          >
                            <div className="flex items-start">
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">
                                  {notification.title}
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {new Date(notification.created_at).toLocaleDateString()}
                                </p>
                              </div>
                              {!notification.is_read && (
                                <div className="ml-2 w-2 h-2 bg-blue-600 rounded-full"></div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors"
              >
                <User className="h-5 w-5" />
                <span className="text-sm font-medium">
                  {currentUser?.name || "User"}
                </span>
                <ChevronDown className="h-4 w-4" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                  <div className="py-1">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {currentUser?.name}
                      </p>
                    </div>
                    {/* <button
                      onClick={() => {
                        setUserRole(
                          userRole === "student" ? "admin" : "student"
                        )
                        setShowUserMenu(false)
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Switch to {userRole === "student" ? "Admin" : "Student"}
                    </button> */}
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowUserMenu(false)}
                    >
                      Profile Settings
                    </Link>
                    <button 
                      onClick={() => {
                        handleSignOut();
                        setShowUserMenu(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
