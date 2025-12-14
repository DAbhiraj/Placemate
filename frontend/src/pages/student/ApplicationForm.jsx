import { useState, useEffect } from "react"
import { X, Upload, Send, ArrowLeft } from "lucide-react"
import axiosClient from "../../api/axiosClient"

export default function ApplicationForm({ job, isApplied = false, onClose }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    branch: "",
    cgpa: "",
    answers: {},
    resumeUrl: "",
  })
  console.log(job)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [hasExistingApp, setHasExistingApp] = useState(!!isApplied)

  useEffect(() => {
    const name = localStorage.getItem("name") || ""
    const email = localStorage.getItem("email") || ""
    const branch = localStorage.getItem("branch") || ""
    const cgpa = localStorage.getItem("cgpa") || ""

    setFormData((prev) => ({
      ...prev,
      name,
      email,
      branch,
      cgpa,
    }))
  }, [])

  useEffect(() => {
    const fetchPrefill = async () => {
      try {
        console.log(job);
        // FIX 1: Use job.id (mapped from job_id in Upcoming.jsx)
        const { data } = await axiosClient.get(
          `/applications/${job.id}`
        )
        const profile = data?.profile || {}
        const existing = data?.existingApp || null

        setFormData((prev) => ({
          ...prev,
          name: profile.name ?? prev.name,
          email: profile.personal_email ?? prev.email,
          branch: profile.branch ?? prev.branch,
          cgpa: profile.cgpa ?? prev.cgpa,
          answers: existing?.answers ?? prev.answers,
          resumeUrl: existing?.resume_url ?? prev.resumeUrl,
        }))

        if (existing) setHasExistingApp(true)
      } catch (e) {
        // ignore errors; user can fill manually
      }
    }
    // Only fetch if job.id exists
    if(job.id) fetchPrefill() 
  }, [job.id])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    const studentId = localStorage.getItem("id")
    try {
      const token = localStorage.getItem("token")
      // FIX 2: Use job.id for submission
      console.debug("Submitting application", { jobId: job.id, studentId, payload: { answers: formData.answers, resumeUrl: formData.resumeUrl } })
      const res = await axiosClient.post(
        `/applications/${job.id}/apply/${studentId}`,
        {
          answers: formData.answers,
          resumeUrl: formData.resumeUrl,
        }
      )

      console.debug("Application submit response:", res?.data)
      setSuccess(true)
      // notify parent/listeners to refresh
      try {
        window.dispatchEvent(new Event("application:submitted"))
      } catch (e) {}

      setTimeout(() => {
        onClose()
      }, 1200)
    } catch (err) {
      console.error("Application submit error:", err)
      const serverMsg = err?.response?.data?.message || err?.response?.data || null
      setError(serverMsg || (err instanceof Error ? err.message : "Failed to submit application"))
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerChange = (question, answer) => {
    setFormData((prev) => ({
      ...prev,
      answers: {
        ...prev.answers,
        [question]: answer,
      },
    }))
  }

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Send className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Application Submitted!
          </h2>
          <p className="text-slate-600">
            Your application has been successfully submitted.
          </p>
        </div>
      </div>
    )
  }

  // 🏙️ Handle location (supports string or array)
  const locationDisplay = Array.isArray(job.location)
    ? job.location.join(", ")
    : job.location || "Location not specified"

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-3xl my-8">
        <div className="bg-slate-900 px-8 py-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">
                {hasExistingApp
                  ? "Update your application for"
                  : "Apply for"}{" "}
                {/* Use job.title (mapped from job.role) */}
                {job.title}
              </h1>
              <p className="text-slate-300">
                {/* Use job.company (mapped from job.company_name) */}
                {job.company} • {locationDisplay}
              </p>
              {/* 📝 Show job description if present */}
              {job.description && (
                <>
                <p className="mt-3 text-white text-sm leading-relaxed max-w-2xl font-bold">
                  Description
                </p>
                <p className="mt-3 text-slate-400 text-sm leading-relaxed max-w-2xl">
                  {job.description}
                </p>
                </>

              )}
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-slate-300 transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {hasExistingApp && (
          <div className="px-8 pt-6">
            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
              You have already applied to this job. You can update and resubmit.
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-50 text-slate-900"
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-50 text-slate-900"
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Branch
              </label>
              <input
                type="text"
                value={formData.branch}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-50 text-slate-900"
                onChange={(e) =>
                  setFormData({ ...formData, branch: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                CGPA
              </label>
              <input
                type="text"
                value={formData.cgpa}
                onChange={(e) =>
                  setFormData({ ...formData, cgpa: e.target.value })
                }
                className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-50 text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Resume URL
            </label>
            <div className="relative">
              <Upload className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="url"
                value={formData.resumeUrl}
                onChange={(e) =>
                  setFormData({ ...formData, resumeUrl: e.target.value })
                }
                className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition"
                placeholder="https://example.com/resume.pdf"
                required
              />
            </div>
          </div>

          {/* Custom Questions (if any) */}
          {Array.isArray(job.custom_questions) && job.custom_questions.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-slate-700 mb-2">
                Additional Questions
              </p>
              <div className="space-y-4">
                {job.custom_questions.map((q, idx) => (
                  <div key={idx}>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      {q}
                    </label>
                    <input
                      type="text"
                      value={formData.answers?.[q] || ""}
                      onChange={(e) => handleAnswerChange(q, e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-white"
                      placeholder="Your answer"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-slate-900 text-white py-3 rounded-lg font-semibold hover:bg-slate-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Submitting...</span>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>
                    {hasExistingApp ? "Update Application" : "Submit Application"}
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
        </div>
      </div>
  )
}