export const getStatusColor = status => {
  switch (status) {
    case "applied":
      return "bg-blue-100 text-blue-800"
    case "shortlisted":
      return "bg-yellow-100 text-yellow-800"
    case "interviewed":
      return "bg-purple-100 text-purple-800"
    case "selected":
      return "bg-green-100 text-green-800"
    case "rejected":
      return "bg-red-100 text-red-800"
    case "pending":
      return "bg-orange-100 text-orange-800"
    case "approved":
      return "bg-green-100 text-green-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export const formatDate = dateString => {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric"
  })
}

export const calculateDaysUntilDeadline = deadline => {
  const today = new Date()
  const deadlineDate = new Date(deadline)
  const diffTime = deadlineDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

export const getNotificationTypeColor = type => {
  switch (type) {
    case "deadline":
      return "border-red-200 bg-red-50"
    case "interview":
      return "border-purple-200 bg-purple-50"
    case "result":
      return "border-green-200 bg-green-50"
    case "general":
      return "border-blue-200 bg-blue-50"
    default:
      return "border-gray-200 bg-gray-50"
  }
}
