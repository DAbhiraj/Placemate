import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Search, Filter, Calendar, Eye, RefreshCw } from "lucide-react";
import axios from "axios";
import { formatDateTime } from "../../utils/helpers"; 
import ApplicationForm from "./ApplicationForm";
import Loader from "../../components/UI/Loader";

const API_URL = import.meta.env?.VITE_API_URL || "http://localhost:4000/api";

// --- Helper Component for Statistics Cards ---
const StatCard = ({ label, count, textColor, isLoading }) => (
  <div className="bg-white border rounded-lg p-4 text-center shadow-sm hover:shadow-md transition-shadow">
    {isLoading ? (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-16 mx-auto mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-20 mx-auto"></div>
      </div>
    ) : (
      <>
        <div className={`text-2xl font-bold ${textColor}`} role="status" aria-label={`${label}: ${count}`}>
          {count}
        </div>
        <div className="text-sm text-gray-500">{label}</div>
      </>
    )}
  </div>
);

// --- Helper Component for Status Badge ---
const StatusBadge = ({ status }) => {
  const statusLower = String(status || "not applied").toLowerCase();
  const normalized = statusLower.replace(/[-_]+/g, " ").trim();

  const statusConfig = useMemo(() => {
    // Map backend statuses to colors
    const configs = {
      "not applied": { color: "indigo", label: "Need to Apply" },
      // "ineligible": { color: "gray", label: "Ineligible" },
      "applied": { color: "blue", label: "Applied" },
      "shortlisted": { color: "yellow", label: "Shortlisted" },
      "interviewed": { color: "purple", label: "Interviewed" },
      "selected": { color: "green", label: "Selected" },
      "rejected": { color: "red", label: "Rejected" },
      "deadline missed": { color: "red", label: "Deadline Missed" },
    };

    for (const key in configs) {
      if (normalized.includes(key)) {
        return configs[key];
      }
    }

    return { color: "gray", label: "not applied" };
  }, [normalized]);

  // Tailwind-safe color mapping
  const badgeColors = {
    gray: "bg-gray-100 text-gray-800",
    red: "bg-red-100 text-red-800",
    blue: "bg-blue-100 text-blue-800",
    yellow: "bg-yellow-100 text-yellow-800",
    purple: "bg-purple-100 text-purple-800",
    green: "bg-green-100 text-green-800",
    indigo: "bg-indigo-100 text-indigo-800"
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${badgeColors[statusConfig.color]} capitalize`}
      role="status"
      aria-label={`Status: ${statusConfig.label}`}
    >
      {statusConfig.label}
    </span>
  );
};


const UpcomingDashboard = () => { 
  const [jobsData, setJobsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [activeTab, setActiveTab] = useState('applications'); 
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Correct API endpoint (should be working if server is restarted)
      const userId = localStorage.getItem("id"); // Adjust based on how user ID is stored
      const response = await axios.get(`${API_URL}/applications/dashboard`, {
        params: { userId }
      });

      setJobsData(response.data);
    } catch (err) {
      // console.error now includes error message on the client side
      console.error("Error fetching dashboard data:", err); 
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    
    // Listen for application submission success to refresh the data
    window.addEventListener("application:submitted", fetchDashboardData);
    
    return () => {
      window.removeEventListener("application:submitted", fetchDashboardData);
    };
  }, [fetchDashboardData]);

  // 1. Calculate Status Counts (for the Stats Card)
  const statusCounts = useMemo(() => {
    const counts = {
      total: jobsData.length,
      'not applied': 0, 
      applied: 0,
      shortlisted: 0,
      interviewed: 0,
      selected: 0,
      rejected: 0,
    };

    jobsData.forEach(job => {
      const status = job.status?.toLowerCase();
      if (counts.hasOwnProperty(status)) {
        counts[status] += 1;
      }
    });
    
    // Calculate Active Applications
    counts['active'] = counts.applied + counts.shortlisted + counts.interviewed;
    
    return counts;
  }, [jobsData]);

  // 2. Filtered and Searched Data (for the Applications Tab)
  const filteredApplications = useMemo(() => {
    return jobsData.filter(job => {
      // 1. Filter by Search Term
      const matchesSearch = 
        job.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.role.toLowerCase().includes(searchTerm.toLowerCase());
      
      // 2. Filter by Status
      const jobStatus = job.status?.toLowerCase();
      const matchesStatus = 
        statusFilter === 'all' || 
        jobStatus === statusFilter ||
        (statusFilter === 'need to apply' && jobStatus === 'not applied');

      return matchesSearch && matchesStatus;
    });
  }, [jobsData, searchTerm, statusFilter]);
  
  // 3. Upcoming Deadlines Data (for the Upcoming Deadlines Tab)
  const upcomingDeadlines = useMemo(() => {
    const today = Date.now(); // use single reference

    return jobsData.filter( job => {
        if (job.status === 'rejected' || job.status === 'selected'){
          return false;
        }

        let isDeadlineUpcoming = false;
        let isActivityUpcoming = false;

        // 1️⃣ Deadline upcoming
        if (job.status === 'not applied' && job.application_deadline) {
            const d = new Date(job.application_deadline).getTime();
            if (d > today) isDeadlineUpcoming = true;
        }

        // 2️⃣ OA / Interview upcoming
        if (job.status !== 'not applied') {
            // Online Assessment
            if (job.online_assessment_date) {
                const oa = new Date(job.online_assessment_date).getTime();
                if (oa > today) isActivityUpcoming = true;
            }

            // Interview
            if (Array.isArray(job.interview_dates) && job.interview_dates.length > 0) {
                const firstInt = new Date(job.interview_dates[0]).getTime();
                if (firstInt > today) isActivityUpcoming = true;
            }
        }

        return isDeadlineUpcoming || isActivityUpcoming;
      })
      .map(job => {
        let sortDate = null;
        let activityType = "";

        const deadline = job.application_deadline
          ? new Date(job.application_deadline).getTime()
          : null;

        const oa = job.online_assessment_date
          ? new Date(job.online_assessment_date).getTime()
          : null;

        const interview = Array.isArray(job.interview_dates)
          ? new Date(job.interview_dates[0]).getTime()
          : null;

        // Priority 1 — Deadline
        if (job.status === 'not applied' && deadline > today) {
          sortDate = deadline;
          activityType = 'Deadline';
        }

        // Priority 2 — Online Assessment
        if (oa && oa > today && (!sortDate || oa < sortDate)) {
          sortDate = oa;
          activityType = 'Online Assessment';
        }

        // Priority 3 — Interview
        if (interview && interview > today && (!sortDate || interview < sortDate)) {
          sortDate = interview;
          activityType = 'Interview';
        }

        return {
          ...job,
          upcoming_date: sortDate ? new Date(sortDate).toISOString() : null,
          activity_type: activityType,
        };
      })

      .filter(job => job.upcoming_date)
      .sort((a, b) => new Date(a.upcoming_date) - new Date(b.upcoming_date));
  }, [jobsData]);

  const handleViewJob = (jobId) => {
    const job = jobsData.find(j => j.job_id === jobId);
    if (job) {
      // 👇 NEW MAPPING: Ensure job.id, job.title, and job.company are available for ApplicationForm
      setSelectedJob({
        ...job,
        id: job.job_id,           // Map job_id to the expected job.id
        title: job.role,          // Map role to job.title
        company: job.company_name // Map company_name to job.company
      });
    }
  };

  const handleCloseForm = () => {
    setSelectedJob(null);
    fetchDashboardData(); // Refresh data after applying/updating

    // Handle applying inside ApplicationForm
    const handleApply = async ({ jobId, answers, resumeUrl }) => {
      try {
        const studentId = localStorage.getItem("id");
        await axios.post(`${API_URL}/applications/create`, { studentId, jobId, answers, resumeUrl });
        setSelectedJob(null);
        window.dispatchEvent(new Event("application:submitted"));
      } catch (err) {
        console.error("Error submitting application:", err);
        alert("Failed to submit application.");
      }
    };
  };


  if (loading && jobsData.length === 0) return <Loader text="Loading Placement Dashboard..." />;

  // Status options for the filter dropdown
  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'not applied', label: 'Need to Apply' },
    { value: 'applied', label: 'Applied' },
    { value: 'shortlisted', label: 'Shortlisted' },
    { value: 'interviewed', label: 'Interviewed' },
    { value: 'selected', label: 'Selected' },
    { value: 'rejected', label: 'Rejected' },
  ];
  
  // Determine which list to show based on the active tab
  const currentList = activeTab === 'applications' ? filteredApplications : upcomingDeadlines;
  const isDeadlinesTab = activeTab === 'deadlines';

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-slate-900">Placement Dashboard</h1>
      
      {/* STATS CARD SECTION */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
        <StatCard label="Total Jobs" count={statusCounts.total} textColor="text-gray-800" isLoading={loading} />
        <StatCard label="Active Applications" count={statusCounts.active} textColor="text-blue-600" isLoading={loading} />
        <StatCard label="Need to Apply" count={statusCounts['not applied']} textColor="text-indigo-600" isLoading={loading} />
        <StatCard label="Applied" count={statusCounts.applied} textColor="text-yellow-600" isLoading={loading} />
        <StatCard label="Selected" count={statusCounts.selected} textColor="text-green-600" isLoading={loading} />
        <StatCard label="Rejected" count={statusCounts.rejected} textColor="text-red-600" isLoading={loading} />
        
      </div>

      {error && <div className="p-4 bg-red-100 text-red-700 rounded-lg mb-4">{error}</div>}

      <div className="bg-white rounded-xl shadow-lg p-6">
        
        {/* TABS */}
        <div className="flex border-b mb-6">
          <button
            onClick={() => setActiveTab('applications')}
            className={`py-3 px-4 text-sm font-semibold transition-colors ${
              activeTab === 'applications' 
                ? 'border-b-2 border-indigo-600 text-indigo-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            All Applications/Jobs
          </button>
          <button
            onClick={() => setActiveTab('deadlines')}
            className={`py-3 px-4 text-sm font-semibold transition-colors ${
              activeTab === 'deadlines' 
                ? 'border-b-2 border-indigo-600 text-indigo-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Upcoming Deadlines & Activities
            {upcomingDeadlines.length > 0 && (
              <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium leading-none text-red-100 bg-red-600 rounded-full">
                {upcomingDeadlines.length}
              </span>
            )}
          </button>
        </div>

        {/* SEARCH AND FILTER */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Company or Role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div className="relative" style={{ display: isDeadlinesTab ? 'none' : 'block' }}>
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-48 pl-10 pr-4 py-2 border border-gray-300 rounded-lg appearance-none focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          <button
            onClick={fetchDashboardData}
            className="p-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition"
            aria-label="Refresh Data"
            disabled={loading}
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* CONTENT DISPLAY */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {isDeadlinesTab ? 'Upcoming Date & Type' : 'Application Deadline'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentList.map((job) => (
                <tr key={job.job_id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{job.company_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{job.role}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {isDeadlinesTab 
                      ? (job.upcoming_date ? `${formatDateTime(job.upcoming_date, 'date')} (${job.activity_type})` : 'N/A')
                      : (job.application_deadline ? formatDateTime(job.application_deadline, 'date') : 'N/A')
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={job.status} /> 
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    {(() => {
                      // Check if deadline is missed
                      let deadlineMissed = false;
                      if (job.application_deadline) {
                        const deadline = new Date(job.application_deadline).getTime();
                        deadlineMissed = deadline < Date.now();
                      }
                      if (deadlineMissed) {
                        return (
                          <button
                            onClick={() => window.location.href = `/jobs/${job.job_id}`}
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                          >
                            View Details
                          </button>
                        );
                      } else {
                        return (
                          (job.status || "").toLowerCase().trim() === "not applied" ? (
                            <button
                              onClick={() => handleViewJob(job.job_id)}
                              className="text-sm text-green-600 hover:text-green-800 font-medium"
                            >
                              Apply
                            </button>
                          ) : (
                            <button
                              onClick={() => handleViewJob(job.job_id)}
                              className="text-sm text-yellow-600 hover:text-yellow-800 font-medium"
                            >
                              Update Application
                            </button>
                          )
                        );
                      }
                    })()}
                  </td>



                </tr>
              ))}
              {/* Handle Empty State */}
              {currentList.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500 text-sm">
                    No {activeTab === 'applications' ? 'jobs/applications found' : 'upcoming activities'} matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Application Form Modal */}
        {selectedJob && (
          <ApplicationForm 
            job={selectedJob} 
            onClose={handleCloseForm} 
          />
        )}
      </div>
    </div>
  );
};

export default UpcomingDashboard;