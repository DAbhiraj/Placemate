import React, { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import {
  Search,
  MapPin,
  Calendar,
  Briefcase,
  ArrowRight,
  Lock,
  User,
} from "lucide-react";

const knownCities = [
  "hyderabad",
  "bangalore",
  "bengaluru",
  "chennai",
  "mumbai",
  "delhi",
  "pune",
  "kolkata",
  "noida",
  "gurgaon",
  "gurugram",
  "ahmedabad",
];

const parseSalary = (salaryStr) => {
  if (!salaryStr) return 0;
  const numStr = salaryStr
    .split("-")[0]
    .replace(/[^\d]/g, "")
    .replace(/,/g, "");
  return parseInt(numStr, 10) || 0;
};

const formatLocation = (value) => {
  if (!value) return "Remote";
  if (Array.isArray(value)) return value.filter(Boolean).join(", ");
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (/[,;|]/.test(trimmed)) {
      return trimmed.replace(/[;|]/g, ", ");
    }
    const lower = trimmed.toLowerCase();
    const matches = knownCities.filter((city) => lower.includes(city));
    if (matches.length > 0) {
      return matches.join(", ");
    }
    return trimmed.replace(/([a-z])([A-Z])/g, "$1, $2");
  }
  return String(value);
};

const formatDate = (iso) => {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

const formatDateTime = (iso) => {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
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

  const fetchJobs = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axiosClient.get(`/jobs`);
      const raw = response?.data;
      const list = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.jobs)
        ? raw.jobs
        : [];
      const normalized = list.map((j) => ({
        id: j.job_id,
        title: j.title ?? j.role ?? "",
        company: j.company ?? j.company_name ?? "",
        location: j.location ?? j.location_name ?? j.locations ?? "Remote",
        salary: j.package ?? j.package_range ?? j.salary ?? "Not Disclosed",
        application_deadline:
          j.application_deadline ?? j.applicationDeadline ?? j.deadline ?? null,
        postedDate:
          j.postedDate ?? j.created_at ?? j.createdAt ?? new Date().toISOString(),
        description: j.description ?? "No description available.",
        job_type: j.job_type || j.jobType || j.type || null,
        spoc_name:
          j.spoc_name || j.spoc?.name || (j.spocs && j.spocs[0]?.name) || null,
        spoc_email:
          j.spoc_email || j.spoc?.email || (j.spocs && j.spocs[0]?.email) || null,
      }));
      setJobs(normalized);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserApplications = async () => {
    try {
      const response = await axiosClient.get(`/applications`);
      const applications = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response?.data?.applications)
        ? response.data.applications
        : [];
      const appliedJobIds = new Set();
      applications.forEach((app) => {
        const match = jobs.find(
          (job) => job.company === app.company_name && job.title === app.role
        );
        if (match) {
          appliedJobIds.add(match.id);
        }
      });
      setAppliedJobs(new Set(appliedJobIds));
    } catch (err) {
      console.error("Failed to fetch user applications:", err);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    if (jobs.length > 0) {
      fetchUserApplications();
    }
  }, [jobs]);

  const filteredJobs = jobs
    .filter((job) => {
      const matchesSearch =
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase());
      const normalizedLocation = formatLocation(job.location).toLowerCase();
      const matchesLocation =
        !filterLocation ||
        normalizedLocation.includes(filterLocation.toLowerCase());
      const salaryValue = parseSalary(job.salary);
      const matchesSalary =
        !filterSalary ||
        (filterSalary === "high" && salaryValue >= 150000) ||
        (filterSalary === "medium" && salaryValue >= 80000 && salaryValue < 150000) ||
        (filterSalary === "entry" && salaryValue < 80000);
      return matchesSearch && matchesLocation && matchesSalary;
    })
    .sort((a, b) => {
      if (sortBy === "salary") {
        return parseSalary(b.salary) - parseSalary(a.salary);
      }
      if (sortBy === "title") {
        return a.title.localeCompare(b.title);
      }
      return new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime();
    });

  const handleViewDetailsClick = (job) => {
    setSelectedJob(job);
  };

  const handleCloseForm = () => {
    setSelectedJob(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="rounded-2xl bg-slate-800 border border-slate-700 p-6 text-white shadow-lg">
          <h1 className="text-3xl font-semibold">Job Opportunities</h1>
          <p className="text-slate-300 mt-2">Browse curated roles and coordinate via SPOCs.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr_1fr] gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search jobs or companies"
                className="w-full pl-10 pr-4 py-2 rounded-2xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={filterLocation}
                onChange={(e) => setFilterLocation(e.target.value)}
                placeholder="Location"
                className="w-full pl-10 pr-4 py-2 rounded-2xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2 flex-col sm:flex-row items-stretch">
              <select
                value={filterSalary}
                onChange={(e) => setFilterSalary(e.target.value)}
                className="flex-1 rounded-2xl border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Salaries</option>
                <option value="high">High (₹1,50,000+)</option>
                <option value="medium">Medium (₹80,000 - ₹1,49,999)</option>
                <option value="entry">Entry (&lt; ₹80,000)</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="flex-1 rounded-2xl border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="postedDate">Sort by Posted Date</option>
                <option value="salary">Sort by Salary</option>
                <option value="title">Sort by Title</option>
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {loading ? (
            <div className="lg:col-span-2 text-center py-10 text-white space-y-3 bg-slate-800 rounded-3xl">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white mx-auto"></div>
              <p>Loading jobs...</p>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="lg:col-span-2 text-center py-10 text-white bg-slate-800 rounded-3xl">
              <p>No jobs matched your filters.</p>
            </div>
          ) : (
            filteredJobs.map((job) => {
              const applied = appliedJobs.has(job.id);
              return (
                <div
                  key={job.id}
                  className="bg-white rounded-3xl shadow-lg border border-gray-200 overflow-hidden flex flex-col"
                >
                  <div className="p-6 space-y-4 flex-1 flex flex-col">
                    <div>
                      <p className="text-sm uppercase tracking-wide text-slate-500">
                        {job.company}
                      </p>
                      <h3 className="text-2xl font-semibold text-gray-900">
                        {job.title}
                      </h3>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                      {job.description}
                    </p>
                    <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {formatLocation(job.location)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Posted {formatDate(job.postedDate)}
                      </span>
                      {job.application_deadline && (
                        <span className="flex items-center gap-1">
                          <Lock className="w-4 h-4" />
                          Deadline {formatDateTime(job.application_deadline)}
                        </span>
                      )}
                      {job.job_type && (
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-4 h-4" />
                          {job.job_type}
                        </span>
                      )}
                      {(job.spoc_name || job.spoc_email) && (
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          SPOC: {job.spoc_name || job.spoc_email}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs text-slate-500">Package</p>
                      <p className="text-base font-semibold text-slate-900">{job.salary}</p>
                      {applied && (
                        <span className="text-xs inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-800 mt-2">
                          Applied
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleViewDetailsClick(job)}
                      className="px-4 py-2 rounded-2xl bg-slate-900 text-white text-sm font-semibold flex items-center gap-2 hover:bg-black transition"
                    >
                      <span>View Details</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {selectedJob && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="bg-slate-900 text-white p-6 space-y-2">
              <p className="text-sm text-slate-300 uppercase tracking-wider">{selectedJob.company}</p>
              <h2 className="text-3xl font-semibold">{selectedJob.title}</h2>
              <p className="text-sm text-slate-300">
                {formatLocation(selectedJob.location)}
                {selectedJob.job_type && ` • ${selectedJob.job_type}`}
                {(selectedJob.spoc_name || selectedJob.spoc_email) && ` • SPOC: ${selectedJob.spoc_name || selectedJob.spoc_email}`}
              </p>
            </div>
            <div className="p-6 space-y-6">
              {selectedJob.description && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Description</h3>
                  <p className="text-sm text-gray-600 mt-2 leading-relaxed">{selectedJob.description}</p>
                </div>
              )}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-gray-200 p-4">
                  <p className="text-xs text-gray-500">Package</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedJob.salary}</p>
                </div>
                {selectedJob.application_deadline && (
                  <div className="rounded-2xl border border-gray-200 p-4">
                    <p className="text-xs text-gray-500">Deadline</p>
                    <p className="text-lg font-semibold text-gray-900">{formatDateTime(selectedJob.application_deadline)}</p>
                  </div>
                )}
              </div>
              <div className="text-right">
                <button
                  onClick={handleCloseForm}
                  className="px-6 py-3 rounded-2xl bg-slate-900 text-white font-semibold hover:bg-black transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobOpportunities;