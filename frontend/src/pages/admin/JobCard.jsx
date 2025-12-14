import { Briefcase, MapPin, Building2, Users, Eye } from "lucide-react"

export default function JobCard({ job, onClick }) {

  const getStatusColor = (status) => {
  const statusColors = {
    "in initial stage": "bg-gray-100 text-gray-700",
    "in review": "bg-blue-100 text-blue-700",
    "in negotiation": "bg-orange-100 text-orange-700",
    "applications opened": "bg-green-100 text-green-700",
    "ot conducted": "bg-purple-100 text-purple-700",
    interview: "bg-red-100 text-red-700",
    "completed the drive": "bg-emerald-100 text-emerald-700",
  };
  return statusColors[status] || "bg-gray-100 text-gray-700";
};

  //console.log(job)

  return (
    <div className="bg-white border border-slate-200 rounded-lg hover:shadow-lg transition-all hover:border-blue-300">
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Briefcase className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-slate-900 mb-1">
                {job.role || job.title}
              </h3>
              <div className="flex items-center gap-4 text-sm text-slate-600">
                {job.company_name && (
                  <div className="flex items-center gap-1">
                    <Building2 className="h-4 w-4" />
                    <span>{job.company_name}</span>
                  </div>
                )}
                {(() => {
                  const locations = Array.isArray(job.location)
                    ? job.location
                    : Array.isArray(job.locations)
                      ? job.locations
                      : job.location
                        ? [job.location]
                        : []
                  return locations.length > 0 ? (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span className="truncate">{locations.join(", ")}</span>
                    </div>
                  ) : null
                })()}
              </div>
            </div>
          </div>
          <span
            className={`px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getStatusColor(
              job.job_status || job.status || ""
            )}`}
          >
            {job.job_status || job.status || "N/A"}
          </span>
        </div>

        <div className="space-y-2 text-sm">
          {job.salary_range && (
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Salary:</span>
              <span className="font-medium text-slate-900">
                {job.salary_range}
              </span>
            </div>
          )}
          {job.job_type && (
            <div className="flex items-center justify-between">
              <span className="font-medium text-slate-900">Type: {job.job_type}</span>
            </div>
          )}
          {job.recruiter_name && (
            <div className="flex items-center justify-between">
              <span className="font-medium text-slate-900">
               Recruiter: {job.recruiter_name}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between pt-2 border-t border-slate-200">
            <div className="flex items-center gap-2 text-slate-600">
              <Users className="h-4 w-4" />
              <span>{job.candidates_count || 0} Applications</span>
            </div>
            {job.created_at && (
              <span className="text-xs text-slate-500">
              Created on: {new Date(job.created_at).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={onClick}
          className="w-full mt-4 flex items-center justify-center gap-2 bg-blue-50 text-blue-700 rounded-lg py-2 hover:bg-blue-100 transition-colors font-medium"
        >
          <Eye className="h-4 w-4" />
          View Full Details
        </button>
      </div>
    </div>
  )
}
