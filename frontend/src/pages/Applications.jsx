import React, { useState, useEffect } from "react"
import { Search, Filter, Eye, Download, Calendar } from "lucide-react"
import { useApp } from "../context/AppContext"
import StatusBadge from "../components/UI/StatusBadge"
import Loader from "../components/UI/Loader"
import { formatDate, formatDateTime } from "../utils/helpers"
import axios from "axios"

const API_URL = import.meta.env.VITE_API_URL ;

const Applications = () => {
  const { companies } = useApp()
  const [applications, setApplications] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true)
      try {
        const userId = localStorage.getItem("id")
        if (!userId) return
        const { data } = await axios.get(`${API_URL}/applications/userId/${userId}`)
        // Data shape from backend: [{ company_name, role, description, ... }]
        // Normalize to include minimal fields this page needs
        const normalized = Array.isArray(data) ? data.map((a, idx) => ({
          id: idx + 1,
          company_name: a.company_name ?? "",
          role: a.role ?? "",
          description: a.description ?? "",
          status: a.status ?? "", // backend doesn't provide statuses per app yet
          appliedDate: a.updated_at,
          lastUpdate: a.updated_at,
        })) : []
        setApplications(normalized)
      } catch (e) {
        setApplications([])
      } finally {
        setLoading(false)
      }
    }
    fetchApplications()
  }, [])

  const filteredApplications = applications.filter(application => {
    const companyName = application.company_name?.toLowerCase?.() || ""
    const matchesSearch = companyName.includes(searchTerm.toLowerCase())
    const matchesStatus = !filterStatus || application.status === filterStatus
    return matchesSearch && matchesStatus
  })

  //console.log(filteredApplications);

  const getStatusStats = () => {
    const stats = {
      total: applications.length,
      applied: applications.filter(app => app.status === "applied").length,
      shortlisted: applications.filter(app => app.status === "shortlisted").length,
      interviewed: applications.filter(app => app.status === "interviewed").length,
      selected: applications.filter(app => app.status === "selected").length,
      rejected: applications.filter(app => app.status === "rejected").length
    }
    return stats
  }

  const stats = getStatusStats()

  return (
    <div className="space-y-6">
      {loading ? (
        <Loader />
      ) : (
        <>
          {/* Header */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              My Applications
            </h1>
            <p className="text-gray-600">
              Track the status of all your job applications
            </p>
          </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-500">Total</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {stats.applied}
          </div>
          <div className="text-sm text-gray-500">Applied</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {stats.shortlisted}
          </div>
          <div className="text-sm text-gray-500">Shortlisted</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">
            {stats.interviewed}
          </div>
          <div className="text-sm text-gray-500">Interviewed</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {stats.selected}
          </div>
          <div className="text-sm text-gray-500">Selected</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
          <div className="text-2xl font-bold text-red-600">
            {stats.rejected}
          </div>
          <div className="text-sm text-gray-500">Rejected</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search applications..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="applied">Applied</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="interviewed">Interviewed</option>
            <option value="selected">Selected</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {filteredApplications.length === 0 ? (
          <div className="text-center py-12">
            <Filter className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No applications found
            </h3>
            <p className="text-gray-500">
              {applications.length === 0
                ? "You haven't applied to any companies yet"
                : "Try adjusting your search criteria"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applied Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Update
                  </th>

                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredApplications.map(application => {
                  return (
                    <tr
                      key={application.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {application.company_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {application.role}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          {formatDateTime(application.appliedDate)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={application.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDateTime(application.lastUpdate)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
        </>
      )}
    </div>
  )
}

export default Applications;
