// Removed all @/components/ui/* imports
import { Users, Building2, Briefcase } from "lucide-react"
import { useEffect, useState } from "react"
import axiosClient from "../../api/axiosClient"

export default function AdminDashboard() {
  const [stats, setStats] = useState([])
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        const response = await axiosClient.get("/admin/dashboard/stats")
        const dashboardStats = response.data

        // Transform backend data to match frontend structure
        setStats([
          {
            name: "Pending Verifications",
            value: dashboardStats.pendingVerifications || "0",
            icon: Users,
            color: "bg-orange-500",
            change: `+${dashboardStats.newVerifications || 0} new`
          },
          {
            name: "Active Companies",
            value: dashboardStats.activeCompanies || "0",
            icon: Building2,
            color: "bg-blue-500",
            change: `+${dashboardStats.companiesThisMonth || 0} this month`
          },
          {
            name: "Open Jobs",
            value: dashboardStats.openJobs || "0",
            icon: Briefcase,
            color: "bg-green-500",
            change: `+${dashboardStats.jobsThisWeek || 0} this week`
          },
          {
            name: "Active SPOCs",
            value: dashboardStats.activeSpocs || "0",
            icon: Users,
            color: "bg-purple-500",
            change: `${dashboardStats.pendingTasks || 0} pending tasks`
          }
        ])

        // Set recent activity from backend data if available
        if (dashboardStats.recentActivity) {
          setRecentActivity(dashboardStats.recentActivity)
        }
        setLoading(false)
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error)
        // Set default empty stats on error
        setStats([
          { name: "Pending Verifications", value: "0", icon: Users, color: "bg-orange-500", change: "0 new" },
          { name: "Active Companies", value: "0", icon: Building2, color: "bg-blue-500", change: "0 this month" },
          { name: "Open Jobs", value: "0", icon: Briefcase, color: "bg-green-500", change: "0 this week" },
          { name: "Active SPOCs", value: "0", icon: Users, color: "bg-purple-500", change: "0 pending tasks" }
        ])
        setRecentActivity([])
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 mt-1">Overview of placement activities</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map(stat => (
          <div key={stat.name} className="bg-white border border-slate-200 rounded-lg">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    {stat.name}
                  </p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">
                    {stat.value}
                  </p>
                  <p className="text-sm text-slate-500 mt-1">{stat.change}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-lg">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-slate-900 mb-2">Recent Activity</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex justify-between items-start border-b border-slate-100 pb-3 last:border-0"
                >
                  <div>
                    <p className="font-medium text-slate-900">
                      {activity.action}
                    </p>
                    <p className="text-sm text-slate-600">{activity.company}</p>
                  </div>
                  <span className="text-xs text-slate-500">
                    {activity.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-slate-900 mb-2">Upcoming Drives</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-slate-900">
                      Software Developer
                    </p>
                    <p className="text-sm text-slate-600">Tech Innovators</p>
                  </div>
                  <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                    Tomorrow
                  </span>
                </div>
                <p className="text-sm text-slate-600 mt-2">OT Scheduled</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-slate-900">Data Analyst</p>
                    <p className="text-sm text-slate-600">Analytics Pro</p>
                  </div>
                  <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full">
                    In 3 days
                  </span>
                </div>
                <p className="text-sm text-slate-600 mt-2">
                  Applications Opened
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
