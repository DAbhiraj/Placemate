import { X, FileText, Check, Briefcase, Mail, Phone, Globe } from "lucide-react"

export default function CompanyDetailsModal({
  company,
  companyJobs,
  isPending,
  rejectionReason,
  onRejectionReasonChange,
  onApprove,
  onReject,
  onClose
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="max-w-4xl w-full bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Company Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="h-6 w-6 text-slate-600" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-slate-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Company Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-600 block mb-1">
                  Company Name
                </label>
                <p className="text-slate-900">
                  {company.company_name || company.name}
                </p>
              </div>
              {(company.company_website || company.website) && (
                <div>
                  <label className="text-sm font-medium text-slate-600 block mb-1 flex items-center gap-1">
                    <Globe className="h-4 w-4" />
                    Website
                  </label>
                  <a
                    href={company.company_website || company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {company.company_website || company.website}
                  </a>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-slate-600 block mb-1">
                  PAN Number
                </label>
                <p className="font-mono text-slate-900">
                  {company.pan_number || company.panNumber || "-"}
                </p>
              </div>
              {company.email && (
                <div>
                  <label className="text-sm font-medium text-slate-600 block mb-1 flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    Email
                  </label>
                  <p className="text-slate-900">{company.email}</p>
                </div>
              )}
              {(company.company_address || company.address) && (
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-slate-600 block mb-1">
                    Address
                  </label>
                  <p className="text-slate-900">
                    {company.company_address || company.address}
                  </p>
                </div>
              )}
              {company.submission_date && (
                <div>
                  <label className="text-sm font-medium text-slate-600 block mb-1">
                    Submission Date
                  </label>
                  <p className="text-slate-900">
                    {new Date(company.submission_date).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>

          {(company.recruiter_name || company.recruiter_email) && (
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Recruiter Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {company.recruiter_name && (
                  <div>
                    <label className="text-sm font-medium text-slate-600 block mb-1">
                      Name
                    </label>
                    <p className="text-slate-900">{company.recruiter_name}</p>
                  </div>
                )}
                {company.recruiter_email && (
                  <div>
                    <label className="text-sm font-medium text-slate-600 block mb-1 flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      Email
                    </label>
                    <p className="text-slate-900">{company.recruiter_email}</p>
                  </div>
                )}
                {company.recruiter_phone && (
                  <div>
                    <label className="text-sm font-medium text-slate-600 block mb-1 flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      Phone
                    </label>
                    <p className="text-slate-900">{company.recruiter_phone}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {company.pan_document_url && (
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                Documents
              </h3>
              <a
                href={company.pan_document_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-3 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <FileText className="h-5 w-5 text-slate-600" />
                <span className="font-medium">View PAN Document</span>
              </a>
            </div>
          )}

          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Jobs Posted ({companyJobs.length})
            </h3>
            {companyJobs.length === 0 ? (
              <div className="bg-slate-50 rounded-lg p-8 text-center">
                <p className="text-slate-500">No jobs found for this company</p>
              </div>
            ) : (
              <div className="space-y-3">
                {companyJobs.map(job => (
                  <div
                    key={job.job_id || job.id}
                    className="border border-slate-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-slate-900">
                          {job.role || job.title}
                        </h4>
                        <p className="text-sm text-slate-600 mt-1">
                          {job.location}
                        </p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                        {job.job_status || job.status || "N/A"}
                      </span>
                    </div>
                    {(job.recruiter_name || job.recruiter_email) && (
                      <div className="mt-3 pt-3 border-t border-slate-200">
                        <p className="text-xs text-slate-600 mb-1">
                          Posted by:
                        </p>
                        <p className="text-sm font-medium text-slate-900">
                          {job.recruiter_name}
                        </p>
                        {job.recruiter_email && (
                          <p className="text-xs text-slate-600">
                            {job.recruiter_email}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {isPending && company.kyc_id && company.recruiter_id && (
            <div className="bg-slate-50 rounded-lg p-6 space-y-4">
              <h3 className="text-lg font-semibold text-slate-900">
                KYC Action
              </h3>
              <div>
                <label className="text-sm font-medium text-slate-600 block mb-2">
                  Rejection Reason (optional)
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={e => onRejectionReasonChange(e.target.value)}
                  placeholder="Enter reason for rejection..."
                  rows={3}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() =>
                    onApprove(company.kyc_id, company.recruiter_id)
                  }
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-lg py-3 flex items-center justify-center gap-2 font-semibold transition-colors"
                >
                  <Check className="h-5 w-5" />
                  Approve Company
                </button>
                <button
                  onClick={() => onReject(company.kyc_id)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-lg py-3 flex items-center justify-center gap-2 font-semibold transition-colors"
                >
                  <X className="h-5 w-5" />
                  Reject Company
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
