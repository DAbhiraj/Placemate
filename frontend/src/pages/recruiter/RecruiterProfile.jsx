import React, { useState, useEffect } from 'react';
import { Edit, LogOut, User, Briefcase, Phone, Linkedin, MapPin, Globe, IndianRupee, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RecruiterProfile = () => {
  const navigate = useNavigate();
  const [recruiterData, setRecruiterData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = () => {
    try {
      const data = {
        // Personal Details
        name: localStorage.getItem('name') || '',
        email: localStorage.getItem('email') || '',
        id: localStorage.getItem('id') || '',
        role: localStorage.getItem('role') || 'recruiter',
        
        // Recruiter Details
        yearsOfExperience: localStorage.getItem('yearsOfExperience') || '',
        hrContactNumber: localStorage.getItem('hrContactNumber') || '',
        linkedinProfile: localStorage.getItem('linkedinProfile') || '',
        
        // Company Details
        company: localStorage.getItem('company') || '',
        companyWebsite: localStorage.getItem('companyWebsite') || '',
        companyAddress: localStorage.getItem('companyAddress') || '',
        panNumber: localStorage.getItem('panNumber') || '',
      };

      setRecruiterData(data);
      setEditData(data);
      setLoading(false);
    } catch (err) {
      console.error('Error loading profile:', err);
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.clear();
      sessionStorage.clear();
      navigate('/');
    }
  };

  const handleEditChange = (field, value) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveChanges = () => {
    // Update localStorage
    localStorage.setItem('hrContactNumber', editData.hrContactNumber);
    localStorage.setItem('linkedinProfile', editData.linkedinProfile);
    
    setRecruiterData(editData);
    setIsEditing(false);
    alert('Profile updated successfully!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
          {/* Cover Background */}
          <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600"></div>

          {/* Profile Info */}
          <div className="px-8 pb-8">
            <div className="flex items-start justify-between -mt-16 mb-6">
              <div className="flex items-end gap-4">
                <div className="w-24 h-24 bg-white rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                  <User className="w-12 h-12 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{recruiterData.name}</h1>
                  <p className="text-gray-600">{recruiterData.email}</p>
                  <p className="text-sm text-gray-500 mt-1">Recruiter ID: {recruiterData.id}</p>
                </div>
              </div>

              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  <Edit className="w-4 h-4" />
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Recruiter Details Section */}
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Recruiter Details</h2>
              </div>

              <div className="space-y-6">
                {/* Years of Experience */}
                <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Years of Experience</p>
                      <p className="text-lg font-semibold text-gray-900">{recruiterData.yearsOfExperience || 'N/A'} years</p>
                    </div>
                  </div>
                </div>

                {/* HR Contact Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-blue-600" />
                    HR Contact Number
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editData.hrContactNumber}
                      onChange={(e) => handleEditChange('hrContactNumber', e.target.value)}
                      placeholder="+91 9876543210"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  ) : (
                    <p className="px-4 py-2.5 bg-gray-100 rounded-lg text-gray-900">{recruiterData.hrContactNumber || 'Not provided'}</p>
                  )}
                </div>

                {/* LinkedIn Profile */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Linkedin className="w-4 h-4 text-blue-600" />
                    LinkedIn Profile URL
                  </label>
                  {isEditing ? (
                    <input
                      type="url"
                      value={editData.linkedinProfile}
                      onChange={(e) => handleEditChange('linkedinProfile', e.target.value)}
                      placeholder="https://linkedin.com/in/yourprofile"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  ) : (
                    <div className="px-4 py-2.5 bg-gray-100 rounded-lg">
                      {recruiterData.linkedinProfile ? (
                        <a
                          href={recruiterData.linkedinProfile}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline break-all"
                        >
                          {recruiterData.linkedinProfile}
                        </a>
                      ) : (
                        <p className="text-gray-900">Not provided</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {isEditing && (
                <button
                  onClick={handleSaveChanges}
                  className="mt-6 w-full px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                >
                  Save Changes
                </button>
              )}
            </div>

            {/* Company Details Section */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-indigo-100 p-2 rounded-lg">
                  <Briefcase className="w-5 h-5 text-indigo-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Company Details</h2>
              </div>

              <div className="space-y-4">
                {/* Company Name */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Company Name</p>
                  <p className="text-lg font-semibold text-gray-900">{recruiterData.company || 'N/A'}</p>
                </div>

                {/* Company Website */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <label className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-indigo-600" />
                    Company Website
                  </label>
                  {recruiterData.companyWebsite ? (
                    <a
                      href={recruiterData.companyWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline break-all text-sm"
                    >
                      {recruiterData.companyWebsite}
                    </a>
                  ) : (
                    <p className="text-gray-900">Not provided</p>
                  )}
                </div>

                {/* Company Address */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <label className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-indigo-600" />
                    Company Address
                  </label>
                  <p className="text-gray-900 text-sm whitespace-pre-wrap">{recruiterData.companyAddress || 'N/A'}</p>
                </div>

                {/* PAN Number */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <label className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                    <IndianRupee className="w-4 h-4 text-indigo-600" />
                    PAN Number
                  </label>
                  <p className="text-gray-900 font-mono">{recruiterData.panNumber || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Account Status */}
            <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Account Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                  <span className="text-sm text-green-700 font-medium">Verified</span>
                  <span className="inline-block w-2 h-2 bg-green-600 rounded-full"></span>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs text-blue-700">
                    <strong>Role:</strong> {recruiterData.role}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/recruiter/dashboard')}
                  className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm"
                >
                  Go to Dashboard
                </button>
                <button
                  onClick={() => navigate('/recruiter/viewjobs')}
                  className="w-full px-4 py-2.5 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition font-medium text-sm"
                >
                  View My Jobs
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecruiterProfile;
