import { useEffect, useState } from "react"
import {
  X,
  Building2,
  MapPin,
  DollarSign,
  Clock,
  Users,
  User,
  Mail,
  Phone,
  Briefcase
} from "lucide-react"
import axiosClient from "../../api/axiosClient"

export default function JobDetailsModal({ job, onClose }) {
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCandidates()
  }, [job.job_id])

  const fetchCandidates = async () => {
    try {
      setLoading(true)
      const response = await axiosClient.get(
       `/jobs/${job.job_id}/applications`
      )
      console.log(response.data.data || response.data || [])
      setCandidates(response.data.data || response.data || [])
    } catch (error) {
      console.error("Failed to fetch candidates:", error)
      setCandidates([])
    } finally {
      setLoading(false)
    }
  }

  const getStageColor = stage => {
    switch (stage?.toLowerCase()) {
      case "applied":
        return "bg-blue-100 text-blue-700"
      case "screening":
        return "bg-yellow-100 text-yellow-700"
      case "interview":
        return "bg-purple-100 text-purple-700"
      case "offer":
        return "bg-green-100 text-green-700"
      case "rejected":
        return "bg-red-100 text-red-700"
      default:
        return "bg-slate-100 text-slate-700"
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="max-w-5xl w-full bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              {job.role || job.title}
            </h2>
            <p className="text-slate-600 mt-1">{job.company_name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="h-6 w-6 text-slate-600" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-50 rounded-lg p-5">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Job Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Building2 className="h-5 w-5 text-slate-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-slate-600">Company</p>
                    <p className="font-medium text-slate-900">
                      {job.company_name || "-"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-slate-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-slate-600">Location</p>
                    <p className="font-medium text-slate-900">
                      {Array.isArray(job.locations)
                        ? job.locations.join(", ")
                        : Array.isArray(job.location)
                        ? job.location.join(", ")
                        : job.location || job.locations || "-"}
                    </p>
                  </div>
                </div>
                {job.salary_range && (
                  <div className="flex items-start gap-3">
                    <DollarSign className="h-5 w-5 text-slate-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-slate-600">Salary Range</p>
                      <p className="font-medium text-slate-900">
                        {job.salary_range}
                      </p>
                    </div>
                  </div>
                )}
                {job.job_type && (
                  <div className="flex items-start gap-3">
                    <Briefcase className="h-5 w-5 text-slate-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-slate-600">Job Type</p>
                      <p className="font-medium text-slate-900">
                        {job.job_type}
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-slate-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-slate-600">Status</p>
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getStageColor(
                        job.job_status || job.status
                      )}`}
                    >
                      {job.job_status || job.status || "N/A"}
                    </span>
                  </div>
                </div>
                {job.created_at && (
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-slate-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-slate-600">Posted On</p>
                      <p className="font-medium text-slate-900">
                        {new Date(job.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              {(job.recruiter_name ||
                job.recruiter_email ||
                job.recruiter_phone) && (
                <div className="bg-blue-50 rounded-lg p-5">
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">
                    Recruiter Details
                  </h3>
                  <div className="space-y-2">
                    {job.recruiter_name && (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-slate-600" />
                        <span className="text-slate-900">
                          {job.recruiter_name}
                        </span>
                      </div>
                    )}
                    {job.recruiter_email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-slate-600" />
                        <a
                          href={`mailto:${job.recruiter_email}`}
                          className="text-blue-600 hover:underline"
                        >
                          {job.recruiter_email}
                        </a>
                      </div>
                    )}
                    {job.recruiter_phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-slate-600" />
                        <a
                          href={`tel:${job.recruiter_phone}`}
                          className="text-blue-600 hover:underline"
                        >
                          {job.recruiter_phone}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {Array.isArray(job.spocs) && job.spocs.length > 0 && (
                <div className="bg-green-50 rounded-lg p-5">
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">
                    Assigned SPOCs ({job.spocs.length})
                  </h3>
                  <div className="space-y-3">
                    {job.spocs.map((spoc, idx) => (
                      <div
                        key={spoc.spoc_user_id || spoc.user_id || idx}
                        className="flex items-start justify-between"
                      >
                        <div className="space-y-1">
                          {spoc.name && (
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-slate-600" />
                              <span className="text-slate-900">{spoc.name}</span>
                            </div>
                          )}
                          {spoc.email && (
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-slate-600" />
                              <a
                                href={`mailto:${spoc.email}`}
                                className="text-green-700 hover:underline"
                              >
                                {spoc.email}
                              </a>
                            </div>
                          )}
                          {spoc.roll_no && (
                            <div className="text-sm text-slate-700">
                              Roll: {spoc.roll_no}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {job.description && (
            <div className="bg-slate-50 rounded-lg p-5">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                Job Description
              </h3>
              <p className="text-slate-700 whitespace-pre-wrap">
                {job.description}
              </p>
            </div>
          )}

          {job.requirements && (
            <div className="bg-slate-50 rounded-lg p-5">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                Requirements
              </h3>
              <p className="text-slate-700 whitespace-pre-wrap">
                {job.requirements}
              </p>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Users className="h-5 w-5" />
                Candidates ({candidates.length})
              </h3>
            </div>

            {loading ? (
              <div className="bg-slate-50 rounded-lg p-8 text-center">
                <p className="text-slate-500">Loading candidates...</p>
              </div>
            ) : candidates.length === 0 ? (
              <div className="bg-slate-50 rounded-lg p-8 text-center">
                <Users className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No candidates have applied yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {candidates.map(candidate => (
                  <div
                    key={candidate.appl_id}
                    className="border border-slate-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-slate-900">
                          {candidate.student_name}
                        </h4>
                        <div className="mt-2 space-y-1">
                          {candidate.email && (
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <Mail className="h-4 w-4" />
                              <a
                                href={`mailto:${candidate.email}`}
                                className="hover:text-blue-600"
                              >
                                {candidate.email}
                              </a>
                            </div>
                          )}
                          {candidate.branch && (
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              Branch:  {candidate.branch}
                            </div>
                          )}
                          {candidate.cgpa && (
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              CGPA:  {candidate.cgpa}
                            </div>
                          )}
                          {candidate.phone && (
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <Phone className="h-4 w-4" />
                                {candidate.phone}        
                            </div>
                          )}
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStageColor(
                          candidate.current_stage || candidate.status
                        )}`}
                      >
                        {candidate.current_stage ||
                          candidate.status ||
                          "Applied"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                      {candidate.applied_at && (
                        <span className="text-xs text-slate-500">
                          Applied:{" "}
                          {new Date(candidate.created_at).toLocaleDateString()}
                        </span>
                      )}
                      {candidate.resume_url && (
                        <a
                          href={candidate.resume_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline font-medium"
                        >
                          View Resume
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
