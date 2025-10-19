import { useState, useEffect } from "react"
import {
  Briefcase,
  MapPin,
  DollarSign,
  Calendar,
  ArrowRight
} from "lucide-react"
import ApplicationForm from "./ApplicationForm"
import axios from "axios";

export default function JobsPage() {
  const [jobs, setJobs] = useState([])
  const [selectedJob, setSelectedJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [appliedJobs, setAppliedJobs] = useState(new Set())

  useEffect(() => {
    fetchJobs()
  }, [])

  useEffect(() => {
    if (jobs.length > 0) {
      fetchUserApplications()
    }
  }, [jobs])

  const fetchJobs = async () => {
    try {
     
      const response = await axios.get("http://localhost:4000/api/jobs")
      const raw = response?.data
      const list = Array.isArray(raw) ? raw : (Array.isArray(raw?.jobs) ? raw.jobs : [])
      const normalized = list.map(j => ({
        id: j.id,
        title: j.title ?? j.role ?? "",
        company: j.company ?? j.company_name ?? "",
        location: j.location ?? "",
        salary: j.salary ?? "",
        postedDate: j.postedDate ?? j.created_at ?? j.createdAt ?? new Date().toISOString(),
        description: j.description ?? "",
      }))
      setJobs(normalized)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load jobs")
    } finally {
      setLoading(false)
    }
  }

  const fetchUserApplications = async () => {
    try {
      const userId = localStorage.getItem("id")
      if (!userId) return

      const response = await axios.get(`http://localhost:4000/api/applications/userId/${userId}`)
      const applications = response.data || []

      // Create a set of applied job IDs based on company_name and role matching
      const appliedJobIds = new Set()
      applications.forEach(app => {
        // Find matching job by company and role
        const matchingJob = jobs.find(job =>
          job.company === app.company_name && job.title === app.role
        )
        if (matchingJob) {
          appliedJobIds.add(matchingJob.id)
        }
      })

      setAppliedJobs(appliedJobIds)
    } catch (err) {
      console.error("Failed to fetch user applications:", err)
    }
  }

  const handleApplyClick = job => {
    setSelectedJob(job)
  }

  const handleCloseForm = () => {
    setSelectedJob(null)
    // Refresh applied jobs list after closing form (in case application was submitted)
    fetchUserApplications()
  }

  if (selectedJob) {
    const isApplied = appliedJobs.has(selectedJob.id)
    return <ApplicationForm job={selectedJob} isApplied={isApplied} onClose={handleCloseForm} />
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading jobs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Job Opportunities
          </h1>
          <p className="text-slate-600">
            Browse and apply to available positions
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {jobs.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Briefcase className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              No jobs available
            </h3>
            <p className="text-slate-600">
              Check back later for new opportunities
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {jobs.map(job => (
              <div
                key={job.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-slate-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-slate-900 p-3 rounded-lg">
                    <Briefcase className="w-6 h-6 text-white" />
                  </div>
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  {job.title}
                </h3>
                <p className="text-slate-600 font-medium mb-4">{job.company}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-slate-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{job.location}</span>
                  </div>
                  {job.salary && (
                    <div className="flex items-center text-sm text-slate-600">
                      <DollarSign className="w-4 h-4 mr-2" />
                      <span>{job.salary}</span>
                    </div>
                  )}
                  <div className="flex items-center text-sm text-slate-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>
                      Posted {new Date(job.postedDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <p className="text-slate-600 text-sm mb-4 line-clamp-3">
                  {job.description}
                </p>

                <button
                  onClick={() => handleApplyClick(job)}
                  className={`w-full py-3 cursor-pointer rounded-lg font-semibold transition flex items-center justify-center gap-2 ${appliedJobs.has(job.id)
                    ? "bg-green-600 text-white"
                    : "bg-slate-900 text-white hover:bg-slate-800"
                    }`}
                >
                  <span>{appliedJobs.has(job.id) ? "Applied" : "Apply Now"}</span>
                  {!appliedJobs.has(job.id) && <ArrowRight className="w-4 h-4" />}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
