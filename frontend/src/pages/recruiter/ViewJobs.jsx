import {
  Briefcase,
  MapPin,
  Calendar,
  Edit,
  Trash2,
  Plus,
  IndianRupee,
  Users,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import CreateJob from "./CreateJob";

const getJobStatusColor = (status) => {
  const statusColors = {
    "in initial stage": "bg-gray-100 text-gray-700",
    "in review": "bg-blue-100 text-blue-700",
    "in negotiation": "bg-orange-100 text-orange-700",
    "applications opened": "bg-green-100 text-green-700",
    "ot conducted": "bg-purple-100 text-purple-700",
    interview: "bg-red-100 text-red-700",
    "completed the drive": "bg-emerald-100 text-emerald-700",
  };
  const key = (status || "").toLowerCase();
  return statusColors[key] || "bg-gray-100 text-gray-700";
};

export default function ViewJobs() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [showJobForm, setShowJobForm] = useState(false);
  const [editingJobId, setEditingJobId] = useState(null);
  const [editingJobData, setEditingJobData] = useState(null);
  const company = localStorage.getItem("company");

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get(`/recruiter/jobs/${company}`);
      const data = response.data;
      // Helper function to format dates
      const formatDate = (dateString) => {
        if (!dateString) return null;

        // If already formatted in DD/MM/YYYY, HH:MM format (24-hour from backend)
        if (/^\d{2}\/\d{2}\/\d{4}, \d{2}:\d{2}$/.test(dateString)) {
          const [datePart, timePart] = dateString.split(", ");
          const [hours24, minutes] = timePart.split(":");
          const hour = parseInt(hours24);
          const period = hour >= 12 ? "PM" : "AM";
          const hours12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
          return `${datePart}, ${hours12}:${minutes} ${period}`;
        }

        // If already formatted in DD/MM/YYYY format (without time)
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
          return dateString;
        }

        // If already formatted (YYYY-MM-DD), return as is
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
          const [year, month, day] = dateString.split("-");
          return `${day}/${month}/${year}`;
        }

        // Otherwise format the date
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return null;
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${day}/${month}/${year}`;
      };

      const formattedJobs = (Array.isArray(data) ? data : data.jobs || []).map(
        (job) => {
          const normalizedType = (job.job_type || job.type || "Full Time")
            .toString()
            .trim();
          const typeLower = normalizedType.toLowerCase();
          const typeLabel =
            typeLower === "internship"
              ? "Internship"
              : typeLower === "full time"
              ? "Full Time"
              : normalizedType;

          const rawStatus = (
            job.job_status ||
            job.jobStatus ||
            "in initial stage"
          )
            .toString()
            .trim();
          const statusLower = rawStatus.toLowerCase();
          const toTitle = (str) =>
            str
              .split(" ")
              .map((s) => (s ? s[0].toUpperCase() + s.slice(1) : ""))
              .join(" ");
          const statusLabel = toTitle(statusLower);

          return {
            id: job.job_id,
            title: job.role || "Not Specified",
            type: typeLabel,
            typeRaw: typeLower,
            location: job.location || "Not Provided",
            salary: job.package || "N/A",
            deadline: formatDate(job.application_deadline),
            otDeadline: formatDate(job.online_assessment_date),
            applications: job.applied_count || 0,
            postedDate: formatDate(job.created_at),
            company: job.company_name,
            minCgpa: job.min_cgpa ? `${job.min_cgpa}+` : "N/A",
            eligibleBranches: job.eligible_branches || "All",
            description: job.description || "",
            applicationDeadline: formatDate(job.application_deadline),
            onlineAssessmentDate: formatDate(job.online_assessment_date),
            interviewDates: Array.isArray(job.interview_dates)
              ? job.interview_dates.map((d) => formatDate(d)).filter(Boolean)
              : [],
            jobStatus: statusLabel,
            jobStatusRaw: statusLower,
          };
        }
      );
      setJobs(formattedJobs);
      setError("");
      console.log(data);
    } catch (err) {
      setError(err.message || "Error loading jobs");
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (jobId) => {
    if (!window.confirm("Are you sure you want to delete this job?")) {
      return;
    }

    try {
      const response = await axiosClient.delete(`/recruiter/jobs/${jobId}`);

      setJobs(jobs.filter((job) => job.id !== jobId));
      alert("Job deleted successfully");
    } catch (err) {
      alert("Error deleting job: " + err.message);
    }
  };

  const handleEdit = async (jobId) => {
    try {
      // Find the job in the current jobs array
      const job = jobs.find((j) => j.id === jobId);

      if (!job) {
        alert("Job not found");
        return;
      }

      console.log(job);

      // Helper to format date for input field (datetime-local format: YYYY-MM-DDTHH:MM)
      const formatDateForInput = (dateString) => {
        if (!dateString) return "";

        // If in DD/MM/YYYY, HH:MM AM/PM format
        if (/^\d{2}\/\d{2}\/\d{4}, \d{1,2}:\d{2} (AM|PM)$/.test(dateString)) {
          const [datePart, timePart] = dateString.split(", ");
          const [day, month, year] = datePart.split("/");
          const [time, period] = timePart.split(" ");
          const [hours, minutes] = time.split(":");

          // Convert to 24-hour format
          let hours24 = parseInt(hours);
          if (period === "PM" && hours24 !== 12) {
            hours24 += 12;
          } else if (period === "AM" && hours24 === 12) {
            hours24 = 0;
          }

          const hoursStr = String(hours24).padStart(2, "0");
          return `${year}-${month}-${day}T${hoursStr}:${minutes}`;
        }

        // If in DD/MM/YYYY format (without time)
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
          const [day, month, year] = dateString.split("/");
          return `${year}-${month}-${day}T00:00`;
        }

        // If already in YYYY-MM-DDTHH:MM format, return as is
        if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(dateString))
          return dateString;

        // If in DD-MM-YYYY format
        if (/^\d{2}-\d{2}-\d{4}$/.test(dateString)) {
          const [day, month, year] = dateString.split("-");
          return `${year}-${month}-${day}T00:00`;
        }

        // If already in YYYY-MM-DD format
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
          return `${dateString}T00:00`;
        }

        // Otherwise parse and format
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "";
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        return `${year}-${month}-${day}T${hours}:${minutes}`;
      };

      // Transform the job data to match form structure
      const jobData = {
        companyName: job.company || "",
        jobRole: job.title || "",
        department: Array.isArray(job.eligibleBranches)
          ? job.eligibleBranches
          : job.eligibleBranches
          ? job.eligibleBranches.split(", ")
          : [],
        location: job.location ? job.location.split(", ").filter((l) => l) : [],
        salary: job.salary || "",
        deadline: formatDateForInput(job.applicationDeadline),
        jobType: job.type || "Full Time",
        jobStatus: job.jobStatus || "in initial stage",
        description: job.description || "",
        skills: "",
        minimumCgpa: job.minCgpa ? job.minCgpa.replace("+", "") : "",
        eligibleBranches: "",
        onlineAssessmentDate: formatDateForInput(job.onlineAssessmentDate),
        interviewDates:
          Array.isArray(job.interviewDates) && job.interviewDates.length > 0
            ? job.interviewDates.map((date) => formatDateForInput(date))
            : [""],
      };

      setEditingJobId(jobId);
      setEditingJobData(jobData);
      setShowJobForm(true);
    } catch (err) {
      alert("Error loading job details: " + err.message);
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const statusMatch =
      statusFilter === "All Status" ||
      (job.jobStatusRaw || "") === statusFilter.toLowerCase();
    const typeMatch =
      typeFilter === "All Types" ||
      (job.typeRaw || "") === typeFilter.toLowerCase();
    return statusMatch && typeMatch;
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <Briefcase className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Your Job Postings
            </h2>
            <p className="text-sm text-gray-500">
              {jobs.length} total jobs posted
            </p>
            <p className="text-xs mt-1 flex flex-wrap items-center gap-2">
              <span className="text-gray-400">Stage flow:</span>
              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-600">
                In Initial Stage
              </span>
              →
              <span className="px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">
                In Review
              </span>
              →
              <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
                In Negotiation
              </span>
              →
              <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                Applications Opened
              </span>
              →
              <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                OT Conducted
              </span>
              →
              <span className="px-2 py-0.5 rounded-full bg-pink-100 text-pink-700">
                Interview
              </span>
              →
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                Completed the Drive
              </span>
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setShowJobForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Create Job
          </button>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option>All Status</option>
            <option value="in initial stage">In Initial Stage</option>
            <option value="in review">In Review</option>
            <option value="in negotiation">In Negotiation</option>
            <option value="applications opened">Applications Opened</option>
            <option value="ot conducted">OT Conducted</option>
            <option value="interview">Interview</option>
            <option value="completed the drive">Completed the Drive</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option>All Types</option>
            <option value="full time">Full Time</option>
            <option value="internship">Internship</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <p className="text-gray-500">Loading jobs...</p>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="flex justify-center py-8">
          <p className="text-gray-500">No jobs found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white border-gray-200"
            >
              {/* Header: Title, Status, and Actions */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-semibold text-gray-900">
                      {job.title}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getJobStatusColor(
                        job.jobStatus
                      )}`}
                    >
                      {job.jobStatus}
                    </span>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 whitespace-nowrap">
                      {job.type}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{job.company}</p>
                </div>

                <div className="flex gap-1 ml-3 flex-shrink-0">
                  <button
                    onClick={() => handleEdit(job.id)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 transition-colors"
                    title="Edit Job"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={() =>
                      navigate(
                        `/recruiter/candidates?jobId=${
                          job.id
                        }&jobTitle=${encodeURIComponent(job.title)}`
                      )
                    }
                    className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700 transition-colors"
                    title="View Candidates"
                  >
                    <Users className="w-3.5 h-3.5" />
                    Applications
                  </button>
                  <button
                    className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 text-white rounded text-xs font-medium hover:bg-purple-700 transition-colors"
                    title="View Spoc"
                  >
                    <Users className="w-3.5 h-3.5" />
                    Spoc
                  </button>
                  <button
                    onClick={() => handleDelete(job.id)}
                    className="flex items-center gap-1 px-3 py-1.5 border border-red-300 text-red-700 rounded text-xs font-medium hover:bg-red-50 transition-colors"
                    title="Delete Job"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
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
                    <p className="text-gray-500">
                      {job.type === "INTERNSHIP" ? "Stipend" : "Salary"}
                    </p>
                    <p className="text-gray-900 font-medium">{job.salary}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Calendar className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-gray-500">Application Deadline</p>
                    <p className="text-gray-900 font-medium">
                      {job.applicationDeadline || job.deadline || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Calendar className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-gray-500">OT Date</p>
                    <p className="text-gray-900 font-medium">
                      {job.otDeadline || "TBA"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Secondary Details: Min CGPA, Branches, Posted Date, Applications */}
              <div className="flex flex-wrap gap-3 text-xs">
                <div>
                  <span className="text-gray-500">Min CGPA: </span>
                  <span className="text-gray-900 font-medium">
                    {job.minCgpa}
                  </span>
                </div>

                <div className="flex-1">
                  <span className="text-gray-500">Branches: </span>
                  <span className="text-gray-900 font-medium">
                    {job.eligibleBranches}
                  </span>
                </div>

                <div>
                  <span className="text-gray-500">Posted: </span>
                  <span className="text-gray-900 font-medium">
                    {job.postedDate}
                  </span>
                </div>

                <div>
                  <span className="text-gray-500">Applications: </span>
                  <span className="text-gray-900 font-medium">
                    {job.applications || 0}
                  </span>
                </div>
              </div>

              {/* Interview Dates - If Available */}
              {job.interviewDates && job.interviewDates.length > 0 ? (
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Interview Dates:</p>
                  <div className="flex flex-wrap gap-1">
                    {(Array.isArray(job.interviewDates)
                      ? job.interviewDates
                      : [job.interviewDates]
                    )
                      .filter(Boolean)
                      .map((date, idx) => (
                        <span
                          key={idx}
                          className="inline-block px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium"
                        >
                          {date || "TBA"}
                        </span>
                      ))}
                  </div>
                </div>
              ) : (
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Interview Dates:</p>
                  <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                    TBA
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Job Form Modal */}
      {showJobForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CreateJob
              isModal={true}
              jobId={editingJobId}
              initialData={editingJobData}
              onClose={() => {
                setShowJobForm(false);
                setEditingJobId(null);
                setEditingJobData(null);
              }}
              onJobCreated={() => {
                setShowJobForm(false);
                setEditingJobId(null);
                setEditingJobData(null);
                fetchJobs();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
