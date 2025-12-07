import React, { useState } from 'react';
import { Upload, AlertCircle, CheckCircle } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const RecruiterKycForm = ({ recruiterData, onSuccess }) => {
  const [formData, setFormData] = useState({
    company_name: '',
    company_website: '',
    company_address: '',
    pan_number: '',
    pan_document_url: '',
    hr_contact_number: '',
    linkedin_profile_url: '',
    years_of_experience: '',
    agreedToTerms: false
  });

  const [panFile, setPanFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      if (!['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)) {
        setError('Only PDF and image files are allowed');
        return;
      }
      setPanFile(file);
      setError('');
    }
  };

  const uploadPanDocument = async () => {
    if (!panFile) {
      setError('Please select a PAN document');
      return;
    }

    setUploadingFile(true);
    const formDataObj = new FormData();
    formDataObj.append('file', panFile);

    try {
      const response = await axios.post(`${API_URL}/upload/document`, formDataObj, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData(prev => ({
        ...prev,
        pan_document_url: response.data.url || response.data.filename
      }));
      setSuccess('Document uploaded successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to upload document. Please try again.');
      console.error('Upload error:', err);
    } finally {
      setUploadingFile(false);
    }
  };

  const validateForm = () => {
    if (!formData.company_name.trim()) return 'Company name is required';
    if (!formData.company_address.trim()) return 'Company address is required';
    if (!formData.pan_number.trim()) return 'PAN number is required';
    if (!formData.pan_document_url) return 'Please upload PAN document';
    if (!formData.hr_contact_number.trim()) return 'HR contact number is required';
    if (!/^\d{10}$/.test(formData.hr_contact_number.replace(/\D/g, ''))) {
      return 'Please enter a valid 10-digit phone number';
    }
    if (!formData.years_of_experience) return 'Years of experience is required';
    if (!formData.agreedToTerms) return 'Please agree to the terms';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const recruiterId = localStorage.getItem('id');
      const response = await axios.post(`${API_URL}/recruiter/${recruiterId}/kyc`, {
        company_name: formData.company_name,
        company_website: formData.company_website || null,
        company_address: formData.company_address,
        pan_number: formData.pan_number.toUpperCase(),
        pan_document_url: formData.pan_document_url,
        hr_contact_number: formData.hr_contact_number,
        linkedin_profile_url: formData.linkedin_profile_url || null,
        years_of_experience: parseInt(formData.years_of_experience)
      });

      if (response.status === 201) {
        onSuccess();
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to submit KYC. Please try again.';
      setError(errorMsg);
      console.error('KYC submission error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Recruiter KYC Verification</h1>
            <p className="text-gray-600">
              Complete your Know Your Customer verification to access the recruiter dashboard
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-900">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm font-medium text-green-900">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name & Email (Read-only) */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={recruiterData?.name || ''}
                  disabled
                  className="w-full px-4 py-2.5 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={recruiterData?.email || ''}
                  disabled
                  className="w-full px-4 py-2.5 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Company Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="company_name"
                value={formData.company_name}
                onChange={handleInputChange}
                placeholder="Enter your company name"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                required
              />
            </div>

            {/* Company Website */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Website (Optional)
              </label>
              <input
                type="url"
                name="company_website"
                value={formData.company_website}
                onChange={handleInputChange}
                placeholder="https://example.com"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
            </div>

            {/* Company Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Address <span className="text-red-500">*</span>
              </label>
              <textarea
                name="company_address"
                value={formData.company_address}
                onChange={handleInputChange}
                placeholder="Enter complete company address"
                rows="3"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                required
              />
            </div>

            {/* PAN Number */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PAN Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="pan_number"
                  value={formData.pan_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, pan_number: e.target.value.toUpperCase() }))}
                  placeholder="AAAPA5055K"
                  maxLength="10"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition uppercase"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Years of Experience <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="years_of_experience"
                  value={formData.years_of_experience}
                  onChange={handleInputChange}
                  placeholder="5"
                  min="0"
                  max="60"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  required
                />
              </div>
            </div>

            {/* PAN Document Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload PAN Document (PDF or Image) <span className="text-red-500">*</span>
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition">
                <div className="flex flex-col items-center">
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 mb-1">
                    {panFile ? panFile.name : 'Click or drag file here'}
                  </p>
                  <p className="text-xs text-gray-500">PDF or image up to 5MB</p>
                </div>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  id="pan-upload"
                />
                <label htmlFor="pan-upload" className="cursor-pointer">
                  <div className="mt-3 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg inline-block text-sm font-medium hover:bg-blue-100 transition">
                    {panFile ? 'Change File' : 'Choose File'}
                  </div>
                </label>
              </div>
              {panFile && !formData.pan_document_url && (
                <button
                  type="button"
                  onClick={uploadPanDocument}
                  disabled={uploadingFile}
                  className="mt-3 w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition font-medium"
                >
                  {uploadingFile ? 'Uploading...' : 'Upload Document'}
                </button>
              )}
              {formData.pan_document_url && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-700 font-medium">✓ Document uploaded successfully</p>
                </div>
              )}
            </div>

            {/* HR Contact Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                HR Contact Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="hr_contact_number"
                value={formData.hr_contact_number}
                onChange={handleInputChange}
                placeholder="+91 9876543210"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                required
              />
            </div>

            {/* LinkedIn Profile */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                LinkedIn Profile URL (Optional)
              </label>
              <input
                type="url"
                name="linkedin_profile_url"
                value={formData.linkedin_profile_url}
                onChange={handleInputChange}
                placeholder="https://linkedin.com/in/yourprofile"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
            </div>

            {/* Agreement Checkbox */}
            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
              <input
                type="checkbox"
                name="agreedToTerms"
                checked={formData.agreedToTerms}
                onChange={handleInputChange}
                id="agree-checkbox"
                className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="agree-checkbox" className="text-sm text-gray-700">
                I confirm that all the information provided above is true and accurate. I understand that providing false information may result in rejection of my KYC.
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold text-lg"
            >
              {loading ? 'Submitting KYC...' : 'Submit KYC for Verification'}
            </button>
          </form>

          <p className="mt-6 text-xs text-gray-500 text-center">
            Your information is secure and will only be used for verification purposes.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RecruiterKycForm;
