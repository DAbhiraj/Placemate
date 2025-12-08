import React, { useState, useEffect } from "react"
import {
  Users,
  Building2,
  Award,
  TrendingUp,
  Plus,
  FileText,
  Mail,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  X,
  Save,
  Calendar,
  MapPin,
  DollarSign
} from "lucide-react"
import { useApp } from "../../context/AppContext"
import StatCard from "../../components/UI/StatCard"
import StatusBadge from "../../components/UI/StatusBadge"
import NotificationForm from "../../components/UI/NotificationForm"
import RoleBasedNotificationForm from "../../components/UI/RoleBasedNotificationForm"
import axios from "axios"
import Stats from "./Stats"

// Use Vite env var for backend API base URL, fallback to localhost for dev
const API_URL = "http://localhost:4000/api";

const Admin = () => {
  // const { students, companies, applications } = useApp()
  const [activeTab, setActiveTab] = useState("overview")
  const [searchTerm, setSearchTerm] = useState("")

  // Backend data states
  const [backendStats, setBackendStats] = useState({
    totalStudents: 0,
    totalCompanies: 0,
    totalApplications: 0,
    totalPlacements: 0
  })
  const [backendCompanies, setBackendCompanies] = useState([])
  const [backendJobs, setBackendJobs] = useState([])
  const [backendStudents, setBackendStudents] = useState([])

  // Form states
  const [showJobForm, setShowJobForm] = useState(false)
  const [showNotificationForm, setShowNotificationForm] = useState(false)
  const [showRoleBasedNotificationForm, setShowRoleBasedNotificationForm] = useState(false)
  const [jobForm, setJobForm] = useState({
    company_name: "",
    role: "",
    description: "",
    application_deadline: "",
    online_assessment_date: "",
    interview_dates: [],
    min_cgpa: "",
    eligible_branches: [],
    package_range: "",
    location: [],
    company_logo: "",
  });

  const downloadReport = async (companyName) => {
    try {
      console.log(companyName);
      const response = await axios.get(
        `${API_URL}/exports?companyName=${encodeURIComponent(companyName)}`,
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${companyName}_applications.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Failed to download report:", error);
    }
  };


  // Fetch data from backend
  useEffect(() => {
    fetchBackendData()
  }, [])

  const fetchBackendData = async () => {
    try {
      const [statsRes, companiesRes, jobsRes, studentsRes] = await Promise.all([
        axios.get(`${API_URL}/admin/dashboard/stats`),
        axios.get(`${API_URL}/admin/companies`),
        axios.get(`${API_URL}/admin/jobs`),
        axios.get(`${API_URL}/admin/students`)
      ])

      console.log(studentsRes.data);

      setBackendStats(statsRes.data)
      setBackendCompanies(companiesRes.data)
      setBackendJobs(jobsRes.data)
      setBackendStudents(studentsRes.data)
    } catch (error) {
      console.error("Failed to fetch admin data:", error)
    }
  }

  // Job form handlers
  const handleJobSubmit = async (e) => {
    e.preventDefault()
    try {
      await axios.post(`${API_URL}/admin/jobs`, jobForm)
      setShowJobForm(false)
      setJobForm({
        company_name: "",
        role: "",
        description: "",
        application_deadline: "",
        online_assessment_date: "",
        interview_dates: [],
        min_cgpa: "",
        eligible_branches: [],
        package_range: "",
        location: []
      })
      fetchBackendData()
    } catch (error) {
      console.error("Failed to create job:", error)
    }
  }
  useEffect(() => {
    console.log("in backend companies");
    console.log(backendCompanies);
  }, [backendCompanies])

  // Notification form handlers
  const handleSendNotification = async (notificationData) => {
    try {
      const formData = new FormData()
      formData.append('statusUpdate', notificationData.statusUpdate)
      formData.append('companyName', notificationData.companyName)
      formData.append('customMessage', notificationData.customMessage || '')
      formData.append('excelFile', notificationData.excelFile)

      await axios.post(`${API_URL}/admin/send-notification`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      // Refresh data after sending notifications
      fetchBackendData()
    } catch (error) {
      console.error("Failed to send notifications:", error)
      throw error
    }
  }

  // Role-based notification handler
  const handleSendRoleBasedNotification = async (notificationData) => {
    try {
      await axios.post(`${API_URL}/admin/send-notification-roles`, {
        message: notificationData.message,
        title: notificationData.title,
        type: notificationData.type,
        roles: notificationData.selectedRoles
      })

      // Refresh data after sending notifications
      fetchBackendData()
    } catch (error) {
      console.error("Failed to send role-based notifications:", error)
      throw error
    }
  }


  const stats = {
    totalStudents: backendStats.totalStudents || 0,
    activeCompanies: backendStats.totalCompanies || 0,
    totalPlacements: backendStats.totalPlacements || 0,
    avgPackage: backendStats.avgPackage || "0"
  }



  const filteredStudents = backendStudents.filter(
    student =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.branch.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Total Students"
          value={stats.totalStudents}
          icon={Users}
          gradient="bg-gradient-to-r from-blue-500 to-blue-600"
        />
        <StatCard
          title="Active Companies"
          value={stats.activeCompanies}
          icon={Building2}
          gradient="bg-gradient-to-r from-green-500 to-green-600"
        />
        <StatCard
          title="Placements"
          value={stats.totalPlacements}
          icon={Award}
          gradient="bg-gradient-to-r from-purple-500 to-purple-600"
        />
        <StatCard
          title="Avg Package"
          value={stats.avgPackage}
          icon={TrendingUp}
          gradient="bg-gradient-to-r from-orange-500 to-orange-600"
        />
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setShowJobForm(true)}
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FileText className="h-6 w-6 text-green-500 mb-2" />
              <span className="text-sm font-medium">Add Job</span>
            </button>
            <button
              onClick={() => setActiveTab("students")}
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Users className="h-6 w-6 text-purple-500 mb-2" />
              <span className="text-sm font-medium">Manage Students</span>
            </button>
            <button
              onClick={() => setShowNotificationForm(true)}
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Mail className="h-6 w-6 text-orange-500 mb-2" />
              <span className="text-sm font-medium">Student Notification</span>
            </button>
            <button
              onClick={() => setShowRoleBasedNotificationForm(true)}
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Mail className="h-6 w-6 text-purple-500 mb-2" />
              <span className="text-sm font-medium">Role-Based Notification</span>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
      </div>

      {/* Placement Statistics */}
    </div>
  )

  const renderStudents = () => (
    <div className="space-y-6">
      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            Export Data
          </button>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Branch
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CGPA
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Resume Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.map(student => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {student.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {student.roll_no}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {student.branch}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {student.cgpa}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-sm font-medium text-gray-900">
                        {student.ats_score || 0}/100
                      </div>
                      <div
                        className={`ml-2 w-16 h-2 rounded-full ${student.resumeScore >= 80
                          ? "bg-green-200"
                          : student.resumeScore >= 60
                            ? "bg-yellow-200"
                            : "bg-red-200"
                          }`}
                      >
                        <div
                          className={`h-2 rounded-full ${student.resumeScore >= 80
                            ? "bg-green-500"
                            : student.resumeScore >= 60
                              ? "bg-yellow-500"
                              : "bg-red-500"
                            }`}
                          style={{ width: `${student.resumeScore}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={student.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        <Eye className="w-4 h-4" />
                      </button>
                      {student.status === "pending" && (
                        <>
                          <button className="text-green-600 hover:text-green-900">
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button className="text-red-600 hover:text-red-900">
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  const renderCompanies = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Company Management
          </h2>

        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {backendCompanies.map((company, index) => (

          <div
            key={index}
            className="bg-white rounded-xl shadow-sm border p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <img
                  src={company.company_logo}
                  alt={`${company.company_name} logo`}
                  className="w-12 h-12 object-contain rounded-md bg-white border"
                  loading="lazy"
                />


                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {company.company_name}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {company.location.map((loc, index) => {
                      const colors = [
                        "bg-blue-100 text-blue-700",
                        "bg-green-100 text-green-700",
                        "bg-purple-100 text-purple-700",
                        "bg-yellow-100 text-yellow-700",
                        "bg-pink-100 text-pink-700",
                      ];
                      const color = colors[index % colors.length]; // rotate colors
                      return (
                        <span
                          key={index}
                          className={`text-xs font-medium px-2 py-1 rounded-full ${color}`}
                        >
                          {loc}
                        </span>
                      );
                    })}
                  </div>

                </div>
              </div>
              <span className="bg-green-100 text-green-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                {company.package}
              </span>
            </div>

            <div className="space-y-2 text-sm text-gray-600">

              <p>
                <span className="font-medium">Min CGPA:</span> {company.min_cgpa}
              </p>
            </div>

            c

          </div>
        ))}
      </div>
    </div>
  )

  const tabs = [
    { id: "overview", label: "Overview", icon: TrendingUp },
    { id: "companies", label: "Companies", icon: Building2 },
    { id: "reports", label: "Stats", icon: FileText }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-indigo-100">
          Manage students, companies, and placement activities
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "overview" && renderOverview()}
          {activeTab === "students" && renderStudents()}
          {activeTab === "companies" && renderCompanies()}
          {activeTab === "reports" && <Stats />}
        </div>
      </div>


 

      {/* Notification Form Modal */}
      <NotificationForm
        isOpen={showNotificationForm}
        onClose={() => setShowNotificationForm(false)}
        onSendNotification={handleSendNotification}
        modalBgClass="fixed inset-0 bg-white/10 backdrop-blur-sm flex items-center justify-center z-50"
      />

      {/* Role-Based Notification Form Modal */}
      <RoleBasedNotificationForm
        isOpen={showRoleBasedNotificationForm}
        onClose={() => setShowRoleBasedNotificationForm(false)}
        onSendNotification={handleSendRoleBasedNotification}
        modalBgClass="fixed inset-0 bg-white/10 backdrop-blur-sm flex items-center justify-center z-50"
      />
    </div>
  )
}

export default Admin;
