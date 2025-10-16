import { useState, useEffect } from "react"
import { X, Upload, Send, ArrowLeft } from "lucide-react"

export default function ApplicationForm({ job, onClose }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    branch: "",
    cgpa: "",
    answers: {},
    resumeUrl: ""
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const name = localStorage.getItem("name") || ""
    const email = localStorage.getItem("email") || ""
    const branch = localStorage.getItem("branch") || ""
    const cgpa = localStorage.getItem("cgpa") || ""

    setFormData(prev => ({
      ...prev,
      name,
      email,
      branch,
      cgpa
    }))
  }, [])

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/jobs/${job.id}/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          answers: formData.answers,
          resumeUrl: formData.resumeUrl
        })
      })

      if (!response.ok) {
        throw new Error("Failed to submit application")
      }

      setSuccess(true)
      setTimeout(() => {
        onClose()
      }, 2000)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to submit application"
      )
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerChange = (question, answer) => {
    setFormData(prev => ({
      ...prev,
      answers: {
        ...prev.answers,
        [question]: answer
      }
    }))
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
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

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Jobs</span>
        </button>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-slate-900 px-8 py-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">
                  Apply for {job.title}
                </h1>
                <p className="text-slate-300">
                  {job.company} • {job.location}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-slate-300 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-50 text-slate-900 cursor-not-allowed"
                  disabled
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-50 text-slate-900 cursor-not-allowed"
                  disabled
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Branch
                </label>
                <input
                  type="text"
                  value={formData.branch}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-50 text-slate-900 cursor-not-allowed"
                  disabled
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  CGPA
                </label>
                <input
                  type="text"
                  value={formData.cgpa}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-50 text-slate-900 cursor-not-allowed"
                  disabled
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
                  onChange={e =>
                    setFormData({ ...formData, resumeUrl: e.target.value })
                  }
                  className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition"
                  placeholder="https://example.com/resume.pdf"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Why do you want to work here?
              </label>
              <textarea
                value={formData.answers["motivation"] || ""}
                onChange={e => handleAnswerChange("motivation", e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition resize-none"
                rows={4}
                placeholder="Tell us why you're interested in this position..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                What are your key strengths?
              </label>
              <textarea
                value={formData.answers["strengths"] || ""}
                onChange={e => handleAnswerChange("strengths", e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition resize-none"
                rows={4}
                placeholder="Describe your key strengths..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Additional Information
              </label>
              <textarea
                value={formData.answers["additional"] || ""}
                onChange={e => handleAnswerChange("additional", e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition resize-none"
                rows={3}
                placeholder="Any additional information you'd like to share..."
              />
            </div>

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
                    <span>Submit Application</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
