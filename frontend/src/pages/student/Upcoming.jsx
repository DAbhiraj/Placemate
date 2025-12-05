import React, { useState, useEffect } from "react";
import { Search, Filter, Calendar } from "lucide-react";
import axios from "axios";
import StatusBadge from "../../components/UI/StatusBadge";
import { formatDateTime } from "../../utils/helpers";
import ApplicationForm from "./ApplicationForm";
import Loader from "../../components/UI/Loader";

const API_URL = import.meta.env.VITE_API_URL ;

const UpcomingDeadlines = () => {
  const [applicationDeadlines, setApplicationDeadlines] = useState([]);
  const [onlineAssessments, setOnlineAssessments] = useState([]);
  const [interviewDeadlines, setInterviewDeadlines] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [allJobs, setAllJobs] = useState([]);

  const handleViewJob = (jobId) => {
    const job = allJobs.find((j) => j.id === jobId);
    if (job) {
      setSelectedJob(job);
    }
  };

  const handleCloseForm = () => {
    setSelectedJob(null);
  };

  useEffect(() => {
    const fetchAllDeadlines = async () => {
      const userId = localStorage.getItem("id");
      const branch = localStorage.getItem("branch");
      const cgpa = localStorage.getItem("cgpa") || 0;
      if (!userId) return;

      setLoading(true);
      try {
        // Fetch all jobs for quick reference
        const jobsRes = await axios.get(`${API_URL}/jobs`);
        const jobsList = Array.isArray(jobsRes.data) ? jobsRes.data : jobsRes.data?.jobs || [];
        const normalized = jobsList.map((j) => ({
          id: j.job_id,
          title: j.title ?? j.role ?? "",
          company: j.company ?? j.company_name ?? "",
          location: j.location ?? "Remote",
          salary: j.package ?? "Not Disclosed",
          application_deadline: j.application_deadline,
          postedDate: j.created_at ?? new Date().toISOString(),
          description: j.description ?? "No description available.",
          company_logo: j.company_logo,
        }));
        setAllJobs(normalized);

        // Call 1: Application Deadlines
        const appDeadlineRes = await axios.get(
          `${API_URL}/upcoming-deadlines/${userId}?type=application`,
          { params: { branch, cgpa } }
        );
        const appDeadlines = (appDeadlineRes.data || []).map((job) => ({
          id: `${job.job_id}-deadline`,
          job_id: job.job_id,
          company_name: job.company_name,
          role: job.role,
          date: job.application_deadline,
          type: "deadline",
          status: job.application_status,
        }));
        setApplicationDeadlines(appDeadlines.sort((a, b) => new Date(a.date) - new Date(b.date)));

        // Call 2: Online Assessments
        const assessmentRes = await axios.get(
          `${API_URL}/upcoming-deadlines/${userId}?type=assessment`,
          { params: { branch, cgpa } }
        );
        const assessments = (assessmentRes.data || []).map((job) => ({
          id: `${job.job_id}-assessment`,
          job_id: job.job_id,
          company_name: job.company_name,
          role: job.role,
          date: job.online_assessment_date,
          type: "online assessment",
          status: job.application_status,
        }));
        setOnlineAssessments(assessments.sort((a, b) => new Date(a.date) - new Date(b.date)));

        // Call 3: Interviews
        const interviewRes = await axios.get(
          `${API_URL}/upcoming-deadlines/${userId}?type=interview`,
          { params: { branch, cgpa } }
        );
        const interviews = (interviewRes.data || []).flatMap((job) => {
          if (!job.interview_dates?.length) return [];
          return job.interview_dates.map((date, idx) => ({
            id: `${job.job_id}-interview-${idx}`,
            job_id: job.job_id,
            company_name: job.company_name,
            role: job.role,
            date: date,
            type: "interview",
            status: job.application_status,
          }));
        });
        setInterviewDeadlines(interviews.sort((a, b) => new Date(a.date) - new Date(b.date)));
      } catch (err) {
        console.error("Failed to fetch deadlines:", err);
        setApplicationDeadlines([]);
        setOnlineAssessments([]);
        setInterviewDeadlines([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAllDeadlines();
  }, []);

  // Filter data by search term
  const filteredApplications = applicationDeadlines.filter((item) =>
    item.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredAssessments = onlineAssessments.filter((item) =>
    item.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredInterviews = interviewDeadlines.filter((item) =>
    item.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Upcoming Deadlines & Interviews</h1>
        <p className="text-gray-600">Track upcoming application deadlines, assessments and interviews</p>
      </div>

      {/* Show Loader while loading */}
      {loading ? (
        <Loader />
      ) : (
        <>
          {/* Search & Filter */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search companies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All</option>
                <option value="deadline">Deadline</option>
                <option value="online assessment">Online Assessment</option>
                <option value="interview">Interview</option>
              </select>
            </div>
          </div>

      {/* 3 Columns: Applications | Assessments | Interviews */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Applications */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Applications — Upcoming Deadlines</h2>
            <span className="text-sm text-gray-500">{filteredApplications.length} items</span>
          </div>
          {filteredApplications.length === 0 ? (
            <p className="text-sm text-gray-500">No upcoming application deadlines.</p>
          ) : (
            <ul className="space-y-3">
              {filteredApplications.map((it) => (
                <li key={it.id} className="p-3 border rounded-lg hover:shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{it.company_name}</div>
                      <div className="text-sm text-gray-600">{it.role}</div>
                      <div className="text-sm text-gray-500 mt-1 flex items-center"><Calendar className="w-4 h-4 mr-2" />{formatDateTime(it.date)}</div>
                    </div>
                    <div className="text-right">
                      <button onClick={() => handleViewJob(it.job_id)} className="text-sm text-blue-600 hover:underline">View</button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Online Assessments */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Online Assessments (Applied)</h2>
            <span className="text-sm text-gray-500">{filteredAssessments.length} items</span>
          </div>
          {filteredAssessments.length === 0 ? (
            <p className="text-sm text-gray-500">No upcoming online assessments for applied jobs.</p>
          ) : (
            <ul className="space-y-3">
              {filteredAssessments.map((it) => (
                <li key={it.id} className="p-3 border rounded-lg hover:shadow-sm flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">{it.company_name}</div>
                    <div className="text-sm text-gray-600">{it.role}</div>
                    <div className="text-sm text-gray-500 mt-1 flex items-center"><Calendar className="w-4 h-4 mr-2" />{formatDateTime(it.date)}</div>
                  </div>
                  <div>
                    <span className="inline-flex items-center px-2 py-1 rounded text-sm font-medium bg-yellow-100 text-yellow-800">Assessment</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Interviews */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Interviews (Shortlisted/Selected)</h2>
            <span className="text-sm text-gray-500">{filteredInterviews.length} items</span>
          </div>
          {filteredInterviews.length === 0 ? (
            <p className="text-sm text-gray-500">No upcoming interviews.</p>
          ) : (
            <ul className="space-y-3">
              {filteredInterviews.map((it) => (
                <li key={it.id} className="p-3 border rounded-lg hover:shadow-sm flex items-start justify-between">
                  <div>
                    <div className="font-medium text-gray-900">{it.company_name}</div>
                    <div className="text-sm text-gray-600">{it.role}</div>
                    <div className="text-sm text-gray-500 mt-1 flex items-center"><Calendar className="w-4 h-4 mr-2" />{formatDateTime(it.date)}</div>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-2 py-1 rounded text-sm font-medium bg-green-100 text-green-800">Interview</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Application Form Modal */}
      {selectedJob && (
        <ApplicationForm job={selectedJob} onClose={handleCloseForm} />
      )}
        </>
      )}
    </div>
  );
};

export default UpcomingDeadlines;
