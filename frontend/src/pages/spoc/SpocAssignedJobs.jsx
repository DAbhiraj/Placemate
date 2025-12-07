import {
  Briefcase,
  MapPin,
  Users,
  Calendar,
  MessageSquare,
  CheckCircle,
  IndianRupee
} from "lucide-react"
import { useState, useEffect } from "react"
import axios from "axios"

const API_URL = import.meta.env.VITE_API_URL

export default function SpocAssignedJobs() {
  const [assignedJobs, setAssignedJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchAssignedJobs()
  }, [])

  const fetchAssignedJobs = async () => {
    try {
      setLoading(true)
      setError("")
      
      // Get SPOC ID from localStorage or context
      const userId = localStorage.getItem("id");

      const response = await axios.get(`${API_URL}/spoc/${userId}/assigned-jobs`)
      setAssignedJobs(response.data)
      console.log(response.data)

    } catch (err) {
      console.error("Error fetching assigned jobs:", err)
      setError("Failed to load assigned jobs. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (jobId, newStatus) => {
    try {
      const userId = localStorage.getItem("id");
      await axios.put(`${API_URL}/spoc/${userId}/jobs/${jobId}/status`, {
        status: newStatus
      })
      
      // Update local state
      setAssignedJobs(jobs =>
        jobs.map(job =>
          job.id === jobId ? { ...job, status: newStatus } : job
        )
      )
    } catch (err) {
      console.error("Error updating status:", err)
      alert("Failed to update status")
    }
  }

  const getStatusColor = status => {
    switch (status) {
      case "In Discussion":
        return "bg-yellow-100 text-yellow-700"
      case "Awaiting Review":
        return "bg-orange-100 text-orange-700"
      case "Finalized":
        return "bg-green-100 text-green-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Loading assigned jobs...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-red-500">{error}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-100 p-2 rounded-lg">
          <Briefcase className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Assigned Jobs</h2>
          <p className="text-sm text-gray-500">
            {assignedJobs.length} jobs assigned to you
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {assignedJobs.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No jobs assigned yet
          </div>
        ) : (
          assignedJobs.map(job => (
            <div
              key={job.id}
              className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${
                job.status === "Finalized"
                  ? "border-green-200 bg-green-50"
                  : "border-gray-200 bg-white"
              }`}
            >
              {/* Header: Title, Status, and Actions */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-semibold text-gray-900">
                      {job.title}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(
                        job.status
                      )}`}
                    >
                      {job.status}
                    </span>
                    {job.hasChanges && (
                      <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium whitespace-nowrap">
                        Changes Suggested
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{job.company}</p>
                </div>
                
                <div className="flex gap-1 ml-3 flex-shrink-0">
                  {job.status === "Finalized" ? (
                    <>
                      <button className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700 transition-colors">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Finalized
                      </button>
                    </>
                  ) : (
                    <>
                      <button className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 transition-colors">
                        <MessageSquare className="w-3.5 h-3.5" />
                        Msg ({job.messages})
                      </button>
                      <button 
                        onClick={() => handleStatusUpdate(job.id, "Finalized")}
                        className="flex items-center gap-1 px-3 py-1.5 border border-green-300 text-green-700 rounded text-xs font-medium hover:bg-green-50 transition-colors">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Finalize
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Key Details: Compact Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3 text-xs">
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-gray-500">Location</p>
                    <p className="text-gray-900 font-medium">{job.location}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <IndianRupee className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-gray-500">Salary</p>
                    <p className="text-gray-900 font-medium">{job.salary}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <Calendar className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-gray-500">Application Deadline</p>
                    <p className="text-gray-900 font-medium">{job.deadline}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <Calendar className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-gray-500">OT Date</p>
                    <p className="text-gray-900 font-medium">{job.ot_deadline}</p>
                  </div>
                </div>
              </div>

              {/* Secondary Details: Min CGPA, Branches, Posted Date, Interview Dates */}
              <div className="flex flex-wrap gap-3 text-xs">
                <div>
                  <span className="text-gray-500">Min CGPA: </span>
                  <span className="text-gray-900 font-medium">{job.cgpaRequirement}</span>
                </div>
                
                <div className="flex-1">
                  <span className="text-gray-500">Branches: </span>
                  <span className="text-gray-900 font-medium">{job.branches}</span>
                </div>
                
                <div>
                  <span className="text-gray-500">Posted: </span>
                  <span className="text-gray-900 font-medium">{job.postedDate}</span>
                </div>
              </div>

              {/* Interview Dates - If Available */}
              {job.interview_deadline && job.interview_deadline.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Interview Dates:</p>
                  <div className="flex flex-wrap gap-1">
                    {(Array.isArray(job.interview_deadline) ? job.interview_deadline : [job.interview_deadline]).map((date, idx) => (
                      <span key={idx} className="inline-block px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                        {date}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
