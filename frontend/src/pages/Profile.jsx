import React, { useState, useEffect } from "react"
import {
  User,
  Mail,
  Phone,
  Calendar,
  Award,
  Download,
  FileText,
  Edit3,
  Plus,
  X,
  Upload,
  Trash2,
  Loader2
} from "lucide-react"
import { useApp } from "../context/AppContext"

const Profile = () => {
  const { currentUser } = useApp()
  const [isEditing, setIsEditing] = useState(false)
  const [newSkill, setNewSkill] = useState("")
  const [skills, setSkills] = useState(currentUser?.skills || [])
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [atsScore, setAtsScore] = useState(null)
  const [atsFeedback, setAtsFeedback] = useState("")

  // API Base URL
  const API_BASE = "http://localhost:5000"

  // Get auth token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem("token")
  }

  // Fetch profile data
  const fetchProfile = async () => {
    try {
      setLoading(true)
      const token = getAuthToken()
      const response = await fetch(`${API_BASE}/profile`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setProfile(data.data)
        setSkills(data.data.skills || [])
        setAtsScore(data.data.ats_score)
        setAtsFeedback(data.data.ats_feedback || "")
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
    } finally {
      setLoading(false)
    }
  }

  // Update profile
  const updateProfile = async (updateData) => {
    try {
      const token = getAuthToken()
      const response = await fetch(`${API_BASE}/profile`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(updateData)
      })
      
      if (response.ok) {
        const data = await response.json()
        setProfile(data.data)
        return true
      }
      return false
    } catch (error) {
      console.error("Error updating profile:", error)
      return false
    }
  }

  // Update skills
  const updateSkills = async () => {
    try {
      const token = getAuthToken()
      const response = await fetch(`${API_BASE}/profile/skills`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ skills })
      })
      
      if (response.ok) {
        return true
      }
      return false
    } catch (error) {
      console.error("Error updating skills:", error)
      return false
    }
  }

  // Upload resume
  const uploadResume = async () => {
    if (!selectedFile) return

    try {
      setUploading(true)
      const token = getAuthToken()
      const formData = new FormData()
      formData.append("resume", selectedFile)

      const response = await fetch(`${API_BASE}/profile/resume`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        setAtsScore(data.data.ats_score)
        setAtsFeedback(data.data.feedback)
        setSelectedFile(null)
        // Refresh profile data
        await fetchProfile()
        alert("Resume uploaded and analyzed successfully!")
      } else {
        const errorData = await response.json()
        alert(`Error: ${errorData.message}`)
      }
    } catch (error) {
      console.error("Error uploading resume:", error)
      alert("Failed to upload resume")
    } finally {
      setUploading(false)
    }
  }

  // Download resume
  const downloadResume = async () => {
    try {
      const token = getAuthToken()
      const response = await fetch(`${API_BASE}/profile/resume`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = profile?.resume_filename || "resume.pdf"
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        alert("Resume not found")
      }
    } catch (error) {
      console.error("Error downloading resume:", error)
      alert("Failed to download resume")
    }
  }

  // Delete resume
  const deleteResume = async () => {
    if (!confirm("Are you sure you want to delete your resume?")) return

    try {
      const token = getAuthToken()
      const response = await fetch(`${API_BASE}/profile/resume`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (response.ok) {
        setAtsScore(null)
        setAtsFeedback("")
        await fetchProfile()
        alert("Resume deleted successfully")
      } else {
        alert("Failed to delete resume")
      }
    } catch (error) {
      console.error("Error deleting resume:", error)
      alert("Failed to delete resume")
    }
  }

  // Load profile data on component mount
  useEffect(() => {
    if (currentUser) {
      fetchProfile()
    }
  }, [currentUser])

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()])
      setNewSkill("")
    }
  }

  const removeSkill = skillToRemove => {
    setSkills(skills.filter(skill => skill !== skillToRemove))
  }

  const handleSaveSkills = async () => {
    const success = await updateSkills()
    if (success) {
      alert("Skills updated successfully!")
    } else {
      alert("Failed to update skills")
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      if (!allowedTypes.includes(file.type)) {
        alert("Please select a PDF or DOC file")
        return
      }
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB")
        return
      }
      setSelectedFile(file)
    }
  }

  const resumeScoreColor = score => {
    if (score >= 90) return "text-green-600"
    if (score >= 75) return "text-blue-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const resumeScoreLabel = score => {
    if (score >= 90) return "Excellent"
    if (score >= 75) return "Good"
    if (score >= 60) return "Average"
    return "Needs Improvement"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <User className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{currentUser?.name}</h1>
              <p className="text-blue-100">
                {currentUser?.branch} • {currentUser?.rollNumber}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors flex items-center"
          >
            <Edit3 className="w-4 h-4 mr-2" />
            {isEditing ? "Cancel" : "Edit Profile"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Basic Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="flex items-center">
                  <User className="w-5 h-5 text-gray-400 mr-3" />
                  <input
                    type="text"
                    value={currentUser?.name || ""}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    readOnly={!isEditing}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Roll Number
                </label>
                <div className="flex items-center">
                  <Award className="w-5 h-5 text-gray-400 mr-3" />
                  <input
                    type="text"
                    value={currentUser?.rollNumber || ""}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    readOnly
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="flex items-center">
                  <Mail className="w-5 h-5 text-gray-400 mr-3" />
                  <input
                    type="email"
                    value={currentUser?.email || ""}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    readOnly={!isEditing}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Branch
                </label>
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                  <input
                    type="text"
                    value={currentUser?.branch || ""}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    readOnly
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CGPA
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={currentUser?.cgpa || ""}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  readOnly={!isEditing}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </label>
                <div className="flex items-center">
                  <Phone className="w-5 h-5 text-gray-400 mr-3" />
                  <input
                    type="tel"
                    placeholder="+91 XXXXX XXXXX"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    readOnly={!isEditing}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Skills Section */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Skills</h2>
              {isEditing && (
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={e => setNewSkill(e.target.value)}
                    placeholder="Add a skill"
                    className="px-3 py-1 border border-gray-300 rounded text-sm"
                    onKeyPress={e => e.key === "Enter" && addSkill()}
                  />
                  <button
                    onClick={addSkill}
                    className="bg-blue-600 text-white p-1 rounded hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleSaveSkills}
                    className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                  >
                    Save Skills
                  </button>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {skills.map((skill, index) => (
                <span
                  key={index}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium flex items-center"
                >
                  {skill}
                  {isEditing && (
                    <button
                      onClick={() => removeSkill(skill)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </span>
              ))}
            </div>
          </div>

          {/* Documents Section */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Documents
            </h2>

            <div className="space-y-4">
              {/* Resume Upload/Display */}
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <FileText className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">Resume</p>
                      {profile?.resume_filename ? (
                        <p className="text-sm text-gray-500">
                          Last updated: {new Date(profile.resume_upload_date).toLocaleDateString()}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-500">No resume uploaded</p>
                      )}
                    </div>
                  </div>
                  {profile?.resume_filename && (
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={downloadResume}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </button>
                      <button 
                        onClick={deleteResume}
                        className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>

                {/* File Upload */}
                <div className="space-y-3">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {selectedFile && (
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center">
                        <FileText className="w-4 h-4 text-blue-600 mr-2" />
                        <span className="text-sm text-blue-800">{selectedFile.name}</span>
                      </div>
                      <button
                        onClick={uploadResume}
                        disabled={uploading}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center"
                      >
                        {uploading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 mr-2" />
                            Upload & Analyze
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* ATS Feedback */}
                {atsFeedback && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">ATS Feedback:</h4>
                    <p className="text-sm text-gray-700">{atsFeedback}</p>
                  </div>
                )}
              </div>

              {/* Transcript placeholder */}
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center">
                  <FileText className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Transcript</p>
                    <p className="text-sm text-gray-500">
                      Coming soon
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button disabled className="text-gray-400 text-sm font-medium cursor-not-allowed">
                    View
                  </button>
                  <button disabled className="text-gray-400 text-sm font-medium flex items-center cursor-not-allowed">
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Resume Score & Quick Actions */}
        <div className="space-y-6">
          {/* Resume Score */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Resume Score
            </h3>
            <div className="text-center">
              <div className="relative inline-flex items-center justify-center w-32 h-32 mb-4">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-gray-200"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={`${(atsScore || 0) *
                      3.51} 351`}
                    className={resumeScoreColor(atsScore || 0)}
                  />
                </svg>
                <span className="absolute text-2xl font-bold text-gray-900">
                  {atsScore || 0}/100
                </span>
              </div>
              <p
                className={`font-medium ${resumeScoreColor(
                  atsScore || 0
                )}`}
              >
                {resumeScoreLabel(atsScore || 0)}
              </p>
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Contact Info</span>
                <span className="text-green-600 font-medium">✓ Complete</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Experience</span>
                <span className="text-green-600 font-medium">✓ Complete</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Projects</span>
                <span className="text-yellow-600 font-medium">
                  • Needs Work
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Skills</span>
                <span className="text-green-600 font-medium">✓ Complete</span>
              </div>
            </div>

            <button className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
              Improve Resume
            </button>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              {profile?.resume_filename ? (
                <button 
                  onClick={downloadResume}
                  className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center">
                    <Download className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-sm font-medium">Download Resume</span>
                  </div>
                </button>
              ) : (
                <button 
                  onClick={() => document.querySelector('input[type="file"]').click()}
                  className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center">
                    <Upload className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-sm font-medium">Upload Resume</span>
                  </div>
                </button>
              )}
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">
                  <Edit3 className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-sm font-medium">
                    {isEditing ? "Stop Editing" : "Edit Profile"}
                  </span>
                </div>
              </button>
              <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-sm font-medium">Email Preferences</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
