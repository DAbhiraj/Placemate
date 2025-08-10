import React from "react"

const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  gradient,
  iconColor = "text-white opacity-80"
}) => {
  return (
    <div className={`${gradient} rounded-xl p-6 text-white`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/80 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
          {subtitle && <p className="text-white/80 text-xs mt-1">{subtitle}</p>}
        </div>
        <Icon className={`h-8 w-8 ${iconColor}`} />
      </div>
    </div>
  )
}

export default StatCard;