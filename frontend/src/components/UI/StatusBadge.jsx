import React from "react"
import { CheckCircle, Clock, XCircle, Star, Users } from "lucide-react"
import { getStatusColor } from "../../utils/helpers"

const StatusBadge = ({ status, showIcon = true }) => {
  const safeStatus = (status || "applied").toString()
  const getStatusIcon = status => {
    switch (status) {
      case "applied":
        return <Clock className="w-4 h-4" />
      case "shortlisted":
        return <Star className="w-4 h-4" />
      case "interviewed":
        return <Users className="w-4 h-4" />
      case "selected":
        return <CheckCircle className="w-4 h-4" />
      case "rejected":
        return <XCircle className="w-4 h-4" />
      case "approved":
        return <CheckCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
        safeStatus
      )}`}
    >
      {showIcon && getStatusIcon(safeStatus)}
      <span className={showIcon ? "ml-1" : ""}>
        {safeStatus.charAt(0).toUpperCase() + safeStatus.slice(1)}
      </span>
    </span>
  )
}

export default StatusBadge;