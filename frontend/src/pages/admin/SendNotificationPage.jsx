import { useEffect, useState } from "react"
import { Bell, Send, Users, CheckSquare } from "lucide-react"
import axiosClient from "../../api/axiosClient"

export default function SendNotifications() {
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [selectedRoles, setSelectedRoles] = useState([])
  const [roles, setRoles] = useState([])
  const [recentNotifications, setRecentNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch actual counts from backend
        const [studentsRes, spocsRes, recruitersRes] = await Promise.all([
          axiosClient.get("/admin/students").catch(() => ({ data: [] })),
          axiosClient.get("/admin/spocs").catch(() => ({ data: [] })),
          axiosClient.get("/admin/companies").catch(() => ({ data: [] }))
        ])

        const studentsCount = (studentsRes.data?.data || studentsRes.data || []).length
        const spocsCount = (spocsRes.data?.data || spocsRes.data || []).length
        const recruitersCount = (recruitersRes.data?.data || recruitersRes.data || []).length

        const rolesData = [
          { id: "students", label: "Students", count: studentsCount },
          { id: "placement-coordinators", label: "Placement Coordinators", count: spocsCount },
          { id: "recruiters", label: "Recruiters", count: recruitersCount }
        ]
        setRoles(rolesData)

        // Fetch recent notifications if endpoint exists
        try {
          const response = await axiosClient.get("/admin/notifications/recent")
          setRecentNotifications(response.data.data || [])
        } catch {
          // Fall back to empty if endpoint doesn't exist
          setRecentNotifications([])
        }
        setLoading(false)
      } catch (error) {
        console.error("Failed to fetch notification data:", error)
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleRoleToggle = roleId => {
    setSelectedRoles(prev =>
      prev.includes(roleId)
        ? prev.filter(id => id !== roleId)
        : [...prev, roleId]
    )
  }

  const handleSelectAll = () => {
    if (selectedRoles.length === roles.length) {
      setSelectedRoles([])
    } else {
      setSelectedRoles(roles.map(r => r.id))
    }
  }

  const handleSendNotification = async () => {
    if (!title || !message || selectedRoles.length === 0) {
      return
    }

    try {
      setSending(true)
      const payload = {
        title,
        message,
        roles: selectedRoles
      }
      
      await axiosClient.post("/admin/send-notification-roles", payload)
      
      // Reset form and refresh recent notifications
      setTitle("")
      setMessage("")
      setSelectedRoles([])
      
      // Refresh recent notifications
      try {
        const response = await axiosClient.get("/admin/notifications/recent")
        setRecentNotifications(response.data.data || [])
      } catch {
        // Ignore if endpoint doesn't exist
      }
      
      setSending(false)
    } catch (error) {
      console.error("Failed to send notification:", error)
      setSending(false)
    }
  }

  const totalRecipients = roles
    .filter(r => selectedRoles.includes(r.id))
    .reduce((sum, r) => sum + r.count, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Send Notifications
        </h1>
        <p className="text-slate-600 mt-1">
          Send role-based notifications to users
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center mb-4">
              <Bell className="h-5 w-5 mr-2" />
              Compose Notification
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Notification Title
                </label>
                <input
                  type="text"
                  placeholder="Enter notification title"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Message
                </label>
                <textarea
                  placeholder="Enter your message here..."
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-slate-700">
                    Select Recipients
                  </label>
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="px-3 py-1 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 flex items-center gap-1"
                  >
                    <CheckSquare className="h-4 w-4" />
                    {selectedRoles.length === roles.length
                      ? "Deselect All"
                      : "Select All"}
                  </button>
                </div>

                <div className="space-y-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                  {roles.map(role => (
                    <div
                      key={role.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id={role.id}
                          checked={selectedRoles.includes(role.id)}
                          onChange={() => handleRoleToggle(role.id)}
                          className="w-4 h-4 cursor-pointer"
                        />
                        <label htmlFor={role.id} className="cursor-pointer text-sm">
                          {role.label}
                        </label>
                      </div>
                      <span className="text-sm text-slate-600">
                        {role.count} users
                      </span>
                    </div>
                  ))}
                </div>

                {selectedRoles.length > 0 && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-900">
                      <Users className="h-4 w-4 inline mr-1" />
                      Total recipients:{" "}
                      <span className="font-semibold">{totalRecipients}</span>
                    </p>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleSendNotification}
                disabled={!title || !message || selectedRoles.length === 0 || sending}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Send className="h-4 w-4" />
                {sending ? "Sending..." : "Send Notification"}
              </button>
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white border border-slate-200 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-slate-900 mb-3">
              Recent Notifications
            </h4>

            <div className="space-y-4">
              {recentNotifications.length > 0 ? (
                recentNotifications.map(notification => (
                  <div
                    key={notification.id}
                    className="p-3 bg-slate-50 rounded-lg border border-slate-200"
                  >
                    <h5 className="font-medium text-slate-900 text-sm">
                      {notification.title}
                    </h5>
                    <p className="text-xs text-slate-600 mt-1">
                      To: {notification.recipients}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {notification.sentAt}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No recent notifications</p>
              )}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-6 mt-6">
            <h4 className="text-lg font-semibold text-slate-900 mb-3">
              Quick Stats
            </h4>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Sent Today</span>
                <span className="font-semibold text-slate-900">12</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Sent This Week</span>
                <span className="font-semibold text-slate-900">45</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">
                  Total Recipients
                </span>
                <span className="font-semibold text-slate-900">540</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
