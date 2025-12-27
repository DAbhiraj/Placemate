import { useEffect, useState } from "react"
import {
  Search,
  Eye,
  Plus,
  Trash2,
  UserPlus,
  Briefcase,
  X,
} from "lucide-react"
import axiosClient from "../../api/axiosClient"
import Loader from "../../components/UI/Loader"


export default function SpocManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSpoc, setSelectedSpoc] = useState(null)
  const [showAddSpoc, setShowAddSpoc] = useState(false)
  const [showAssignJob, setShowAssignJob] = useState(false)
  const [spocs, setSpocs] = useState([])
  const [allspocs, setAllSpocs] = useState([])
  const [availableJobs, setAvailableJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewFilter, setViewFilter] = useState("all") // all | unassigned
  const [newSpoc, setNewSpoc] = useState({
    name: "",
    email: "",
    department: "",
    phone: "",
  })
  const [assignSpocId, setAssignSpocId] = useState(null)
  const [assignJobId, setAssignJobId] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [assignedJobsForEdit, setAssignedJobsForEdit] = useState([])
  const [userSearchQuery, setUserSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [searchLoading, setSearchLoading] = useState(false)

  const resolveSpocId = (spocOrId) => {
    if (!spocOrId) return null
    if (typeof spocOrId === "string") return spocOrId
    return spocOrId.spoc_id || spocOrId.spocId || spocOrId.id || spocOrId.user_id || null
  }

  const fetchAssignedJobsForSpoc = async (spocId) => {
    if (!spocId) return []
    try {
      const response = await axiosClient.post("/admin/spocs/assigned-jobs", { spocId })
      return response.data.data || []
    } catch (error) {
      console.error("Failed to fetch assigned jobs:", error)
      return []
    }
  }

  const loadSpocData = async ({ showLoader = false } = {}) => {
    if (showLoader) {
      setLoading(true)
    }

    try {
      const spocresponse = await axiosClient.get("/admin/spocs")
      const allSpocs = spocresponse.data.data || spocresponse.data
      setAllSpocs(allSpocs)

      const spocsWithJobs = await Promise.all(
        allSpocs.map(async (spoc) => {
          const spocId = resolveSpocId(spoc)
          if (!spocId) {
            return {
              ...spoc,
              spoc_id: null,
              assignedJobs: [],
              activeJobs: 0,
              completedJobs: 0,
            }
          }

          const assignedJobs = await fetchAssignedJobsForSpoc(spocId)
          return {
            ...spoc,
            spoc_id: spocId,
            assignedJobs,
            activeJobs: assignedJobs.filter(job => job.job_status !== "completed the drive").length,
            completedJobs: assignedJobs.filter(job => job.job_status === "completed the drive").length,
          }
        })
      )
      setSpocs(spocsWithJobs)

      try {
        const jobsResponse = await axiosClient.get("/recruiter/jobs")
        const allJobs = jobsResponse.data.data || jobsResponse.data
        setAvailableJobs(allJobs)
      } catch {
        setAvailableJobs([])
      }
    } catch (error) {
      console.error("Failed to fetch SPOC data:", error)
      setSpocs([])
      setAllSpocs([])
      setAvailableJobs([])
    } finally {
      if (showLoader) {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    loadSpocData({ showLoader: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Track which SPOCs already have assignments
  const assignedSpocIds = spocs
    .map((s) => s.spoc_id || s.spocId || s.id)
    .filter(Boolean)

  const unassignedSpocs = allspocs.filter(
    spoc => !assignedSpocIds.includes(spoc.spoc_id || spoc.spocId || spoc.id)
  )

  const assignDropdownSpocs = (() => {
    const base = [...unassignedSpocs]
    if (assignSpocId) {
      const alreadyIncluded = base.some((spoc) => resolveSpocId(spoc) === assignSpocId)
      if (!alreadyIncluded) {
        const highlighted = allspocs.find((spoc) => resolveSpocId(spoc) === assignSpocId)
        if (highlighted) {
          return [highlighted, ...base]
        }
      }
    }
    return base
  })()

  // Merge spocs data with allspocs to ensure all SPOCs have activeJobs/completedJobs
  const spocsWithData = allspocs.map((spoc) => {
    const spocWithJobs = spocs.find(s => (s.spoc_id || s.id) === (spoc.id || spoc.user_id || spoc.spoc_id))
    return spocWithJobs || { ...spoc, spoc_id: spoc.id || spoc.user_id, activeJobs: 0, completedJobs: 0 }
  })

  const baseSpocList = viewFilter === "unassigned" ? unassignedSpocs : spocsWithData

  const filteredSpocs = baseSpocList.filter(
    (spoc) =>
      spoc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      spoc.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (spoc.branch && spoc.branch.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (spoc.department && spoc.department.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handleAddSpoc = async () => {
    try {
      if (!selectedUser) {
        alert("Please search and select a user")
        return
      }
      await axiosClient.post("/admin/spoc/add", { userId: selectedUser.user_id })
      alert(`Successfully added ${selectedUser.name} as SPOC`)
      await loadSpocData()
      setShowAddSpoc(false)
      setUserSearchQuery("")
      setSearchResults([])
      setSelectedUser(null)
    } catch (error) {
      console.error("Failed to add SPOC:", error)
      alert("Failed to add SPOC")
    }
  }

  const handleUserSearch = async (query) => {
    setUserSearchQuery(query)
    if (query.trim().length < 2) {
      setSearchResults([])
      return
    }
    try {
      setSearchLoading(true)
      const response = await axiosClient.get(`/admin/search-users?query=${encodeURIComponent(query)}`)
      setSearchResults(response.data.data || [])
    } catch (error) {
      console.error("Failed to search users:", error)
      setSearchResults([])
    } finally {
      setSearchLoading(false)
    }
  }

  const handleRemoveSpoc = async (id) => {
    const spocId = resolveSpocId(id)
    if (!spocId) return
    if (!window.confirm("Remove this SPOC and all assignments?")) {
      return
    }

    try {
      await axiosClient.delete(`/admin/spocs/${spocId}`)
      alert("SPOC removed")
      setSelectedSpoc(null)
      setAssignedJobsForEdit([])
      await loadSpocData()
    } catch (error) {
      console.error("Failed to remove SPOC:", error)
      alert("Failed to remove SPOC. Please try again.")
    }
  }

  const handleRemoveAssignment = async (job) => {
    if (!assignSpocId) return
    const jobId = job.job_id || job.id
    if (!jobId) return
    if (!window.confirm("Remove this assignment?")) {
      return
    }

    try {
      await axiosClient.delete(`/admin/spocs/${assignSpocId}/jobs/${jobId}`)
      alert("Assignment removed")
      const updatedJobs = await fetchAssignedJobsForSpoc(assignSpocId)
      setAssignedJobsForEdit(updatedJobs)
      if (selectedSpoc && resolveSpocId(selectedSpoc) === assignSpocId) {
        setSelectedSpoc((prev) => prev ? { ...prev, assignedJobs: updatedJobs } : prev)
      }
      await loadSpocData()
    } catch (error) {
      console.error("Failed to remove assignment:", error)
      alert("Failed to remove assignment. Please try again.")
    }
  }

  const handleAssignJob = async () => {
    
    if (!assignSpocId || !assignJobId) {
      return
    }

    try {
      // Find SPOC and Job details for success message
      await axiosClient.post("/spoc/assign-job", {
        spocId: assignSpocId,
        jobId: assignJobId
      })
      
      alert(`✓ Job assigned successfully`)
      await loadSpocData()
      setShowAssignJob(false)
      setAssignSpocId(null)
      setAssignJobId(null)
      setEditMode(false)
      setAssignedJobsForEdit([])
    } catch (error) {
      console.error("Failed to assign job:", error)
      alert("Failed to assign job. Please try again.")
    }
  }

  if (loading) {
    return <Loader fullScreen={true} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">SPOC Management</h1>
          <p className="text-slate-600 mt-1">Manage SPOCs and job assignments</p>
        </div>
        <button
          onClick={() => setShowAddSpoc(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Add SPOC
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total SPOCs</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{allspocs.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <UserPlus className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Active Jobs</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">
                {spocs.reduce((s, a) => s + (a.activeJobs || 0), 0)}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Briefcase className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Unassigned Jobs</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">
                {availableJobs.filter(job => job.spocs.length === 0).length}
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Briefcase className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search + Assign */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search SPOCs by name, email, branch..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setViewFilter("all")}
            className={`px-4 py-2 rounded-lg border ${viewFilter === "all" ? "bg-blue-600 text-white border-blue-600" : "border-slate-200 text-slate-700"}`}
          >
            All ({allspocs.length})
          </button>
          <button
            type="button"
            onClick={() => setViewFilter("unassigned")}
            className={`px-4 py-2 rounded-lg border ${viewFilter === "unassigned" ? "bg-blue-600 text-white border-blue-600" : "border-slate-200 text-slate-700"}`}
          >
            Unassigned ({unassignedSpocs.length})
          </button>
        </div>

        <button
          type="button"
          onClick={() => setShowAssignJob(true)}
          className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 flex items-center gap-2 font-medium"
        >
          <Briefcase className="h-4 w-4" /> Assign Job to SPOC
        </button>
      </div>

      {/* SPOC Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSpocs.map((spoc) => (
          <div
            key={spoc.id}
            className="bg-white border border-slate-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            <div className="mb-3">
              <p className="text-lg font-semibold text-slate-900">{spoc.name}</p>
              <p className="text-sm text-slate-600">{spoc.branch}</p>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-sm text-slate-600">{spoc.email}</p>
                <p className="text-sm text-slate-600">{spoc.phone}</p>
              </div>

              <div className="flex gap-2 pt-3 border-t">
                <div className="flex-1 text-center p-2 bg-blue-50 rounded">
                  <p className="text-lg font-bold text-blue-600">{spoc.activeJobs}</p>
                  <p className="text-xs text-slate-600">Active</p>
                </div>
                <div className="flex-1 text-center p-2 bg-green-50 rounded">
                  <p className="text-lg font-bold text-green-600">
                    {spoc.completedJobs || 0}
                  </p>
                  <p className="text-xs text-slate-600">Completed</p>
                </div>
              </div>

              <button
                type="button"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-sm flex items-center justify-center gap-2"
                onClick={async () => {
                  try {
                    const response = await axiosClient.post("/admin/spocs/assigned-jobs", {
                      spocId: spoc.spoc_id || spoc.id
                    })
                    const assignedJobs = response.data.data || []
                    setSelectedSpoc({
                      ...spoc,
                      assignedJobs: assignedJobs
                    })
                  } catch (error) {
                    console.error("Failed to fetch assigned jobs:", error)
                    setSelectedSpoc(spoc)
                  }
                }}
              >
                <Eye className="h-4 w-4" /> View Details
              </button>
              <button
                type="button"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-sm flex items-center justify-center gap-2"
                onClick={async () => {
                  setAssignSpocId(spoc.spoc_id || spoc.spocId || spoc.id)
                  setEditMode(true)
                  try {
                    const response = await axiosClient.post("/admin/spocs/assigned-jobs", {
                      spocId: spoc.spoc_id || spoc.id
                    })
                    setAssignedJobsForEdit(response.data.data || [])
                  } catch (error) {
                    console.error("Failed to fetch assigned jobs:", error)
                    setAssignedJobsForEdit([])
                  }
                  setShowAssignJob(true)
                }}
              >
                <Briefcase className="h-4 w-4" /> Edit Assignment
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredSpocs.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-lg p-12 text-center">
          <p className="text-slate-500">No SPOCs found</p>
        </div>
      )}

      {/* SPOC Details Modal */}
      {selectedSpoc && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50 rounded-lg">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">SPOC Details</h3>
              <button
                type="button"
                onClick={() => setSelectedSpoc(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-slate-600">Name</span>
                  <p className="mt-1 text-slate-900">{selectedSpoc.name}</p>
                </div>
                <div>
                  <span className="text-sm text-slate-600">Department</span>
                  <p className="mt-1 text-slate-900">{selectedSpoc.branch}</p>
                </div>
                <div>
                  <span className="text-sm text-slate-600">Email</span>
                  <p className="mt-1 text-slate-900">{selectedSpoc.email}</p>
                </div>
                <div>
                  <span className="text-sm text-slate-600">Phone</span>
                  <p className="mt-1 text-slate-900">{selectedSpoc.phone}</p>
                </div>
              </div>

              <div>
                <span className="text-sm text-slate-600">Assigned Jobs</span>
                {selectedSpoc.assignedJobs && selectedSpoc.assignedJobs.length > 0 ? (
                  <div className="space-y-2 mt-2">
                    {selectedSpoc.assignedJobs.map((job) => (
                      <div key={job.id} className="p-3 bg-slate-50 border rounded-lg">
                        <p className="font-medium text-slate-900">{job.title || job.position}</p>
                        <p className="text-sm text-slate-600">{job.company}</p>
                        {job.job_status && (
                          <p className="text-xs text-slate-500 mt-1">Status: {job.job_status}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-sm mt-2">No jobs assigned</p>
                )}
              </div>

              <button
                type="button"
                onClick={() => handleRemoveSpoc(selectedSpoc)}
                className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium flex items-center justify-center gap-2"
              >
                <Trash2 className="h-4 w-4" /> Remove SPOC
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add SPOC Modal */}
      {showAddSpoc && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50 rounded-lg">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Add New SPOC</h3>
              <button
                type="button"
                onClick={() => {
                  setShowAddSpoc(false)
                  setUserSearchQuery("")
                  setSearchResults([])
                  setSelectedUser(null)
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Search by Roll Number or Email
                </label>
                <input
                  type="text"
                  placeholder="Enter roll number or email"
                  value={userSearchQuery}
                  onChange={(e) => handleUserSearch(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {searchLoading && (
                <div className="text-center py-4">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <p className="text-sm text-slate-600 mt-2">Searching...</p>
                </div>
              )}

              {!searchLoading && searchResults.length > 0 && (
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {searchResults.map((user) => (
                    <button
                      key={user.user_id}
                      type="button"
                      onClick={() => {
                        setSelectedUser(user)
                        setSearchResults([])
                        setUserSearchQuery(`${user.name} (${user.roll_no || user.email})`)
                      }}
                      className="w-full text-left p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <p className="font-medium text-slate-900">{user.name}</p>
                      <p className="text-sm text-slate-600">{user.email}</p>
                      {user.roll_no && <p className="text-sm text-slate-500">Roll: {user.roll_no}</p>}
                      {user.branch && <p className="text-sm text-slate-500">Branch: {user.branch}</p>}
                    </button>
                  ))}
                </div>
              )}

              {!searchLoading && userSearchQuery.length >= 2 && searchResults.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-4">No users found</p>
              )}

              {selectedUser && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-medium text-blue-900">Selected User:</p>
                  <p className="text-sm text-blue-700">{selectedUser.name}</p>
                  <p className="text-xs text-blue-600">{selectedUser.email}</p>
                </div>
              )}

              <button
                type="button"
                onClick={handleAddSpoc}
                disabled={!selectedUser}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:bg-slate-300 disabled:cursor-not-allowed"
              >
                Add as SPOC
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Job Modal */}
      {showAssignJob && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50 rounded-lg">
          <div className={`bg-white rounded-lg p-6 ${editMode ? 'max-w-2xl' : 'max-w-md'} w-full mx-4 max-h-[80vh] overflow-y-auto`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">
                {editMode ? 'Manage Assigned Jobs' : 'Assign Job to SPOC'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowAssignJob(false)
                  setEditMode(false)
                  setAssignedJobsForEdit([])
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {editMode ? (
              <div className="space-y-4">
                {assignedJobsForEdit.length === 0 ? (
                  <p className="text-slate-500 text-center py-8">No jobs assigned yet</p>
                ) : (
                  <div className="space-y-3">
                    {assignedJobsForEdit.map((job) => (
                      <div
                        key={job.job_id || job.id}
                        className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-slate-900">
                            {job.role || job.title}
                          </p>
                          <p className="text-sm text-slate-600">
                            {job.company_name || job.company}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleRemoveAssignment(job)}
                            className="px-3 py-1.5 text-sm border border-red-200 text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-1"
                          >
                            <X className="h-4 w-4" /> Delete
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setAssignJobId(job.job_id || job.id)
                              setEditMode(false)
                              setAssignSpocId(assignSpocId)
                            }}
                            className="px-3 py-1.5 text-sm border border-blue-200 text-blue-600 hover:bg-blue-50 rounded-lg flex items-center gap-1"
                          >
                            <Briefcase className="h-4 w-4" /> Reassign
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Select SPOC
                  </label>
                  <select
                    value={assignSpocId || ""}
                    onChange={(e) => setAssignSpocId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Choose SPOC</option>
                    {assignDropdownSpocs.map((spoc) => (
                      <option
                        key={spoc.spoc_id || spoc.id || spoc.spocId}
                        value={spoc.spoc_id || spoc.id || spoc.spocId}
                      >
                        {spoc.name} {spoc.branch ? `- ${spoc.branch}` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Select Job
                  </label>
                  <select
                    value={assignJobId || ""}
                    onChange={(e) => setAssignJobId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Choose Job --</option>
                    {availableJobs
                      .map((job) => (
                        <option key={job.job_id || job.id} value={job.job_id || job.id}>
                          {job.role || job.title} - {job.company_name || job.company}
                        </option>
                      ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleAssignJob}
                  disabled={!assignSpocId || !assignJobId}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:bg-slate-300 disabled:cursor-not-allowed"
                >
                  Assign Job
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
