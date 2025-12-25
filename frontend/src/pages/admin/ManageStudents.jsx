import { useEffect, useState } from "react"
import { Search, Eye, GraduationCap, Award, CheckCircle } from "lucide-react"
import axiosClient from "../../api/axiosClient"

export default function ManageStudents() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [students, setStudents] = useState([])
  const [filterValue, setFilterValue] = useState("ALL")

  const [stats, setStats] = useState({ total: 0, placed: 0, avgAttendance: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true)
        const response = await axiosClient.get("/admin/students")
        const studentsData = response.data.data || response.data
        setStudents(studentsData)

        // Stats
        const totalStudents = studentsData.length
        const placedStudents = studentsData.filter(s => s.is_placed === true || s.placed).length
        const avgAttendance =
          totalStudents > 0
            ? Math.round(
                studentsData.reduce(
                  (sum, s) =>
                    sum +
                    ((s.attendedInterviews || 0) /
                      (s.totalInterviews || 1)) *
                      100,
                  0
                ) / totalStudents
              )
            : 0

        setStats({
          total: totalStudents,
          placed: placedStudents,
          avgAttendance
        })
      } catch (error) {
        console.error("Failed to fetch students:", error)
        setStudents([])
        setStats({ total: 0, placed: 0, avgAttendance: 0 })
      } finally {
        setLoading(false)
      }
    }

    fetchStudents()
  }, [])

  // Extract unique branches + batches
  const uniqueFilters = ["ALL"]
  const branches = [...new Set(students.map(s => s.branch))].filter(Boolean)
  const batches = [...new Set(students.map(s => s.batch))].filter(Boolean)

  uniqueFilters.push(...branches)
  uniqueFilters.push(...batches.map(b => String(b)))

  // Apply search + filter
  const filteredStudents = students.filter(student => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.rollNumber &&
        student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (student.email &&
        student.email.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesFilter =
      filterValue === "ALL" ||
      student.branch === filterValue ||
      String(student.batch) === filterValue

    return matchesSearch && matchesFilter
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Manage Students</h1>
        <p className="text-slate-600 mt-1">
          Track student placement activities and performance
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600">Total Students</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{stats.total}</p>
          </div>
          <GraduationCap className="h-6 w-6 text-blue-600" />
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600">Placed Students</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{stats.placed}</p>
            <p className="text-sm text-slate-500 mt-1">
              {stats.total > 0
                ? Math.round((stats.placed / stats.total) * 100)
                : 0}
              % placement rate
            </p>
          </div>
          <Award className="h-6 w-6 text-green-600" />
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600">Avg Attendance</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{stats.avgAttendance}%</p>
          </div>
          <CheckCircle className="h-6 w-6 text-purple-600" />
        </div>
      </div>

      {/* Search + Filter */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search students..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10 bg-white border border-slate-200 rounded-lg w-full px-3 py-2"
          />
        </div>

        {/* Dropdown Filter */}
        <select
          value={filterValue}
          onChange={e => setFilterValue(e.target.value)}
          className="bg-white border border-slate-200 rounded-lg px-4 py-2"
        >
          {uniqueFilters.map((val, idx) => (
            <option key={idx} value={val}>
              {val === "ALL" ? "All Students" : val}
            </option>
          ))}
        </select>
      </div>

      {/* Students Table */}
      <div className="bg-white border border-slate-200 rounded-lg">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900 mb-2">Student List</h2>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Student</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Branch</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">CGPA</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Interviews</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">OTs</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Eligible For</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map(student => (
                  <tr key={student.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-slate-900">{student.name}</p>
                        <p className="text-sm text-slate-600">{student.rollNumber}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-900">{student.branch}</td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-2 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-semibold">
                        {student.cgpa}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-900">
                      {student.attendedInterviews}/{student.totalInterviews}
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-900">
                      {student.attendedOTs}/{student.totalOTs}
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-900">{student.eligibleFor}</td>
                    <td className="py-3 px-4">
                      {student.is_placed ? (
                        <span className="inline-block px-2 py-1 bg-green-600 text-white rounded-full text-xs font-semibold">
                          Placed
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-1 bg-slate-200 text-slate-700 rounded-full text-xs font-semibold">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 flex items-center"
                        onClick={() => setSelectedStudent(student)}
                      >
                        <Eye className="h-4 w-4 mr-1" /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredStudents.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-slate-500">No students found</p>
            </div>
          )}
        </div>
      </div>

      {/* Student Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8 relative">
            <button
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
              onClick={() => setSelectedStudent(null)}
            >
              ✕
            </button>

            <h2 className="text-2xl font-bold text-slate-900 mb-6">Student Details</h2>

            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">{selectedStudent.name}</h3>
                  <p className="text-slate-600 mt-1">{selectedStudent.rollNumber}</p>
                </div>
                {selectedStudent.placed && (
                  <span className="inline-block px-2 py-1 bg-green-600 text-white rounded-full text-xs font-semibold">
                    Placed at {selectedStudent.placedAt}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-200">
                <div>
                  <label className="text-sm font-medium text-slate-600">Email</label>
                  <p className="mt-1 text-slate-900">{selectedStudent.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Branch</label>
                  <p className="mt-1 text-slate-900">{selectedStudent.branch}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">CGPA</label>
                  <p className="mt-1 text-slate-900">{selectedStudent.cgpa}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Batch</label>
                  <p className="mt-1 text-slate-900">{selectedStudent.batch}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-slate-900 mb-4">Participation Statistics</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-slate-600">Interviews Attended</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">
                      {selectedStudent.attendedInterviews}/{selectedStudent.totalInterviews}
                    </p>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-slate-600">OTs Attended</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">
                      {selectedStudent.attendedOTs}/{selectedStudent.totalOTs}
                    </p>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 col-span-2">
                    <p className="text-sm text-slate-600">Eligible For</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">
                      {selectedStudent.eligibleFor} opportunities
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}
