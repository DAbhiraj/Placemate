import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import axios from 'axios';


const ProfileSetupModal = ({ isOpen, onClose }) => {
  
  const [formData, setFormData] = useState({
    branch: '',
    cgpa: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.branch.trim()) newErrors.branch = 'Branch is required';
    if (!formData.cgpa) newErrors.cgpa = 'CGPA is required';

    // CGPA validation
    if (formData.cgpa && (isNaN(formData.cgpa) || formData.cgpa < 0 || formData.cgpa > 10)) {
      newErrors.cgpa = 'CGPA must be between 0 and 10';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem("id");
      console.log("userId in profile setup modal", userId);
      const response = await axios.put(
        `http://localhost:4000/api/profile/${userId}`,
        formData, 
        {
          headers: {
            "Content-Type": "application/json", // Ensure server parses JSON
            // "Authorization": `Bearer ${token}` // Optional if you need auth
          }
        }
      );

      console.log("response in profile setup modal", response);
      const data = response.data;
      console.log("data in profile setup modal", data);
     
        // Update localStorage with new user data
      console.log("updating localStorage with new user data");
        localStorage.setItem("branch", formData.branch);
        localStorage.setItem("cgpa",formData.cgpa);

      
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Profile Setup Error:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Complete Your Profile</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="mb-6">
            <p className="text-gray-600">
              Please provide your academic information to complete your profile.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Branch *
              </label>
              <select
                name="branch"
                value={formData.branch}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.branch ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select your branch</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Electronics">Electronics</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Mechanical">Mechanical</option>
                <option value="Civil">Civil</option>
                <option value="Chemical">Chemical</option>
                <option value="Electrical">Electrical</option>
                <option value="Other">Other</option>
              </select>
              {errors.branch && (
                <p className="text-red-500 text-sm mt-1">{errors.branch}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CGPA *
              </label>
              <input
                type="number"
                name="cgpa"
                value={formData.cgpa}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                max="10"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.cgpa ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="8.5"
              />
              {errors.cgpa && (
                <p className="text-red-500 text-sm mt-1">{errors.cgpa}</p>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Skip for now
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg font-medium flex items-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Complete Profile'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetupModal;
