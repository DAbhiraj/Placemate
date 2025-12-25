import React, { useState, useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { GraduationCap, Bell, User, ChevronDown, Menu, X } from "lucide-react"
import { Briefcase, Users, MessageSquare } from "lucide-react"
import axios from "axios"
import axiosClient from "../../api/axiosClient"

const API_URL = import.meta.env.VITE_API_URL




const Navbar = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [currentUser, setCurrentUser] = useState(null)
  const [userRole, setUserRole] = useState("student")
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [loadingNotifications, setLoadingNotifications] = useState(false)

  const getNotificationTypeColor = type => {
  switch (type?.toLowerCase()) {
    case "success":
      return "bg-green-50 border-green-200"
    case "warning":
      return "bg-yellow-50 border-yellow-200"
    case "error":
      return "bg-red-50 border-red-200"
    case "info":
      return "bg-blue-50 border-blue-200"
    default:
      return "bg-gray-50 border-gray-200"
  }
}

  useEffect(() => {
    const user = localStorage.getItem("name")
    const email = localStorage.getItem("email")
    const branch = localStorage.getItem("branch")
    const cgpa = localStorage.getItem("cgpa")
    const role = localStorage.getItem("role")
    const userId = localStorage.getItem("id")

    if (user && email && role) {
      setCurrentUser({
        name: user,
        email,
        branch,
        cgpa,
        role,
        id: userId
      })
      setUserRole(role.toLowerCase())

      if (userId) {
        fetchNotifications(userId)
      }
    }
  }, [])

  // Refresh notifications periodically to ensure count is up-to-date
  useEffect(() => {
    if (!currentUser?.id) return

    // Fetch notifications immediately
    fetchNotifications(currentUser.id)

    // Set up interval to refresh every 30 seconds
    const interval = setInterval(() => {
      fetchNotifications(currentUser.id)
    }, 30000)

    return () => clearInterval(interval)
  }, [currentUser?.id])

  const fetchNotifications = async() => {
    try {
      setLoadingNotifications(true)
      const response = await axiosClient.get(`/notifications`)
      setNotifications(response.data)
    } catch (error) {
      console.error("Failed to fetch notifications:", error)
    } finally {
      setLoadingNotifications(false)
    }
  }

  const markAsRead = async notificationId => {
    try {
      if (!currentUser?.id) return
      await axiosClient.put(`/notifications/${notificationId}/read`)
      setNotifications(prev =>
        prev.map(notif =>
          notif.notification_id === notificationId
            ? { ...notif, is_read: true }
            : notif
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

  const role = (localStorage.getItem("role") || "").toLowerCase()

  const navItems =
    role === "admin"
      ? [
          // { path: "/admin/dashboard", label: "Dashboard" },
          { path: "/admin/company-verification", label: "Verification" },
          { path: "/admin/students", label: "Students" },
          { path: "/admin/notifications", label: "Notifications" },
          { path: "/admin/spocmanagement", label: "Spocs" }
        ]
      : role === "recruiter"
      ? [
          { path: "/recruiter/viewjobs", label: "View Jobs", icon: Briefcase },
          {
            path: "/recruiter/spocmsgs",
            label: "SPOC Messages",
            icon: MessageSquare
          }
        ]
      : role === "spoc"
      ? [
          {
            path: "/spoc/assignedjobs",
            label: "Assigned Companies",
            icon: Briefcase
          },
          {
            path: "/spoc/recruitermsgs",
            label: "Recruiter Messages",
            icon: MessageSquare
          },
          { path: "/spoc/studentgrp", label: "Student groups", icon: Users }
        ]
      : role === "student"
      ? [
          { path: "/student/dashboard", label: "Dashboard" },
          { path: "/student/upcoming", label: "Upcoming Deadlines" },
          { path: "/student/jobs", label: "Jobs" }
        ]
      : []

  const navigateToNotifications = () => {
    const roleLower = (localStorage.getItem("role") || "").toLowerCase()
    const routeMap = {
      student: "/student/notifications",
      recruiter: "/recruiter/notifications",
      spoc: "/spoc/notifications",
      admin: "/admin/allnotifications"
    }
    if (currentUser?.id) {
      fetchNotifications(currentUser.id)
    }
    navigate(routeMap[roleLower] || "/student/notifications")
  }

  const handleSignOut = async () => {
    try {
      await axios.post(`${API_URL}/auth/logout`, {}, { withCredentials: true })
    } catch (err) {
      console.error("Logout failed", err)
    } finally {
      sessionStorage.clear()
      localStorage.clear()
      window.location.href = "/"
    }
  }

  return (
    <nav className="bg-white shadow-lg border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo Section */}
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center"><img
                  src="../../../public/NIT.png"
                  alt="Graduation Cap"
                  className="h-10 w-6 sm:h-8 sm:w-8"
                />

              <div className="ml-2 sm:ml-3">
                <h1 className="text-base sm:text-xl font-bold text-gray-900">
                  NIT Warangal
                </h1>
                <p className="text-xs text-gray-500 hidden sm:block">
                  Career & Placement Portal
                </p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              {navItems.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Notifications - Desktop */}
            <div className="relative">
              <button
                onClick={navigateToNotifications}
                className="relative p-2 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
              >
                <Bell className="h-5 w-5" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadNotifications}
                  </span>
                )}
              </button>
            </div>

            {/* User Menu - Desktop */}
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
                    <Link
                      to={
                        localStorage.getItem("role") === "recruiter"
                          ? "/recruiter/profile"
                          : "/student/profile"
                      }
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowUserMenu(false)}
                    >
                      Profile Settings
                    </Link>
                    <button
                      onClick={() => {
                        handleSignOut()
                        setShowUserMenu(false)
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

          {/* Mobile Menu Button & Icons */}
          <div className="flex md:hidden items-center space-x-2">
            {/* Notifications - Mobile */}
            <div className="relative">
              <button
                onClick={navigateToNotifications}
                className="relative p-2 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
              >
                <Bell className="h-5 w-5" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadNotifications > 9 ? "9+" : unreadNotifications}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="fixed inset-x-4 top-20 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50 max-w-md mx-auto">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-medium text-gray-900">
                        Notifications
                      </h3>
                      <button
                        onClick={() => setShowNotifications(false)}
                        className="text-gray-400 hover:text-gray-600 text-2xl"
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
                            onClick={() => {
                              if (!notification.is_read)
                                markAsRead(notification.notification_id)
                              setShowNotifications(false)
                            }}
                            className={`p-3 rounded-lg border cursor-pointer ${getNotificationTypeColor(
                              notification.type
                            )} ${
                              !notification.is_read
                                ? "ring-2 ring-blue-200"
                                : ""
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
                                  {new Date(
                                    notification.created_at
                                  ).toLocaleDateString()}
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

            {/* Hamburger Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              {showMobileMenu ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setShowMobileMenu(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive(item.path)
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Mobile User Section */}
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="px-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <User className="h-10 w-10 rounded-full bg-gray-200 p-2 text-gray-500" />
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">
                    {currentUser?.name || "User"}
                  </div>
                  <div className="text-sm font-medium text-gray-500">
                    {currentUser?.email}
                  </div>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                <Link
                  to={
                    localStorage.getItem("role") === "recruiter"
                      ? "/recruiter/profile"
                      : "/student/profile"
                  }
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Profile Settings
                </Link>
                <button
                  onClick={() => {
                    handleSignOut()
                    setShowMobileMenu(false)
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
