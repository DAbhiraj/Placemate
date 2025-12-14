import React, { useState, useEffect } from "react"
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  Info,
  MessageSquare,
  Briefcase,
  Calendar,
  Award,
  Trash2,
  Filter,
  X
} from "lucide-react"
import axiosClient from "../api/axiosClient"

const NotificationPage = () => {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState("all")
  const [showMobileFilter, setShowMobileFilter] = useState(false)
  const [sortBy, setSortBy] = useState("newest")

 

  useEffect(() => {
      fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const response = await axiosClient.get(`/notifications`)
      setNotifications(response.data || [])
    } catch (error) {
      console.error("Failed to fetch notifications:", error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async notificationId => {
    try {
      await axiosClient.put(`/notifications/${notificationId}/read`)
      setNotifications(prev =>
        prev.map(notif =>
          notif.notification_id === notificationId
            ? { ...notif, is_read: true }
            : notif
        )
      )
    } catch (error) {
      console.error("Failed to mark as read:", error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const unread = notifications.filter(n => !n.is_read)
      await Promise.all(
        unread.map(n =>
          axiosClient.put(`/notifications/${n.notification_id}/read`)
        )
      )
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    } catch (error) {
      console.error("Failed to mark all as read:", error)
    }
  }

  const deleteNotification = async id => {
    try {
      await axiosClient.delete(`/notifications/${id}`)
      setNotifications(prev =>
        prev.filter(notif => notif.notification_id !== id)
      )
    } catch (error) {
      console.error("Failed to delete notification:", error)
    }
  }

  const getFilteredNotifications = () => {
    let filtered = notifications

    if (activeFilter !== "all") {
      filtered = filtered.filter(n => n.type === activeFilter)
    }

    if (sortBy === "oldest") {
      return filtered.sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      )
    }

    return filtered.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
  }

  const getNotificationIcon = type => {
    const iconProps = { className: "h-5 w-5" }
    switch (type) {
      case "job":
        return <Briefcase {...iconProps} />
      case "message":
        return <MessageSquare {...iconProps} />
      case "success":
        return <CheckCircle2 {...iconProps} />
      case "error":
        return <AlertCircle {...iconProps} />
      case "warning":
        return <AlertCircle {...iconProps} />
      case "event":
        return <Calendar {...iconProps} />
      case "achievement":
        return <Award {...iconProps} />
      default:
        return <Info {...iconProps} />
    }
  }

  const getNotificationColor = type => {
    switch (type) {
      case "job":
        return "bg-blue-50 hover:bg-blue-100 border-l-4 border-blue-500"
      case "message":
        return "bg-purple-50 hover:bg-purple-100 border-l-4 border-purple-500"
      case "success":
        return "bg-green-50 hover:bg-green-100 border-l-4 border-green-500"
      case "error":
        return "bg-red-50 hover:bg-red-100 border-l-4 border-red-500"
      case "warning":
        return "bg-yellow-50 hover:bg-yellow-100 border-l-4 border-yellow-400"
      case "event":
        return "bg-indigo-50 hover:bg-indigo-100 border-l-4 border-indigo-500"
      case "achievement":
        return "bg-amber-50 hover:bg-amber-100 border-l-4 border-amber-500"
      default:
        return "bg-gray-50 hover:bg-gray-100 border-l-4 border-gray-400"
    }
  }

  const getIconBgColor = type => {
    switch (type) {
      case "job":
        return "bg-blue-100 text-blue-600"
      case "message":
        return "bg-purple-100 text-purple-600"
      case "success":
        return "bg-green-100 text-green-600"
      case "error":
        return "bg-red-100 text-red-600"
      case "warning":
        return "bg-yellow-100 text-yellow-600"
      case "event":
        return "bg-indigo-100 text-indigo-600"
      case "achievement":
        return "bg-amber-100 text-amber-600"
      default:
        return "bg-gray-100 text-gray-600"
    }
  }

  const unreadCount = notifications.filter(n => !n.is_read).length
  const filteredNotifications = getFilteredNotifications()

  const filters = [
    { value: "all", label: "All", icon: Bell },
    { value: "job", label: "Jobs", icon: Briefcase },
    { value: "message", label: "Messages", icon: MessageSquare },
    { value: "event", label: "Events", icon: Calendar },
    { value: "success", label: "Success", icon: CheckCircle2 }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-16 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bell className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Notifications
                </h1>
                <p className="text-sm text-gray-600">{unreadCount} unread</p>
              </div>
            </div>
            <button
              onClick={() => setShowMobileFilter(!showMobileFilter)}
              className="md:hidden flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <Filter className="h-5 w-5 text-gray-700" />
              <span className="text-sm font-medium text-gray-700">Filter</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
          {/* Sidebar - Filters */}
          <div
            className={`md:col-span-1 ${
              showMobileFilter ? "block" : "hidden"
            } md:block`}
          >
            <div className="bg-white rounded-lg shadow-sm p-4 sticky top-24">
              <div className="flex items-center justify-between md:hidden mb-4">
                <h3 className="font-semibold text-gray-900">Filters</h3>
                <button
                  onClick={() => setShowMobileFilter(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-2">
                {filters.map(filter => {
                  const Icon = filter.icon
                  return (
                    <button
                      key={filter.value}
                      onClick={() => {
                        setActiveFilter(filter.value)
                        setShowMobileFilter(false)
                      }}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                        activeFilter === filter.value
                          ? "bg-blue-50 text-blue-700 border-l-4 border-blue-600"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium text-sm">
                        {filter.label}
                      </span>
                    </button>
                  )
                })}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">
                  Sort By
                </h4>
                <div className="space-y-2">
                  <button
                    onClick={() => setSortBy("newest")}
                    className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-colors ${
                      sortBy === "newest"
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    Newest First
                  </button>
                  <button
                    onClick={() => setSortBy("oldest")}
                    className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-colors ${
                      sortBy === "oldest"
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    Oldest First
                  </button>
                </div>
              </div>

              <button
                onClick={markAllAsRead}
                className="w-full mt-6 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Mark all as read
              </button>
            </div>
          </div>

          {/* Main Notifications Feed */}
          <div className="md:col-span-3">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden h-full flex flex-col">
              {/* Scrollable Notifications Container */}
              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <div className="inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
                      <p className="mt-4 text-gray-600">
                        Loading notifications...
                      </p>
                    </div>
                  </div>
                ) : filteredNotifications.length === 0 ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No notifications yet
                      </h3>
                      <p className="text-gray-600">Stay tuned for updates!</p>
                    </div>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {filteredNotifications.map(notification => (
                      <div
                        key={notification.notification_id}
                        className={`p-4 transition-all duration-200 cursor-pointer ${
                          !notification.is_read ? "bg-blue-50/30" : ""
                        } ${getNotificationColor(notification.type)}`}
                        onClick={() =>
                          !notification.is_read &&
                          markAsRead(notification.notification_id)
                        }
                      >
                        <div className="flex items-start space-x-4">
                          {/* Icon */}
                          <div
                            className={`flex-shrink-0 mt-1 h-10 w-10 rounded-full flex items-center justify-center ${getIconBgColor(
                              notification.type
                            )}`}
                          >
                            {getNotificationIcon(notification.type)}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="text-sm font-semibold text-gray-900 leading-tight">
                                  {notification.title}
                                </h3>
                                <p className="mt-1 text-sm text-gray-600 leading-relaxed">
                                  {notification.message}
                                </p>
                              </div>

                              {/* Unread Indicator and Menu */}
                              <div className="ml-4 flex items-start space-x-2 flex-shrink-0">
                                {!notification.is_read && (
                                  <div className="h-2 w-2 rounded-full bg-blue-600 mt-2"></div>
                                )}
                                <button
                                  onClick={e => {
                                    e.stopPropagation()
                                    deleteNotification(notification.notification_id)
                                  }}
                                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>

                            {/* Timestamp */}
                            <div className="mt-2 flex items-center justify-between">
                              <p className="text-xs text-gray-500">
                                {new Date(
                                  notification.created_at
                                ).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit"
                                })}
                              </p>
                              {notification.action_url && (
                                <a
                                  href={notification.action_url}
                                  className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline"
                                >
                                  View →
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotificationPage
