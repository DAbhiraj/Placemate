import { Briefcase, MapPin, Calendar, Edit, Trash2, Plus, IndianRupee, Users } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CreateJob from './CreateJob';

const API_BASE_URL = 'http://localhost:4000/api';

export default function ViewJobs() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [showJobForm, setShowJobForm] = useState(false);
  const [editingJobId, setEditingJobId] = useState(null);
  const [editingJobData, setEditingJobData] = useState(null);
  const company = localStorage.getItem('company');

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/recruiter/jobs/${company}`);
      if (!response.ok) {
        throw new Error('Failed to fetch jobs');
      }
      const data = await response.json();
      const formattedJobs = (Array.isArray(data) ? data : data.jobs || []).map(job => ({
      id: job.job_id,
      title: job.role || "Not Specified",
      status: job.status || "Active",
      type: job.job_type || "Full Time",
      location: Array.isArray(job.location) ? job.location.join(", ") : (job.location || "Not Provided"),
      salary: job.package || "N/A",
      deadline: job.application_deadline || job.online_assessment_date,
      applications: job.applied_count || 0,
      postedDate: job.created_at,
      company: job.company_name,
      minCgpa: job.min_cgpa,
      eligibleBranches: job.eligible_branches || [],
      description: job.description || '',
      applicationDeadline: job.application_deadline,
      onlineAssessmentDate: job.online_assessment_date,
      interviewDates: job.interview_dates || [],
    }));
     setJobs(formattedJobs);
      setError('');
      console.log(data);
    } catch (err) {
      setError(err.message || 'Error loading jobs');
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/recruiter/jobs/${jobId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete job');
      }

      setJobs(jobs.filter(job => job.id !== jobId));
      alert('Job deleted successfully');
    } catch (err) {
      alert('Error deleting job: ' + err.message);
    }
  };

  const handleEdit = async (jobId) => {
    try {
      // Find the job in the current jobs array
      const job = jobs.find(j => j.id === jobId);
      
      if (!job) {
        alert('Job not found');
        return;
      }

      console.log(job);

      // Transform the job data to match form structure
      const jobData = {
        companyName: job.company || '',
        jobRole: job.title || '',
        department: Array.isArray(job.eligibleBranches) ? job.eligibleBranches : [],
        location: job.location ? job.location.split(', ').filter(l => l) : [],
        salary: job.salary || '',
        deadline: job.applicationDeadline ? new Date(job.applicationDeadline).toISOString().split('T')[0] : '',
        jobType: job.type || 'Full Time',
        description: job.description || '',
        skills: '',
        minimumCgpa: job.minCgpa || '',
        eligibleBranches: '',
        onlineAssessmentDate: job.onlineAssessmentDate ? new Date(job.onlineAssessmentDate).toISOString().split('T')[0] : '',
        interviewDates: Array.isArray(job.interviewDates) && job.interviewDates.length > 0 
          ? job.interviewDates.map(date => date ? new Date(date).toISOString().split('T')[0] : '')
          : ['']
      };

      setEditingJobId(jobId);
      setEditingJobData(jobData);
      setShowJobForm(true);
    } catch (err) {
      alert('Error loading job details: ' + err.message);
    }
  };

  const filteredJobs = jobs.filter(job => {
    const statusMatch = statusFilter === 'All Status' || job.status === statusFilter;
    const typeMatch = typeFilter === 'All Types' || job.type === typeFilter;
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
            <h2 className="text-xl font-semibold text-gray-900">Your Job Postings</h2>
            <p className="text-sm text-gray-500">{jobs.length} total jobs posted</p>
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
            <option>Active</option>
            <option>Closed</option>
            <option>Draft</option>
          </select>
          <select 
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option>All Types</option>
            <option>Full Time</option>
            <option>Internship</option>
            <option>Part Time</option>
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
                      className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                        job.status === 'Active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {job.status}
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
                    onClick={() => navigate(`/recruiter/candidates?jobId=${job.id}&jobTitle=${encodeURIComponent(job.title)}`)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700 transition-colors"
                    title="View Candidates"
                  >
                    <Users className="w-3.5 h-3.5" />
                    Candidates
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
                    <p className="text-gray-500">Salary</p>
                    <p className="text-gray-900 font-medium">{job.salary} LPA</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Calendar className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-gray-500">App. Deadline</p>
                    <p className="text-gray-900 font-medium">{job.deadline ? new Date(job.deadline).toLocaleDateString('en-IN') : 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Calendar className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-gray-500">Posted</p>
                    <p className="text-gray-900 font-medium">{new Date(job.postedDate).toLocaleDateString('en-IN')}</p>
                  </div>
                </div>
              </div>

              {/* Secondary Details: Min CGPA, Branches, Applications */}
              <div className="flex flex-wrap gap-3 text-xs">
                <div>
                  <span className="text-gray-500">Min CGPA: </span>
                  <span className="text-gray-900 font-medium">{job.minCgpa || 'N/A'}</span>
                </div>

                <div className="flex-1">
                  <span className="text-gray-500">Eligible Branches: </span>
                  <span className="text-gray-900 font-medium">
                    {Array.isArray(job.eligibleBranches) && job.eligibleBranches.length > 0
                      ? job.eligibleBranches.join(', ')
                      : 'All'}
                  </span>
                </div>

                <div>
                  <span className="text-gray-500">Applications: </span>
                  <span className="text-gray-900 font-medium">{job.applications || 0}</span>
                </div>
              </div>

              {/* Interview Dates - If Available */}
              {job.interviewDates && job.interviewDates.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Interview Dates:</p>
                  <div className="flex flex-wrap gap-1">
                    {(Array.isArray(job.interviewDates) ? job.interviewDates : [job.interviewDates]).filter(Boolean).map((date, idx) => (
                      <span key={idx} className="inline-block px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                        {typeof date === 'string' ? new Date(date).toLocaleDateString('en-IN') : date}
                      </span>
                    ))}
                  </div>
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
