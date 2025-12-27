import { useState, useEffect, useMemo } from "react"
import { X, Upload, Send, FileText } from "lucide-react"
import { formatDateTime } from "../../utils/helpers"
import axiosClient from "../../api/axiosClient"
import { useLocation, useNavigate, useParams } from "react-router-dom"

export default function ApplicationForm({ job, isApplied = false, onClose }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { jobId: routeJobId } = useParams()

  // Prefer explicit prop, then navigation state, then route param fallback
  const navigationJob = location.state?.job
  const initialJob = useMemo(() => {
    if (job) return job
    if (navigationJob) return navigationJob
    if (routeJobId) return { id: routeJobId }
    return null
  }, [job, navigationJob, routeJobId])

  const [jobData, setJobData] = useState(initialJob)
  const [jobLoading, setJobLoading] = useState(!initialJob || !initialJob.title)
  const [jobError, setJobError] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    branch: "",
    cgpa: "",
    answers: {},
    resumeUrl: "",
    resumeFilename: "",
  })
  const [jobDetailsLoaded, setJobDetailsLoaded] = useState(Boolean(initialJob))
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [showResumePreview, setShowResumePreview] = useState(false)
  const resumeIsPdf = useMemo(() => {
    const url = formData.resumeUrl || ""
    return !!url.match(/\.pdf(\?.*)?$/i)
  }, [formData.resumeUrl])

  useEffect(() => {
    if (!resumeIsPdf) {
      setShowResumePreview(false)
    }
  }, [resumeIsPdf])

  const resumeDisplayName = useMemo(() => {
    if (formData.resumeFilename) return formData.resumeFilename
    if (formData.resumeUrl) {
      try {
        const parsed = new URL(formData.resumeUrl)
        return decodeURIComponent(parsed.pathname.split("/").pop() || "") || "Your resume"
      } catch (err) {
        return "Your resume"
      }
    }
    return "Your resume"
  }, [formData.resumeFilename, formData.resumeUrl])
  const [hasExistingApp, setHasExistingApp] = useState(!!isApplied)
  const effectiveJobId = jobData?.id || routeJobId
  const [isDeadlineMissed, setIsDeadlineMissed] = useState(false)
  const [isReadOnly, setIsReadOnly] = useState(false)

  // Keep job data in sync with props or navigation state
  useEffect(() => {
    if (job) {
      setJobData(job)
      // Check deadline for prop-based job
      if (job.application_deadline) {
        const deadline = new Date(job.application_deadline).getTime()
        const missed = deadline < Date.now()
        setIsDeadlineMissed(missed)
        setIsReadOnly(missed)
      }
      return
    }

    if (navigationJob) {
      setJobData(navigationJob)
      // Check deadline for navigation job
      if (navigationJob.application_deadline) {
        const deadline = new Date(navigationJob.application_deadline).getTime()
        const missed = deadline < Date.now()
        setIsDeadlineMissed(missed)
        setIsReadOnly(missed)
      }
    }
  }, [job, navigationJob])

  // Fetch job details when opened via route refresh/direct link
  useEffect(() => {
    const idToLoad = job?.id || navigationJob?.id || routeJobId
    if (!idToLoad || (jobData && jobData.title && jobData.company)) return

    const loadJob = async () => {
      setJobLoading(true)
      setJobError("")
      try {
        const { data } = await axiosClient.get(`/jobs/${idToLoad}`)
        const mapped = {
          ...data,
          id: data?.job_id || idToLoad,
          title: data?.role || data?.title,
          company: data?.company_name || data?.company,
        }
        setJobData((prev) => ({ ...prev, ...mapped }))
        
        // Check if deadline is missed
        if (mapped.application_deadline) {
          const deadline = new Date(mapped.application_deadline).getTime()
          const missed = deadline < Date.now()
          setIsDeadlineMissed(missed)
          setIsReadOnly(missed)
        }
      } catch (err) {
        console.error("Error loading job details:", err)
        setJobError("Unable to load job details. You can still submit the form.")
        setJobData((prev) => prev || { id: idToLoad })
      } finally {
        setJobLoading(false)
      }
    }

    loadJob()
  }, [job, navigationJob, routeJobId, jobData])

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
        console.log(jobData)
        const { data } = await axiosClient.get(
          `/applications/${effectiveJobId}`
        )
        const profile = data?.profile || {}
        const existing = data?.existingApp || null
        const jobFromApi = data?.job || data?.jobDetails

        if (jobFromApi) {
          setJobData((prev) => ({
            ...prev,
            ...jobFromApi,
            id: jobFromApi?.id || jobFromApi?.job_id || effectiveJobId,
            title: jobFromApi?.title || jobFromApi?.role,
            company: jobFromApi?.company || jobFromApi?.company_name,
          }))
        }

        setFormData((prev) => ({
          ...prev,
          name: profile.name ?? prev.name,
          email: profile.personal_email ?? prev.email,
          branch: profile.branch ?? prev.branch,
          cgpa: profile.cgpa ?? prev.cgpa,
          answers: existing?.answers ?? prev.answers,
          resumeUrl: existing?.resume_url ?? profile?.resume_url ?? prev.resumeUrl,
          resumeFilename: existing?.resume_filename ?? profile?.resume_filename ?? prev.resumeFilename,
        }))

        if (existing) setHasExistingApp(true)
      } catch (e) {
        // ignore errors; user can fill manually
      }
    }
    // Only fetch if a job id exists
    if(effectiveJobId) fetchPrefill() 
  }, [effectiveJobId])

  // Preserve formatting and make URLs clickable
  const renderTextWithLinks = (text) => {
    if (!text) return null;
    const urlRegex = /(https?:\/\/[^\s)]+|www\.[^\s)]+)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = urlRegex.exec(text)) !== null) {
      const index = match.index;
      const url = match[0];
      if (index > lastIndex) {
        parts.push(text.slice(lastIndex, index));
      }
      const href = url.startsWith('http') ? url : `https://${url}`;
      parts.push(
        <a
          key={index}
          href={href}
          target="_blank"
          rel="noreferrer"
          className="text-blue-600 hover:text-blue-800 underline"
        >
          {url}
        </a>
      );
      lastIndex = index + url.length;
    }

    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return <span className="whitespace-pre-wrap">{parts}</span>;
  };

  // Format dates safely; fallback to TBA
  const formatDateSafe = (value) => {
    if (!value) return "TBA";
    try {
      return formatDateTime(value, "date");
    } catch (e) {
      const d = new Date(value);
      return isNaN(d.getTime()) ? "TBA" : d.toLocaleDateString();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    const studentId = localStorage.getItem("id")
    if (!effectiveJobId) {
      setError("Missing job reference. Please start from the jobs list and try again.")
      setLoading(false)
      return
    }
    try {
      // Use resolved job id for submission (works for modal or routed usage)
      console.debug("Submitting application", { jobId: effectiveJobId, studentId, payload: { answers: formData.answers, resumeUrl: formData.resumeUrl } })
      const res = await axiosClient.post(
        `/applications/${effectiveJobId}/apply/${studentId}`,
        {
          answers: formData.answers,
          resumeUrl: formData.resumeUrl,
          resumeFilename: formData.resumeFilename || resumeDisplayName,
        }
      )

      console.debug("Application submit response:", res?.data)
      setSuccess(true)
      // notify parent/listeners to refresh
      try {
        window.dispatchEvent(new Event("application:submitted"))
      } catch (e) {}

      setTimeout(() => {
        closeForm()
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

  const isModal = Boolean(onClose)
  const closeForm = () => {
    if (onClose) {
      onClose()
    } else {
      navigate("/student/upcoming")
    }
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
  const locationDisplay = Array.isArray(jobData?.location)
    ? jobData.location.join(", ")
    : jobData?.location || "Location not specified"

  return (
    <div className={isModal ? "fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto" : "min-h-screen bg-slate-50 py-10 px-4"}>
      <div className={`bg-white rounded-2xl shadow-2xl overflow-hidden w-full ${isModal ? "max-w-3xl my-8" : "max-w-4xl mx-auto"}`}>
        <div className="bg-white px-8 py-6 border-b border-slate-200">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">
                {hasExistingApp
                  ? "Update your application for"
                  : "Apply for"}{" "}
                {/* Use job.title (mapped from job.role) */}
                {jobData?.title || "Loading job title..."}
              </h1>
              <p className="text-slate-600">
                {/* Use job.company (mapped from job.company_name) */}
                {(jobData?.company || "Company TBD")} • {locationDisplay}
              </p>
              {jobLoading && (
                <p className="text-sm text-slate-500 mt-2">Loading job details...</p>
              )}
              {jobError && (
                <div className="mt-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2">
                  {jobError}
                </div>
              )}
              {/* 📝 Show job description if present */}
              {jobData?.description && (
                <>
                <p className="mt-3 text-slate-900 text-sm leading-relaxed max-w-2xl font-bold">
                  Description
                </p>
                <div className="mt-3 text-slate-700 text-sm leading-relaxed max-w-2xl">
                  {renderTextWithLinks(jobData.description)}
                </div>
                {jobData.job_description_url && (
                  <a
                    href={jobData.job_description_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 mt-3 text-blue-600 hover:text-blue-800 text-sm font-semibold"
                  >
                    <FileText className="w-4 h-4" />
                    Download full description (PDF)
                  </a>
                )}
                <div className="mt-4 text-sm text-slate-700">
                  <p className="font-semibold text-slate-900">Key Dates</p>
                  <ul className="mt-1 space-y-1">
                    <li>
                      <span className="text-slate-600">Application Deadline:</span>
                      <span className="ml-1 text-slate-900">{formatDateSafe(jobData?.application_deadline)}</span>
                    </li>
                    <li>
                      <span className="text-slate-600">Online Assessment:</span>
                      <span className="ml-1 text-slate-900">{formatDateSafe(jobData?.online_assessment_date)}</span>
                    </li>
                    <li>
                      <span className="text-slate-600">Interview Dates:</span>
                      <span className="ml-1 text-slate-900">
                        {Array.isArray(jobData?.interview_dates) && jobData.interview_dates.length > 0
                          ? jobData.interview_dates.map((d, i) => (
                              <span key={i}>
                                {formatDateSafe(d)}{i < jobData.interview_dates.length - 1 ? ", " : ""}
                              </span>
                            ))
                          : "TBA"}
                      </span>
                    </li>
                  </ul>
                </div>
                </>

              )}
            </div>
            <button
              onClick={closeForm}
              className="text-slate-500 hover:text-slate-700 transition"
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

        {isDeadlineMissed && (
          <div className="px-8 pt-6">
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
              <p className="font-semibold">Application Deadline Passed</p>
              <p className="text-sm mt-1">The deadline for this job has passed. You can view the details below but cannot submit an application.</p>
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
                disabled={isReadOnly}
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
                disabled={isReadOnly}
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
                disabled={isReadOnly}
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
                disabled={isReadOnly}
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Resume
            </label>
            {/* <div className="relative">
              <Upload className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="url"
                value={formData.resumeUrl}
                onChange={(e) =>
                  setFormData({ ...formData, resumeUrl: e.target.value })
                }
                className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition"
                placeholder="https://example.com/resume.pdf"
                required={!isReadOnly}
                disabled={isReadOnly}
              />
            </div> */}
            {formData.resumeUrl && (
              <div className="border border-slate-200 bg-slate-50 rounded-2xl p-4 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{resumeDisplayName}</p>
                    <p className="text-xs text-slate-500">Auto-filled from your saved profile</p>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={formData.resumeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1 text-xs font-semibold text-slate-900 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-100"
                    >
                      View
                    </a>
                    {resumeIsPdf && (
                      <button
                        type="button"
                        onClick={() => setShowResumePreview((prev) => !prev)}
                        className="px-3 py-1 text-xs font-semibold text-slate-900 bg-slate-200 rounded-lg hover:bg-slate-300"
                      >
                        {showResumePreview ? "Hide preview" : "Preview"}
                      </button>
                    )}
                  </div>
                </div>
                {resumeIsPdf && showResumePreview && (
                  <div className="border border-slate-200 rounded-2xl overflow-hidden h-56">
                    <object
                      data={formData.resumeUrl}
                      type="application/pdf"
                      className="w-full h-full"
                    >
                      <div className="h-full flex items-center justify-center text-center px-4">
                        <p className="text-sm text-slate-600">
                          Preview not supported in this browser. 
                          <a
                            href={formData.resumeUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 underline"
                          >
                            Open in a new tab
                          </a>
                          .
                        </p>
                      </div>
                    </object>
                  </div>
                )}
                {!resumeIsPdf && (
                  <p className="text-xs text-slate-500">
                    Preview works for PDFs. Use “Open” to download or view other formats.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Custom Questions (if any) */}
          {Array.isArray(jobData?.custom_questions) && jobData.custom_questions.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-slate-700 mb-2">
                Additional Questions
              </p>
              <div className="space-y-4">
                {jobData.custom_questions.map((q, idx) => (
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
                      disabled={isReadOnly}
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
              onClick={closeForm}
              className={`${isReadOnly ? 'flex-1' : 'flex-1'} px-6 py-3 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition`}
            >
              {isReadOnly ? 'Close' : 'Cancel'}
            </button>
            {!isReadOnly && (
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
            )}
          </div>
        </form>
        </div>
      </div>
  )
}