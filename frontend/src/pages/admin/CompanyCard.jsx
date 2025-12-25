import { Building2, Eye } from "lucide-react"

export default function CompanyCard({ company, isPending, onClick }) {
  const status =
    company.approval_status ||
    company.status ||
    (isPending ? "pending" : "active")
  const companyName = company.company_name || company.name

  const getStatusColor = status => {
    switch (status.toLowerCase()) {
      case "in_review":
      case "approved":
        return "bg-green-100 text-green-700"
      case "rejected":
        return "bg-red-100 text-red-700"
      case "pending":
        return "bg-orange-100 text-orange-700"
      default:
        return "bg-slate-100 text-slate-700"
    }
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg hover:shadow-lg transition-all hover:border-blue-300">
      <div className="p-4 border-b border-slate-100">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3 flex-1">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Building2 className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-slate-900 truncate">
                {companyName}
              </h3>
              {company.recruiter_name && (
                <p className="text-sm text-slate-600 mt-1">
                  Recruiter: {company.recruiter_name}
                </p>
              )}
            </div>
          </div>
          <span
            className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(
              status
            )}`}
          >
            {status}
          </span>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div className="space-y-2 text-sm">
          {company.email && (
            <div>
              <span className="text-slate-600">Email:</span>
              <span className="ml-2 text-slate-900">{company.email}</span>
            </div>
          )}
          <div>
            <span className="text-slate-600">PAN:</span>
            <span className="ml-2 font-mono text-slate-900">
              {company.pan_number || company.panNumber || "-"}
            </span>
          </div>
          {(company.company_address || company.address) && (
            <div>
              <span className="text-slate-600">Location:</span>
              <span className="ml-2 text-slate-900 line-clamp-2">
                {company.company_address || company.address}
              </span>
            </div>
          )}
          {company.submission_date && (
            <div>
              <span className="text-slate-600">Submitted:</span>
              <span className="ml-2 text-slate-900">
                {new Date(company.submission_date).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>

        <button
          onClick={onClick}
          className="w-full mt-4 flex items-center justify-center gap-2 bg-blue-50 text-blue-700 rounded-lg py-2 hover:bg-blue-100 transition-colors font-medium"
        >
          <Eye className="h-4 w-4" />
          View Details
        </button>
      </div>
    </div>
  )
}
