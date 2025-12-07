import {
  Bell,
  CheckCircle,
  Briefcase,
  Users,
  AlertCircle,
  X
} from "lucide-react"

export default function SpocNotifications() {
  const notifications = [
    {
      id: 1,
      type: "assignment",
      title: "New SPOC Assignment",
      description:
        "You have been assigned as SPOC for Software Engineer position by ABC Company Inc.",
      icon: Briefcase,
      color: "blue",
      timestamp: "5 minutes ago",
      read: false,
      jobId: 1
    },
    {
      id: 2,
      type: "update",
      title: "Job Description Updated",
      description:
        "ABC Company Inc. updated the job description for Data Analyst Intern. Please review and suggest changes.",
      icon: AlertCircle,
      color: "orange",
      timestamp: "2 hours ago",
      read: false,
      jobId: 2
    },
    {
      id: 3,
      type: "completion",
      title: "Job Finalized",
      description:
        "Final job description for Product Manager is ready. All changes approved.",
      icon: CheckCircle,
      color: "green",
      timestamp: "1 day ago",
      read: true,
      jobId: 3
    },
    {
      id: 4,
      type: "candidates",
      title: "Shortlisted Candidates Ready",
      description:
        "Student group has been created for Software Engineer position with 5 shortlisted candidates.",
      icon: Users,
      color: "purple",
      timestamp: "2 days ago",
      read: true,
      jobId: 1
    }
  ]

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-100 p-2 rounded-lg">
          <Bell className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Notifications</h2>
          <p className="text-sm text-gray-500">2 unread notifications</p>
        </div>
      </div>

      <div className="space-y-3 max-h-[500px] overflow-y-auto">
        {notifications.map(notification => {
          const Icon = notification.icon
          const colorClasses = {
            blue: "bg-blue-100 text-blue-600",
            orange: "bg-orange-100 text-orange-600",
            green: "bg-green-100 text-green-600",
            purple: "bg-purple-100 text-purple-600"
          }

          return (
            <div
              key={notification.id}
              className={`p-4 rounded-lg border transition-colors ${
                notification.read
                  ? "bg-gray-50 border-gray-200"
                  : "bg-blue-50 border-blue-200"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`p-2 rounded-lg flex-shrink-0 ${
                    colorClasses[notification.color]
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">
                    {notification.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {notification.description}
                  </p>
                  <p className="text-xs text-gray-500">
                    {notification.timestamp}
                  </p>
                </div>

                <button className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <button className="w-full mt-4 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
        View All Notifications
      </button>
    </div>
  )
}
