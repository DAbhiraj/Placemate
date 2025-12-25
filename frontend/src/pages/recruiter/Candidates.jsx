import {
  Users,
  Download,
  Filter,
  Search,
  Mail,
  Phone,
  GraduationCap,
  Star,
  CheckCircle,
  XCircle,
  ArrowLeft
} from "lucide-react"
import { useState, useEffect } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import axiosClient from "../../api/axiosClient";

export default function Candidates() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const jobId = searchParams.get('jobId');
  const jobTitle = searchParams.get('jobTitle');
  const [activeTab, setActiveTab] = useState("applied")
  const [appliedCandidates, setAppliedCandidates] = useState([])
  const [shortlistedCandidates, setShortlistedCandidates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const company_name = localStorage.getItem("company") || localStorage.getItem("company_name") || "Google"

  useEffect(() => {
    fetchCandidates();
  }, [jobId]);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      let allCandidates = [];
      
      if (jobId) {
        // Fetch applications for specific job
        const applicationsResponse = await axiosClient.get(`/jobs/${jobId}/applications`);
        const applications = applicationsResponse.data;
        
        if (Array.isArray(applications)) {
          allCandidates = applications;
        }
      } else {
        // Fetch all jobs first to get job IDs
        const response = await axiosClient.get(`/recruiter/jobs/${company_name}`);
        const jobs = response.data;

        // Fetch applications for each job
        for (const job of (Array.isArray(jobs) ? jobs : jobs.jobs || [])) {
          const applicationsResponse = await axiosClient.get(`/jobs/${job.job_id}/applications`);
          const applications = applicationsResponse.data;
          
          if (Array.isArray(applications)) {
            allCandidates = [...allCandidates, ...applications];
          }
        }
      }
      
      // Separate into applied and shortlisted
      const applied = allCandidates.filter(c => c.status !== 'Shortlisted' && c.status !== 'Rejected');
      const shortlisted = allCandidates.filter(c => c.status === 'Shortlisted');
      
      setAppliedCandidates(applied);
      setShortlistedCandidates(shortlisted);
      setError('');
    } catch (err) {
      console.error('Error fetching candidates:', err);
      setError('Error loading candidates');
      setAppliedCandidates([]);
      setShortlistedCandidates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleShortlist = async (candidateId) => {
    try {
      const candidate = appliedCandidates.find(c => c.id === candidateId);
      const updatedCandidate = {
        ...candidate,
        status: 'Shortlisted'
      };
      
      // Move to shortlisted
      setAppliedCandidates(appliedCandidates.filter(c => c.id !== candidateId));
      setShortlistedCandidates([...shortlistedCandidates, updatedCandidate]);
      
      alert('Candidate shortlisted successfully');
    } catch (err) {
      alert('Error shortlisting candidate');
    }
  };

  const handleReject = async (candidateId) => {
    try {
      setAppliedCandidates(appliedCandidates.filter(c => c.id !== candidateId));
      alert('Candidate rejected');
    } catch (err) {
      alert('Error rejecting candidate');
    }
  };

  const downloadReport = async (companyName) => {
    try {
      console.log(companyName);
      const response = await axiosClient.get(
        `/exports?companyName=${encodeURIComponent(companyName)}`,
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${companyName}_applications.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Failed to download report:", error);
    }
  };

  const filteredApplied = appliedCandidates.filter(candidate =>
    candidate.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredShortlisted = shortlistedCandidates.filter(candidate =>
    candidate.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {jobId && (
              <button
                onClick={() => navigate('/recruiter/viewjobs')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Back to Jobs"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
            )}
            <div className="bg-blue-100 p-2 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {jobId ? `Candidates for ${decodeURIComponent(jobTitle || 'Job')}` : 'Candidate Management'}
              </h2>
              <p className="text-sm text-gray-500">
                {appliedCandidates.length} Applied • {shortlistedCandidates.length} Shortlisted
              </p>
            </div>
          </div>

          {!jobId && (
            <div className="mt-4 flex items-center space-x-2">
              <button
                onClick={() => downloadReport(company_name)}
                className="bg-green-500 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-sm hover:bg-green-600 hover:shadow-md transition-all duration-200 ease-in-out flex items-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4"
                  />
                </svg>
                Export data
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("applied")}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                activeTab === "applied"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Applied Candidates ({filteredApplied.length})
            </button>
            <button
              onClick={() => setActiveTab("shortlisted")}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                activeTab === "shortlisted"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Shortlisted Candidates ({filteredShortlisted.length})
            </button>
          </div>

          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search candidates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none w-64"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-8">
            <p className="text-gray-500">Loading candidates...</p>
          </div>
        ) : activeTab === "applied" ? (
          filteredApplied.length === 0 ? (
            <div className="flex justify-center py-8">
              <p className="text-gray-500">No applied candidates</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredApplied.map(candidate => (
                <div
                  key={candidate.id}
                  className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex gap-4">
                      <div className="bg-blue-600 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-semibold text-lg">
                          {candidate.student_name?.charAt(0) || 'C'}
                        </span>
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {candidate.student_name || 'N/A'}
                          </h3>
                          <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                            {candidate.status || "Under Review"}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-x-6 gap-y-2 mb-3">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="w-4 h-4" />
                            {candidate.email || 'N/A'}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="w-4 h-4" />
                            {candidate.phone || 'N/A'}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <GraduationCap className="w-4 h-4" />
                            {candidate.branch || 'N/A'}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Star className="w-4 h-4" />
                            CGPA: {candidate.cgpa || 'N/A'}
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Applied on:</span>
                            <span className="text-gray-900 ml-2">
                              {candidate.created_at ? new Date(candidate.created_at).toLocaleDateString() : 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <button 
                        onClick={() => handleShortlist(candidate.user_id)}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Shortlist
                      </button>
                      <button 
                        onClick={() => handleReject(candidate.user_id)}
                        className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                      <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                        View Resume
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : filteredShortlisted.length === 0 ? (
          <div className="flex justify-center py-8">
            <p className="text-gray-500">No shortlisted candidates</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredShortlisted.map(candidate => (
              <div
                key={candidate.id}
                className="border border-green-200 bg-green-50 rounded-lg p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex gap-4">
                    <div className="bg-green-600 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-semibold text-lg">
                        {candidate.name?.charAt(0) || 'C'}
                      </span>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {candidate.name || 'N/A'}
                        </h3>
                        <span className="px-3 py-1 bg-green-600 text-white rounded-full text-xs font-medium flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Shortlisted
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-x-6 gap-y-2 mb-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="w-4 h-4" />
                          {candidate.email || 'N/A'}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="w-4 h-4" />
                          {candidate.phone || 'N/A'}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <GraduationCap className="w-4 h-4" />
                          {candidate.branch || 'N/A'}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Star className="w-4 h-4" />
                          CGPA: {candidate.cgpa || 'N/A'}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Position:</span>
                          <span className="font-medium text-gray-900 ml-2">
                            {candidate.jobTitle || 'N/A'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Shortlisted on:</span>
                          <span className="text-gray-900 ml-2">
                            {candidate.shortlistedDate ? new Date(candidate.shortlistedDate).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                      Schedule Interview
                    </button>
                    <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-white transition-colors text-sm font-medium">
                      View Resume
                    </button>
                    <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-white transition-colors text-sm font-medium">
                      Send Email
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
