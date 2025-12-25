import { useEffect, useState } from "react"
import { Search, Eye, Calendar, DollarSign, MapPin, Users, X } from "lucide-react"
import axiosClient from "../../api/axiosClient"

const jobStatuses = [
  "In Initial Stage",
  "In Review",
  "In Negotiation",
  "Applications Opened",
  "OT Conducted",
  "Interview",
  "Completed the Drive"
]

export default function ViewAllJobs() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedJob, setSelectedJob] = useState(null)
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true)
        const response = await axiosClient.get("/recruiter/jobs")
        const jobsData = response.data.data || response.data
        setJobs(jobsData)
        setLoading(false)
      } catch (error) {
        console.error("Failed to fetch jobs:", error)
        setJobs([])
        setLoading(false)
      }
    }

    fetchJobs()
  }, [])

  const filteredJobs = jobs.filter(
    job =>
      (statusFilter === "all" || job.status === statusFilter) &&
      (job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const getStatusColor = status => {
    switch (status) {
      case "In Initial Stage":
        return "bg-slate-500"
      case "In Review":
        return "bg-blue-500"
      case "In Negotiation":
        return "bg-purple-500"
      case "Applications Opened":
        return "bg-green-500"
      case "OT Conducted":
        return "bg-orange-500"
      case "Interview":
        return "bg-yellow-600"
      case "Completed the Drive":
        return "bg-emerald-600"
      default:
        return "bg-slate-500"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">View Jobs</h1>
        <p className="text-slate-600 mt-1">
          All company job postings and their status
        </p>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Box */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            placeholder="Search jobs..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10 bg-white border border-slate-200 rounded-md h-10 w-full px-3"
          />
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="h-10 rounded-md border border-slate-200 px-3 w-full sm:w-64 bg-white"
        >
          <option value="all">All Statuses</option>
          {jobStatuses.map(status => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      {/* Job List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredJobs.map(job => (
          <div
            key={job.id}
            className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:shadow-md transition"
          >
            {/* Card Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  {job.title}
                </h2>
                <p className="text-sm text-slate-600">{job.company}</p>
              </div>

              <span
                className={`text-white text-xs px-2 py-1 rounded ${getStatusColor(
                  job.status
                )}`}
              >
                {job.status}
              </span>
            </div>

            {/* Card Content */}
            <div className="space-y-3 text-sm text-slate-600">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                {job.location}
              </div>

              <div className="flex items-center">
                <DollarSign className="h-4 w-4 mr-2" />
                {job.salary}
              </div>

              <div className="flex items-center">
                <Users className="h-4 w-4 mr-2" />
                {job.applicants} Applicants
              </div>

              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Posted: {job.postedDate}
              </div>
            </div>

            {/* View Details Button */}
            <button
              className="w-full mt-4 border border-slate-300 hover:bg-slate-100 h-9 rounded-md flex items-center justify-center gap-2"
              onClick={() => setSelectedJob(job)}
            >
              <Eye className="h-4 w-4" />
              View Details
            </button>
          </div>
        ))}
      </div>

      {/* No Results */}
      {filteredJobs.length === 0 && (
        <div className="bg-white border border-slate-200 p-12 text-center rounded-lg">
          <p className="text-slate-500">No jobs found</p>
        </div>
      )}

      {/* Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 relative">

            {/* Close Button */}
            <button
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-700"
              onClick={() => setSelectedJob(null)}
            >
              <X className="h-5 w-5" />
            </button>

            {/* Modal Header */}
            <h2 className="text-2xl font-bold text-slate-900">
              {selectedJob.title}
            </h2>
            <p className="text-lg text-slate-600">{selectedJob.company}</p>

            <span
              className={`text-white text-xs px-2 py-1 rounded mt-2 inline-block ${getStatusColor(
                selectedJob.status
              )}`}
            >
              {selectedJob.status}
            </span>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4 py-4 mt-4 border-y border-slate-200">
              <div>
                <p className="text-sm text-slate-600">Location</p>
                <p className="text-slate-900">{selectedJob.location}</p>
              </div>

              <div>
                <p className="text-sm text-slate-600">Salary</p>
                <p className="text-slate-900">{selectedJob.salary}</p>
              </div>

              <div>
                <p className="text-sm text-slate-600">Job Type</p>
                <p className="text-slate-900">{selectedJob.type}</p>
              </div>

              <div>
                <p className="text-sm text-slate-600">Applicants</p>
                <p className="text-slate-900">{selectedJob.applicants}</p>
              </div>
            </div>

            {/* Description */}
            <div className="mt-4">
              <p className="text-sm text-slate-600">Description</p>
              <p className="text-slate-900 mt-1">{selectedJob.description}</p>
            </div>

            {/* Requirements */}
            <div className="mt-4">
              <p className="text-sm text-slate-600">Requirements</p>
              <ul className="mt-2 space-y-1 text-slate-900">
                {selectedJob.requirements.map((req, i) => (
                  <li key={i} className="flex items-start">
                    <span className="mr-2">•</span> {req}
                  </li>
                ))}
              </ul>
            </div>

            {/* Close Button */}
            <button
              className="w-full mt-6 bg-slate-900 text-white rounded-md h-10 hover:bg-slate-800"
              onClick={() => setSelectedJob(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
