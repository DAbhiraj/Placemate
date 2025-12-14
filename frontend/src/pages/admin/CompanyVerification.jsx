import { useEffect, useState } from "react"
import {
  Search,
  Building2,
  Briefcase,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react"
import axiosClient from "../../api/axiosClient"
import CompanyCard from "./CompanyCard"
import JobCard from "./JobCard"
import CompanyDetailsModal from "./CompanyDetailsModal"
import JobDetailsModal from "./JobDetailsModal"

export default function CompanyVerification() {
  const [activeTab, setActiveTab] = useState("pendingKyc")
  const [searchTerm, setSearchTerm] = useState("")
  const [verifiedcompanies, setVerifiedcompanies] = useState([])
  const [rejectedcompanies, setRejectedcompanies] = useState([])
  const [pendingKycs, setPendingKycs] = useState([])
  const [allJobs, setAllJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCompany, setSelectedCompany] = useState(null)
  const [selectedJob, setSelectedJob] = useState(null)
  const [companyJobs, setCompanyJobs] = useState([])
  const [rejectionReason, setRejectionReason] = useState("")

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [verifiedRes, pendingRes,rejectedRes, jobsRes] = await Promise.all([
        axiosClient.get("/admin/recruiter-kyc/verified"),
        axiosClient.get("/admin/recruiter-kyc/pending"),
        axiosClient.get("/admin/recruiter-kyc/rejected"),
        axiosClient.get("/jobs").catch(() => ({ data: { data: [] } }))
      ])

      setVerifiedcompanies(verifiedRes.data.data || verifiedRes.data || [])
      setRejectedcompanies(rejectedRes.data.data || rejectedRes.data || [])
      setPendingKycs(pendingRes.data.data || pendingRes.data || [])
      setAllJobs(jobsRes.data.data || jobsRes.data || [])
    } catch (error) {
      console.error("Failed to fetch data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleApproveKyc = async (kycId, recruiterId) => {
    try {
      await axiosClient.put(`/admin/recruiter-kyc/${kycId}/approve`, {
        recruiterId
      })
      setPendingKycs(prev => prev.filter(k => k.kyc_id !== kycId))
      setSelectedCompany(null)
      fetchData()
    } catch (error) {
      console.error("Failed to approve KYC:", error)
      alert("Failed to approve KYC")
    }
  }

  const handleRejectKyc = async kycId => {
    try {
      await axiosClient.put(`/admin/recruiter-kyc/${kycId}/reject`, {
        rejectionReason
      })
      setPendingKycs(prev => prev.filter(k => k.kyc_id !== kycId))
      setSelectedCompany(null)
      setRejectionReason("")
      fetchData()
    } catch (error) {
      console.error("Failed to reject KYC:", error)
      alert("Failed to reject KYC")
    }
  }

  const openCompanyDetails = async company => {
    setSelectedCompany(company)
    try {
      const companyName = company.company_name || company.name
      if (companyName) {
        const jobsRes = await axiosClient.get(
          `/recruiter/jobs/${encodeURIComponent(companyName)}`
        )
        setCompanyJobs(jobsRes.data.data || jobsRes.data || [])
      }
    } catch (error) {
      console.error("Failed to fetch company jobs:", error)
      setCompanyJobs([])
    }
  }

  const openJobDetails = async job => {
    setSelectedJob(job)
  }

  const getFilteredData = () => {
    const term = searchTerm.toLowerCase()

    switch (activeTab) {
      case "pendingKyc":
        return pendingKycs.filter(
          c =>
            (c.company_name || c.name || "").toLowerCase().includes(term) ||
            (c.email || "").toLowerCase().includes(term) ||
            (c.pan_number || c.panNumber || "").toLowerCase().includes(term)
        )
      case "verified":
        return verifiedcompanies
      case "rejected":
        return rejectedcompanies
      case "allJobs":
        return allJobs.filter(
          j =>
            (j.role || "").toLowerCase().includes(term) ||
            (j.company_name || "").toLowerCase().includes(term) ||
            (j.location || "").toLowerCase().includes(term) ||
            (j.job_status || "").toLowerCase().includes(term)
        )
      default:
        return []
    }
  }

  const filteredData = getFilteredData()

  const stats = [
    {
      label: "Pending KYC",
      value: pendingKycs.length,
      icon: Clock,
      color: "bg-orange-500",
      tab: "pendingKyc"
    },
    {
      label: "Verified Companies",
      value: verifiedcompanies.length,
      icon: CheckCircle,
      color: "bg-green-500",
      tab: "verified"
    },
    {
      label: "Rejected",
      value: rejectedcompanies.length,
      icon: XCircle,
      color: "bg-red-500",
      tab: "rejected"
    },
    {
      label: "Total Jobs",
      value: allJobs.length,
      icon: Briefcase,
      color: "bg-blue-500",
      tab: "allJobs"
    }
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-slate-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-600 mt-1">
            Manage companies, recruiters, and job postings
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(stat => (
            <button
              key={stat.label}
              onClick={() => setActiveTab(stat.tab)}
              className={`bg-white rounded-lg p-6 border-2 transition-all hover:shadow-lg ${
                activeTab === stat.tab
                  ? "border-blue-500 shadow-md"
                  : "border-slate-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <p className="text-sm font-medium text-slate-600">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">
                    {stat.value}
                  </p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder={`Search ${
                    activeTab === "allJobs" ? "jobs" : "companies"
                  }...`}
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="text-sm text-slate-600">
                {filteredData.length}{" "}
                {activeTab === "allJobs" ? "jobs" : "companies"} found
              </div>
            </div>
          </div>

          <div className="p-6">
            {activeTab === "allJobs" ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredData.map(job => (
                  <JobCard
                    key={job.job_id || job.id}
                    job={job}
                    onClick={() => openJobDetails(job)}
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredData.map(company => (
                  <CompanyCard
                    key={company.kyc_id || company.id || company.company_name}
                    company={company}
                    isPending={activeTab === "pendingKyc"}
                    onClick={() => openCompanyDetails(company)}
                  />
                ))}
              </div>
            )}

            {filteredData.length === 0 && (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
                  {activeTab === "allJobs" ? (
                    <Briefcase className="h-8 w-8 text-slate-400" />
                  ) : (
                    <Building2 className="h-8 w-8 text-slate-400" />
                  )}
                </div>
                <p className="text-slate-500">
                  No {activeTab === "allJobs" ? "jobs" : "companies"} found
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedCompany && (
        <CompanyDetailsModal
          company={selectedCompany}
          companyJobs={companyJobs}
          isPending={activeTab === "pendingKyc"}
          rejectionReason={rejectionReason}
          onRejectionReasonChange={setRejectionReason}
          onApprove={handleApproveKyc}
          onReject={handleRejectKyc}
          onClose={() => {
            setSelectedCompany(null)
            setCompanyJobs([])
            setRejectionReason("")
          }}
        />
      )}

      {selectedJob && (
        <JobDetailsModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
        />
      )}
    </div>
  )
}
