import React, { useState } from "react"
import {
  Search,
  Filter,
  MapPin,
  Calendar,
  Users,
  ExternalLink
} from "lucide-react"
import { useApp } from "../context/AppContext"
import { calculateDaysUntilDeadline } from "../utils/helpers"

const Companies = () => {
  const { companies, currentUser, addApplication } = useApp()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterBranch, setFilterBranch] = useState("")
  const [filterPackage, setFilterPackage] = useState("")
  const [sortBy, setSortBy] = useState("deadline")

  const filteredCompanies = companies
    .filter(company => {
      const matchesSearch =
        company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.location.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesBranch =
        !filterBranch || company.eligibleBranches.includes(filterBranch)
      const matchesPackage =
        !filterPackage ||
        (filterPackage === "high" &&
          parseInt(company.package.split("-")[0].replace(/[^\d]/g, "")) >=
            40) ||
        (filterPackage === "medium" &&
          parseInt(company.package.split("-")[0].replace(/[^\d]/g, "")) >= 20 &&
          parseInt(company.package.split("-")[0].replace(/[^\d]/g, "")) < 40) ||
        (filterPackage === "entry" &&
          parseInt(company.package.split("-")[0].replace(/[^\d]/g, "")) < 20)

      return matchesSearch && matchesBranch && matchesPackage
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "deadline":
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
        case "package":
          return (
            parseInt(b.package.split("-")[0].replace(/[^\d]/g, "")) -
            parseInt(a.package.split("-")[0].replace(/[^\d]/g, ""))
          )
        case "name":
          return a.name.localeCompare(b.name)
        default:
          return 0
      }
    })

  const handleApply = companyId => {
    if (!currentUser) return

    const newApplication = {
      id: Date.now().toString(),
      studentId: currentUser.id,
      companyId,
      status: "applied",
      appliedDate: new Date().toISOString().split("T")[0],
      lastUpdate: new Date().toISOString().split("T")[0]
    }

    addApplication(newApplication)
    alert("Application submitted successfully!")
  }

  const isEligible = company => {
    if (!currentUser) return false
    return (
      company.eligibleBranches.includes(currentUser.branch) &&
      currentUser.cgpa >= company.minCGPA
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Company Opportunities
        </h1>
        <p className="text-gray-600">
          Discover and apply to top companies recruiting from NIT Warangal
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search companies or locations..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={filterBranch}
            onChange={e => setFilterBranch(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Branches</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Electronics">Electronics</option>
            <option value="Mechanical">Mechanical</option>
            <option value="Information Technology">
              Information Technology
            </option>
          </select>

          <select
            value={filterPackage}
            onChange={e => setFilterPackage(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Packages</option>
            <option value="high">High (40+ LPA)</option>
            <option value="medium">Medium (20-40 LPA)</option>
            <option value="entry">Entry (Below 20 LPA)</option>
          </select>

          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="deadline">Sort by Deadline</option>
            <option value="package">Sort by Package</option>
            <option value="name">Sort by Name</option>
          </select>
        </div>
      </div>

      {/* Company Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredCompanies.length === 0 ? (
          <div className="lg:col-span-2 text-center py-12">
            <Filter className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No companies found
            </h3>
            <p className="text-gray-500">Try adjusting your search criteria</p>
          </div>
        ) : (
          filteredCompanies.map(company => {
            const daysLeft = calculateDaysUntilDeadline(company.deadline)
            const eligible = isEligible(company)

            return (
              <div
                key={company.id}
                className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-all duration-200"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="text-3xl">{company.logo}</div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">
                          {company.name}
                        </h3>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <MapPin className="w-4 h-4 mr-1" />
                          {company.location}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
                        {company.package}
                      </span>
                      {!eligible && (
                        <div className="mt-2">
                          <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                            Not Eligible
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {company.description}
                  </p>

                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-2">
                        Eligible Branches:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {company.eligibleBranches.map((branch, index) => (
                          <span
                            key={index}
                            className={`text-xs font-medium px-2 py-1 rounded ${
                              currentUser?.branch === branch
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {branch}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-4">
                        <span className="text-gray-500">
                          Min CGPA:{" "}
                          <span className="font-medium">{company.minCGPA}</span>
                        </span>
                        <span className="text-gray-500 flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {company.appliedCount} applied
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-red-500" />
                        <span
                          className={`text-sm font-medium ${
                            daysLeft <= 3
                              ? "text-red-600"
                              : daysLeft <= 7
                              ? "text-orange-600"
                              : "text-gray-600"
                          }`}
                        >
                          {daysLeft > 0
                            ? `${daysLeft} days left`
                            : "Deadline passed"}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center">
                          View Details <ExternalLink className="w-4 h-4 ml-1" />
                        </button>
                        <button
                          onClick={() => handleApply(company.id)}
                          disabled={!eligible || daysLeft < 0}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            eligible && daysLeft > 0
                              ? "bg-blue-600 hover:bg-blue-700 text-white"
                              : "bg-gray-300 text-gray-500 cursor-not-allowed"
                          }`}
                        >
                          {!eligible
                            ? "Not Eligible"
                            : daysLeft < 0
                            ? "Deadline Passed"
                            : "Apply Now"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default Companies;
