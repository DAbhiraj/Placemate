import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Search,
  Filter,
  MapPin,
  Calendar,
  DollarSign,
  Briefcase,
  ArrowRight,
  Lock,
} from "lucide-react";
import ApplicationForm from "./ApplicationForm"; // Assuming this is in the same folder

const API_URL = import.meta.env.VITE_API_URL;

// Helper function to parse salary strings (e.g., "$80,000 - $100,000")
const parseSalary = (salaryStr) => {
  if (!salaryStr) return 0;
  // Get the first number, remove commas and symbols
  const numStr = salaryStr.split("-")[0].replace(/[^\d]/g, "");
  return parseInt(numStr, 10) || 0;
};

const JobOpportunities = () => {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [appliedJobs, setAppliedJobs] = useState(new Set());

  const [searchTerm, setSearchTerm] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [filterSalary, setFilterSalary] = useState("");
  const [sortBy, setSortBy] = useState("postedDate");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isStudentSelected, setIsStudentSelected] = useState(false);

  // 1. Fetch Jobs (from JobsPage.jsx)
  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.get(`${API_URL}/jobs`);
      const raw = response?.data;
      const list = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.jobs)
        ? raw.jobs
        : [];

        console.log('list');
        console.log(list);

      const normalized = list.map((j) => ({
        id: j.job_id,
        title: j.title ?? j.role ?? "",
        company: j.company ?? j.company_name ?? "",
        location: j.location ?? "Remote",
        salary: j.package ?? "Not Disclosed",
        application_deadline: j.application_deadline ?? j.applicationDeadline ?? j.deadline ?? null,
        postedDate:
          j.postedDate ??
          j.created_at ??
          j.createdAt ??
          new Date().toISOString(),
        description: j.description ?? "No description available.",
        company_logo: j.company_logo,
        job_type: j.job_type || j.jobType || j.type || null,
      }));
      setJobs(normalized);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  // 2. Fetch User Applications (from JobsPage.jsx)
  const fetchUserApplications = async () => {
    try {
      const userId = localStorage.getItem("id"); // Assumes user ID is in localStorage
      if (!userId || jobs.length === 0) return;

      const response = await axios.get(
        `${API_URL}/applications/userId/${userId}`
      );
      const applications = response.data || [];

      // Check if user is selected
      let hasSelection = false;
      applications.forEach((app) => {
        if (app.status) {
          console.log("app.status is " + app.status);
          if (app.status === "selected") {
            hasSelection = true;
          }
        }
      });

      console.log("is the user selected " + hasSelection);
      setIsStudentSelected(hasSelection);

      // Create a set of applied job IDs based on company_name and role matching
      const appliedJobIds = new Set();
      applications.forEach((app) => {
        const matchingJob = jobs.find(
          (job) => job.company === app.company_name && job.title === app.role
        );
        if (matchingJob) {
          appliedJobIds.add(matchingJob.id);
        }
      });

      setAppliedJobs(appliedJobIds);
    } catch (err) {
      console.error("Failed to fetch user applications:", err);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    // Fetch applied status once jobs are loaded
    if (jobs.length > 0) {
      fetchUserApplications();
    }
  }, [jobs]);

  // 3. Modal/Form Handling (from JobsPage.jsx)
  const handleViewDetailsClick = (job) => {
    setSelectedJob(job);
  };

  const handleCloseForm = () => {
    setSelectedJob(null);
    // Refresh applied jobs list after closing form
    fetchUserApplications();
  };

  // 4. Filter and Sort Logic (from Companies.jsx, adapted for Jobs)
  const filteredJobs = jobs
    .filter((job) => {
      // Determine user's application type (prioritize stored value, fallback to roll_no heuristic)
      const storedAppType = localStorage.getItem('application_type');
      const roll = localStorage.getItem('roll_no') || '';
      const userAppType = storedAppType || ((String(roll).slice(0,2) === '23') ? 'internship' : 'fte');

      const matchesSearch =
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesLocation =
        !filterLocation ||
        job.location.toLowerCase().includes(filterLocation.toLowerCase());

      const jobSalary = parseSalary(job.salary);
      const matchesSalary =
        !filterSalary ||
        (filterSalary === "high" && jobSalary >= 150000) ||
        (filterSalary === "medium" &&
          jobSalary >= 80000 &&
          jobSalary < 150000) ||
        (filterSalary === "entry" && jobSalary < 80000);

      // If job defines a job_type, only show jobs matching user's application type
      if (job.job_type && userAppType) {
        if (job.job_type !== userAppType) return false;
      }

      return matchesSearch && matchesLocation && matchesSalary;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "postedDate":
          // Newest first
          return (
            new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime()
          );
        case "salary":
          // Highest first
          return parseSalary(b.salary) - parseSalary(a.salary);
        case "title":
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  // 5. Render ApplicationForm if a job is selected (from JobsPage.jsx)
  if (selectedJob) {
    const isApplied = appliedJobs.has(selectedJob.id);
    return (
      <ApplicationForm
        job={selectedJob}
        isApplied={isApplied}
        onClose={handleCloseForm}
      />
    );
  }

  // 6. Render Main List Page (UI from Companies.jsx)
  return (
    <div className="space-y-6 p-4 md:p-8 bg-slate-50 min-h-screen">
      {/* Header (from Companies.jsx) */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-sm border p-6">
        <h1 className="text-2xl font-bold text-white mb-2">
          Job Opportunities
        </h1>
        <p className="text-white">Browse and apply to available positions</p>
      </div>

      {/* Search and Filters (from Companies.jsx, adapted) */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search jobs or companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Location..."
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={filterSalary}
            onChange={(e) => setFilterSalary(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Salaries</option>
            <option value="high">High ($150k+)</option>
            <option value="medium">Medium ($80k - $150k)</option>
            <option value="entry">Entry (Below $80k)</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="postedDate">Sort by Posted Date</option>
            <option value="salary">Sort by Salary</option>
            <option value="title">Sort by Title</option>
          </select>
        </div>
      </div>

      {/* Error Message (from JobsPage.jsx) */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Job Cards (Grid from Companies.jsx) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
          <div className="lg:col-span-2 text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading jobs...</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="lg:col-span-2 text-center py-12">
            <Filter className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No jobs found
            </h3>
            <p className="text-gray-500">Try adjusting your search criteria</p>
          </div>
        ) : (
          filteredJobs.map((job) => {
            const isApplied = appliedJobs.has(job.id);

            return (
              // Card styling from Companies.jsx
              <div
                key={job.id}
                className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-all duration-200"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {/* Icon from JobsPage.jsx */}
                      <div className="flex items-center space-x-3">
                        <img
                          src={job.logo_url || "/placeholder-logo.png"} // fallback
                          alt="Company Logo"
                          className="w-12 h-12 object-contain rounded-md bg-white border"
                          loading="lazy"
                        />
                        <div>
                          <h3 className="font-semibold">
                            {job.company_name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {job.package_range}
                          </p>
                        </div>
                      </div>

                      <div>
                        {/* Content from JobsPage.jsx */}
                        <h3 className="text-xl font-semibold text-gray-900">
                          {job.title}
                        </h3>
                        <p className="text-gray-600 font-medium">
                          {job.company}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {/* Salary Tag (like Package from Companies.jsx) */}
                      <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
                        ₹{job.salary} LPA
                      </span>
                      {/* Applied Tag (new) */}
                      {isApplied && (
                        <div className="mt-2">
                          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                            Applied
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Description (from Companies.jsx) */}
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {job.description}
                  </p>

                  <div className="space-y-3">
                    {/* Info Section (Merged) */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-4">
                        <span className="text-gray-500 flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {job.location}
                        </span>
                        <span className="text-gray-500 flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          Posted {new Date(job.postedDate).toLocaleDateString()}
                        </span>
                        {job.application_deadline && (
                          <span className="text-gray-500 flex items-center ml-4">
                            <Lock className="w-4 h-4 mr-1" />
                            Deadline {new Date(job.application_deadline).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Footer / Actions (from Companies.jsx, logic from JobsPage.jsx) */}
                    <div className="flex items-center justify-end pt-4 border-t border-gray-100">
                      {(!job.application_deadline || new Date(job.application_deadline) >= new Date()) && (
                        <button
                          onClick={() => handleViewDetailsClick(job)}
                          disabled={isStudentSelected} // ✅ disable if selected anywhere
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                            isStudentSelected
                              ? "bg-gray-400 cursor-not-allowed text-white"
                              : isApplied
                              ? "bg-green-600 hover:bg-green-700 text-white"
                              : "bg-blue-600 hover:bg-blue-700 text-white"
                          }`}
                        >
                          <span>
                            {isStudentSelected
                              ? "Applications Locked"
                              : isApplied
                              ? "View Application"
                              : "View & Apply"}
                          </span>
                          {!isApplied && !isStudentSelected && (
                            <ArrowRight className="w-4 h-4" />
                          )}
                        </button>
                      )}
                      {job.application_deadline && new Date(job.application_deadline) < new Date() && (
                        <span className="text-red-500 font-medium">Application Closed</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default JobOpportunities;
