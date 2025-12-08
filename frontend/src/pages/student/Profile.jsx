import React, { useState, useEffect } from "react"
import Loader from "../../components/Loader"
import { useSelector, useDispatch } from "react-redux"
import { updateUser } from "../../store/slices/userSlice"
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
import axios from "axios";

const Profile = () => {
  const dispatch = useDispatch()
  const reduxUser = useSelector((state) => state.user.user)
  
  const [currentUser, setCurrentUser] = useState({})
  const [editingUser, setEditingUser] = useState({})

  const [isEditing, setIsEditing] = useState(false)
  const [newSkill, setNewSkill] = useState("")
  const [skills, setSkills] = useState(currentUser?.skills || [])
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  // const [atsScore, setAtsScore] = useState(null)
  // const [atsFeedback, setAtsFeedback] = useState("")

  // API Base URL
  const API_BASE = "http://localhost:4000/api"

  // Get auth token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem("token")
  }

  // Fetch profile data
  const fetchProfile = async () => {
    try {
      setLoading(true)
      const token = getAuthToken()
      const response = await axios.get(`${API_BASE}/profile?userId=${localStorage.getItem("id")}`);
      console.log("response");
      console.log(response);
        const data = response.data;
        
        setProfile(data.data)
        // Normalize skills into an array. Accept: Array, comma-separated string, or JSON string with escapes.
        const rawSkills = data.data.skills;
        let skillsArr = [];
        if (Array.isArray(rawSkills)) {
          skillsArr = rawSkills;
        } else if (typeof rawSkills === 'string' && rawSkills.trim()) {
          try {
            // Try JSON parse first (handles "[\"C++\", \"Java\"]" cases)
            const parsed = JSON.parse(rawSkills);
            if (Array.isArray(parsed)) skillsArr = parsed;
            else if (typeof parsed === 'string') skillsArr = parsed.split(/,|\n/).map(s => s.trim()).filter(Boolean);
            else skillsArr = [];
          } catch (e) {
            // Fallback: clean escaped newlines and quotes, then split by comma or newline
            let cleaned = rawSkills.replace(/\\n/g, ',');
            cleaned = cleaned.replace(/^[{\[]+|[}\]]+$/g, ''); // remove surrounding braces/brackets
            cleaned = cleaned.replace(/\"/g, '"');
            cleaned = cleaned.replace(/(^\"|\"$)/g, '');
            cleaned = cleaned.replace(/\"/g, '');
            skillsArr = cleaned.split(/,|\n/).map(s => s.trim()).filter(Boolean);
          }
        } else {
          skillsArr = [];
        }
        setSkills(skillsArr);
        // setAtsScore(data.data.ats_score || 0)
        // setAtsFeedback(data.data.ats_feedback || "")

        setCurrentUser(prev => ({
          ...prev,
          name: data.data.name,
          email: data.data.email,
          branch: data.data.branch,
          cgpa: data.data.cgpa,
          phone: data.data.phone,
          rollNumber: data.data.roll_no,
          application_type : data.data.application_type
        }))
        // Store branch and cgpa in localStorage for Redux hydration (robust)
        if (data.data.branch) localStorage.setItem('branch', data.data.branch);
        if (typeof data.data.cgpa === 'number' && !isNaN(data.data.cgpa)) {
          localStorage.setItem('cgpa', String(data.data.cgpa));
        } else if (typeof data.data.cgpa === 'string' && data.data.cgpa.trim() !== '' && !isNaN(Number(data.data.cgpa))) {
          localStorage.setItem('cgpa', String(Number(data.data.cgpa)));
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
      const response = await axios.put(`${API_BASE}/profile/${localStorage.getItem("id")}`, {
        updateData
      })
      
      if (response.data.success) {
        const profile = response.data;
        setProfile(profile.data)
        
        // Sync profile updates to localStorage (excluding skills and resume)
        if (updateData.name) {
          localStorage.setItem('name', updateData.name);
        }
        if (updateData.email) {
          localStorage.setItem('email', updateData.email);
        }
        if (updateData.branch) {
          localStorage.setItem('branch', updateData.branch);
        }
        if (updateData.cgpa) {
          localStorage.setItem('cgpa', String(Number(updateData.cgpa)));
        }
        if (updateData.application_type) {
          localStorage.setItem('application_type', updateData.application_type);
        }
        
        return true
      }
      return false
    } catch (error) {
      console.error("Error updating profile:", error)
      return false
    }
  }

  // Handle edit mode toggle
  const toggleEditMode = () => {
    if (isEditing) {
      // Cancel edit
      setEditingUser({})
    } else {
      // Enter edit mode
      setEditingUser({ ...currentUser })
    }
    setIsEditing(!isEditing)
  }

  // Handle input changes in edit mode
  const handleFieldChange = (field, value) => {
    setEditingUser(prev => ({ ...prev, [field]: value }))
  }

  // Save edited profile
  const handleSaveProfile = async () => {
    try {
      const updateData = {
        branch: editingUser.branch || currentUser.branch,
        cgpa: editingUser.cgpa || currentUser.cgpa,
        email : editingUser.email || currentUser.email,
        phone : editingUser.phone || currentUser.phone,
        name  : editingUser.name || currentUser.name
      }
      // Determine application type from roll number prefix
      const roll = (editingUser.rollNumber || currentUser.rollNumber || localStorage.getItem('roll_no') || "").toString();
      const prefix = roll.slice(0,2);
      // Map prefix '23' => internship, otherwise 'fte'
      updateData.application_type = (prefix === '23') ? 'internship' : 'fte';
      const success = await updateProfile(updateData)
      if (success) {
        const updatedUser = { ...currentUser, ...editingUser }
        setCurrentUser(updatedUser)
        // Also update Redux store
        dispatch(updateUser(updatedUser))
        setEditingUser({})
        setIsEditing(false)
        alert("Profile updated successfully!")
      } else {
        alert("Failed to update profile")
      }
    } catch (error) {
      console.error("Error saving profile:", error)
      alert("Error updating profile")
    }
  }

  // Update skills
  const updateSkills = async () => {
    try {
      const token = getAuthToken()
      const response = await axios.put(`${API_BASE}/profile/skills/${localStorage.getItem("id")}`, 
        {skills}
      )
      console.log("response is ok na");
      console.log(response);
      setSkills(response.data.data);

      return response.data.success;
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
   
      const formData = new FormData()
      formData.append("resume", selectedFile)
      const userId = localStorage.getItem("id");

      const response = await fetch(`${API_BASE}/profile/resume?userId=${userId}`, {
        method: "POST",
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        // setAtsScore(data.data.ats_score)
        // setAtsFeedback(data.data.feedback)
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
      })

      if (response.ok) {
        // setAtsScore(null)
        // setAtsFeedback("")
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
    fetchProfile();
  }, []);   // only on component load


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

  // const resumeScoreColor = score => {
  //   if (score >= 90) return "text-green-600"
  //   if (score >= 75) return "text-blue-600"
  //   if (score >= 60) return "text-yellow-600"
  //   return "text-red-600"
  // }

  // const resumeScoreLabel = score => {
  //   if (score >= 90) return "Excellent"
  //   if (score >= 75) return "Good"
  //   if (score >= 60) return "Average"
  //   return "Needs Improvement"
  // }

  if (loading) {
    return <Loader text={uploading ? "Updating..." : "Loading..."} />;
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
                {currentUser?.branch} • {currentUser?.rollNumber} • {currentUser?.application_type}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleEditMode}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors flex items-center"
            >
              <Edit3 className="w-4 h-4 mr-2" />
              {isEditing ? "Cancel" : "Edit Profile"}
            </button>
            {isEditing && (
              <button
                onClick={handleSaveProfile}
                className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg transition-colors flex items-center text-white"
              >
                Save Changes
              </button>
            )}
          </div>
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
                    value={isEditing ? (editingUser?.name || "") : (currentUser?.name || "")}
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    disabled={!isEditing}
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
                    value={isEditing ? (editingUser?.email || "") : (currentUser?.email || "")}
                    onChange={(e) => handleFieldChange('email', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    disabled={!isEditing}
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
                  value={isEditing ? (editingUser?.cgpa || "") : (currentUser?.cgpa || "")}
                  onChange={(e) => handleFieldChange('cgpa', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  disabled={!isEditing}
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
                    value={isEditing ? (editingUser?.phone || "") : (currentUser?.phone || "")}
                    onChange={(e) => handleFieldChange('phone', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    disabled={!isEditing}
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
                {/* {atsFeedback && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">ATS Feedback:</h4>
                    <p className="text-sm text-gray-700">{atsFeedback}</p>
                  </div>
                )} */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
