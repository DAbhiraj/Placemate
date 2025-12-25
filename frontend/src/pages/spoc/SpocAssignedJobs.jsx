import {
  Briefcase,
  MapPin,
  Users,
  Calendar,
  MessageSquare,
  CheckCircle,
  IndianRupee,
  Bell,
} from "lucide-react";
import { useState, useEffect } from "react";
import axiosClient from "../../api/axiosClient";
import SpocNotificationModal from "../../components/SPOC/SpocNotificationModal";

export default function SpocAssignedJobs() {
  const [assignedJobs, setAssignedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    fetchAssignedJobs();
  }, []);

  // Helper function to format dates from YYYY-MM-DD to DD/MM/YYYY
  const formatDate = (dateString) => {
    if (!dateString) return "TBA";
    if (dateString === "TBA") return "TBA";
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  const fetchAssignedJobs = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axiosClient.get(`/spoc/assigned-jobs`);
      setAssignedJobs(response.data);
    } catch (err) {
      console.error("Error fetching assigned jobs:", err);
      setError("Failed to load assigned jobs. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleJobStatusUpdate = async (jobId, newJobStatus) => {
    try {
      
      await axiosClient.put(`/spoc/jobs/${jobId}/job-status`, {
        job_status: newJobStatus,
      });

      setAssignedJobs((jobs) =>
        jobs.map((job) =>
          job.id === jobId ? { ...job, job_status: newJobStatus } : job
        )
      );
      alert(`Job status updated to: ${newJobStatus}`);
    } catch (err) {
      console.error("Error updating job status:", err);
      alert(err.response?.data?.message || "Failed to update job status");
    }
  };

  const getJobStatusColor = (jobStatus) => {
    const statusColors = {
      "in initial stage": "bg-gray-100 text-gray-700",
      "in review": "bg-blue-100 text-blue-700",
      "in negotiation": "bg-orange-100 text-orange-700",
      "applications opened": "bg-green-100 text-green-700",
      "ot conducted": "bg-purple-100 text-purple-700",
      interview: "bg-red-100 text-red-700",
      "completed the drive": "bg-emerald-100 text-emerald-700",
    };
    return statusColors[jobStatus] || "bg-gray-100 text-gray-700";
  };

  const handleOpenNotificationModal = (job) => {
    setSelectedJob(job);
    setShowNotificationModal(true);
  };

  const handleSendNotification = async (notificationData) => {
    try {
      const formData = new FormData();
      formData.append("statusUpdate", notificationData.notificationType);
      formData.append("companyName", notificationData.companyName);
      formData.append("customMessage", notificationData.description || "");
      formData.append("excelFile", notificationData.excelFile);

      await axiosClient.post(`/admin/send-notification`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Notifications sent successfully!");
      setShowNotificationModal(false);
    } catch (error) {
      console.error("Failed to send notifications:", error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Loading assigned jobs...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="text-red-500">{error}</div>
      </div>
    );
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
          assignedJobs.map((job) => (
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
                      className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getJobStatusColor(
                        job.job_status
                      )}`}
                    >
                      {job.job_status}
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
                  <button className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 transition-colors">
                    <MessageSquare className="w-3.5 h-3.5" />
                    Msg ({job.messages})
                  </button>
                  <button
                    onClick={() => handleOpenNotificationModal(job)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700 transition-colors"
                  >
                    <Bell className="w-3.5 h-3.5" />
                    Notify
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
                    <p className="text-gray-500">Salary</p>
                    <p className="text-gray-900 font-medium">{job.salary}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Calendar className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-gray-500">Application Deadline</p>
                    <p className="text-gray-900 font-medium">{formatDate(job.deadline)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Calendar className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-gray-500">OT Date</p>
                    <p className="text-gray-900 font-medium">
                      {formatDate(job.ot_deadline)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Secondary Details: Min CGPA, Branches, Posted Date, Interview Dates */}
              <div className="flex flex-wrap gap-3 text-xs">
                <div>
                  <span className="text-gray-500">Min CGPA: </span>
                  <span className="text-gray-900 font-medium">
                    {job.cgpaRequirement}
                  </span>
                </div>

                <div className="flex-1">
                  <span className="text-gray-500">Branches: </span>
                  <span className="text-gray-900 font-medium">
                    {job.branches}
                  </span>
                </div>

                <div>
                  <span className="text-gray-500">Posted: </span>
                  <span className="text-gray-900 font-medium">
                    {formatDate(job.postedDate)}
                  </span>
                </div>
              </div>

              {/* Job Status Update - Only if SPOC can update (in review or in negotiation) */}
              {(job.job_status === "in review" ||
                job.job_status === "in negotiation") && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-medium text-gray-700">
                      Update Job Status:
                    </label>
                    <select
                      value={job.job_status}
                      onChange={(e) =>
                        handleJobStatusUpdate(job.id, e.target.value)
                      }
                      className="px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="in review">In Review</option>
                      <option value="in negotiation">In Negotiation</option>
                      <option value="applications opened">
                        Applications Opened
                      </option>
                    </select>
                    <span className="text-xs text-gray-500">
                      {job.job_status === "in review"
                        ? "(Move to negotiation when terms are being discussed)"
                        : "(Open applications when finalized)"}
                    </span>
                  </div>
                </div>
              )}

              {/* Interview Dates - If Available */}
              {job.interview_deadline && job.interview_deadline.length > 0 ? (
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Interview Dates:</p>
                  <div className="flex flex-wrap gap-1">
                    {(Array.isArray(job.interview_deadline)
                      ? job.interview_deadline
                      : [job.interview_deadline]
                    ).map((date, idx) => (
                      <span
                        key={idx}
                        className="inline-block px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium"
                      >
                        {formatDate(date) || "TBA"}
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
          ))
        )}
      </div>

      {/* Notification Modal */}
      {showNotificationModal && selectedJob && (
        <SpocNotificationModal
          isOpen={showNotificationModal}
          onClose={() => setShowNotificationModal(false)}
          onSendNotification={handleSendNotification}
          job={selectedJob}
        />
      )}
    </div>
  );
}
