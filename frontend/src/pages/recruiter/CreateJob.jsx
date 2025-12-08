import { Briefcase, DollarSign, MapPin, Calendar, Users, FileText, X, IndianRupee } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000/api';

const DEPARTMENTS = [
  'Computer Science and Engineering',
  'Electronics and Communication',
  'Information Technology',
  'Mechanical',
  'Electrical',
  'Civil',
  'Chemical',
  'Aerospace',
  'Biomedical'
];

const LOCATIONS = [
  'Bangalore',
  'Mumbai',
  'Delhi',
  'Hyderabad',
  'Chennai',
  'Pune',
  'Kolkata',
  'Ahmedabad',
  'Gurgaon',
  'Noida',
  'Remote'
];

const JOB_STATUSES = [
  'in initial stage',
  'in review',
  'in negotiation',
  'applications opened',
  'ot conducted',
  'interview',
  'completed the drive'
];

export default function CreateJob({ isModal = false, jobId = null, initialData = null, onClose = null, onJobCreated = null }) {
  const [formData, setFormData] = useState({
    companyName: localStorage.getItem("company"),
    jobRole: '',
    department: [],
    location: [],
    salary: '',
    deadline: '',
    jobType: 'Full Time',
    jobStatus: 'in initial stage',
    description: '',
    skills: '',
    minimumCgpa: '',
    eligibleBranches: '',
    onlineAssessmentDate: '',
    interviewDates: ['']
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const isEditing = jobId !== null;

  // Pre-populate form when editing
  useEffect(() => {
    if (isEditing && initialData) {
      setFormData(initialData);
    }
  }, [isEditing, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDepartmentChange = (dept) => {
    setFormData(prev => ({
      ...prev,
      department: prev.department.includes(dept)
        ? prev.department.filter(d => d !== dept)
        : [...prev.department, dept]
    }));
  };

  const handleLocationChange = (loc) => {
    setFormData(prev => ({
      ...prev,
      location: prev.location.includes(loc)
        ? prev.location.filter(l => l !== loc)
        : [...prev.location, loc]
    }));
  };

  const handleInterviewDateChange = (index, value) => {
    const updated = [...formData.interviewDates];
    updated[index] = value;
    setFormData(prev => ({
      ...prev,
      interviewDates: updated
    }));
  };

  const addInterviewDate = () => {
    setFormData(prev => ({
      ...prev,
      interviewDates: [...prev.interviewDates, '']
    }));
  };

  const removeInterviewDate = (index) => {
    setFormData(prev => ({
      ...prev,
      interviewDates: prev.interviewDates.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const jobPayload = {
        company_name: formData.companyName,
        role: formData.jobRole,
        description: formData.description,
        application_deadline: formData.deadline,
        online_assessment_date: formData.onlineAssessmentDate,
        interview_dates: formData.interviewDates.filter(d => d !== ''),
        min_cgpa: formData.minimumCgpa ? parseFloat(formData.minimumCgpa) : null,
        eligible_branches: formData.department,
        package_range: formData.salary,
        location: formData.location,
        job_type: formData.jobType,
        job_status: formData.jobStatus
      };

      const url = isEditing 
        ? `${API_BASE_URL}/recruiter/jobs/${jobId}`
        : `${API_BASE_URL}/recruiter/jobs`;

      const response = await axios({
        method: isEditing ? 'PUT' : 'POST',
        url: url,
        data: jobPayload,
        withCredentials: true
      });

      if (response.status === 200 || response.status === 201) {
        const data = response.data;
        setSuccess(isEditing ? 'Job updated successfully!' : 'Job posted successfully!');
        
        // Call callback if provided
        if (onJobCreated) {
          onJobCreated(data);
        }
        
        // Reset form
        setFormData({
          companyName: localStorage.getItem('company'),
          jobRole: '',
          department: [],
          location: [],
          salary: '',
          deadline: '',
          jobType: 'Full Time',
          jobStatus: 'in initial stage',
          description: '',
          skills: '',
          minimumCgpa: '',
          eligibleBranches: '',
          onlineAssessmentDate: '',
          interviewDates: ['']
        });

        setTimeout(() => {
          setSuccess('');
          // Close modal if in modal mode
          if (isModal && onClose) {
            onClose();
          }
        }, 2000);
      }
    } catch (err) {
      setError(err.message || 'Error creating job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={isModal ? "w-full" : "bg-white rounded-xl shadow-sm border border-gray-200 p-6"}>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Briefcase className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              {isEditing ? 'Update Job Posting' : 'Create New Job Posting'}
            </h2>
          </div>
          {isModal && onClose && (
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700 text-sm">{success}</p>
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name *
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                disabled
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed focus:ring-0 focus:border-gray-300 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Role *
              </label>
              <input
                type="text"
                name="jobRole"
                value={formData.jobRole}
                onChange={handleChange}
                required
                placeholder="e.g., Software Engineer"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Eligible branches *
            </label>
            <div className="grid grid-cols-2 gap-3">
              {DEPARTMENTS.map((dept) => (
                <label key={dept} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.department.includes(dept)}
                    onChange={() => handleDepartmentChange(dept)}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">{dept}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Locations *
            </label>
            <div className="grid grid-cols-2 gap-3">
              {LOCATIONS.map((loc) => (
                <label key={loc} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.location.includes(loc)}
                    onChange={() => handleLocationChange(loc)}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">{loc}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="flex items-center gap-2">
                  <IndianRupee className="w-4 h-4" />
                  Salary (LPA) *
                </span>
              </label>
              <input
                type="text"
                name="salary"
                value={formData.salary}
                onChange={handleChange}
                required
                placeholder="e.g., 20"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Type *
              </label>
              <select 
                name="jobType"
                value={formData.jobType}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              >
                <option>Full Time</option>
                <option>Internship</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Status *
              </label>
              <select 
                name="jobStatus"
                value={formData.jobStatus}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              >
                {JOB_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Application Deadline *
                </span>
              </label>
              <input
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Online Assessment Date
                </span>
              </label>
              <input
                type="date"
                name="onlineAssessmentDate"
                value={formData.onlineAssessmentDate}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Interview Dates
            </label>
            <div className="space-y-3">
              {formData.interviewDates.map((date, index) => (
                <div key={index} className="flex gap-3">
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => handleInterviewDateChange(index, e.target.value)}
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  />
                  {formData.interviewDates.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeInterviewDate(index)}
                      className="px-4 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addInterviewDate}
                className="w-full px-4 py-2.5 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors font-medium"
              >
                + Add Interview Date
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <span className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Job Description 
              </span>
            </label>
            <textarea
              rows={5}
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the role, responsibilities, and requirements..."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
            />
          </div>

          {/* <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Required Skills (comma separated)
            </label>
            <input
              type="text"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              placeholder="e.g., React, Node.js, TypeScript"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
          </div> */}

          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum CGPA *
              </label>
              <input
                type="number"
                step="0.01"
                name="minimumCgpa"
                value={formData.minimumCgpa}
                onChange={handleChange}
                required
                placeholder="e.g., 7.5"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>

          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (isEditing ? 'Updating...' : 'Posting...') : (isEditing ? 'Update Job' : 'Post Job')}
            </button>
            {isModal && onClose && (
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
