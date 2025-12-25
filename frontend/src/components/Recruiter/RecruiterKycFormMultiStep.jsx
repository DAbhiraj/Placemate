import React, { useState, useEffect } from 'react';
import { Upload, AlertCircle, CheckCircle, ChevronRight, Lock } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const RecruiterKycFormMultiStep = ({ recruiterData, onSuccess }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Recruiter Details
    years_of_experience: '',
    hr_contact_number: '',
    linkedin_profile_url: '',
    // Step 2: Company Details
    company_name: '',
    company_website: '',
    company_address: '',
    pan_number: '',
    pan_document_url: '',
    agreedToTerms: false
  });

  const [panFile, setPanFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);
  const [showExitWarning, setShowExitWarning] = useState(false);
  const [isFormDirty, setIsFormDirty] = useState(false);

  // Security: Prevent back/refresh
  useEffect(() => {
    // Prevent browser back button
    const handlePopState = (e) => {
      e.preventDefault();
      setShowExitWarning(true);
      window.history.pushState(null, null, window.location.href);
    };

    window.history.pushState(null, null, window.location.href);
    window.addEventListener('popstate', handlePopState);

    // Prevent refresh/close
    const handleBeforeUnload = (e) => {
      if (isFormDirty || formData.years_of_experience || formData.company_name) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isFormDirty, formData]);

  // Security: Verify recruiter data
  useEffect(() => {
    const email = localStorage.getItem('email');
    
    if (!email) {
      // Redirect to login without clearing localStorage (let auth handle it)
      window.location.href = '/';
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setIsFormDirty(true);
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
      setIsFormDirty(true);
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
      const response = await axios.post(`${API_URL}/upload/document`, formDataObj, 
        {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials : true,
      }
    );
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

  const validateStep1 = () => {
    if (!formData.years_of_experience) return 'Years of experience is required';
    if (isNaN(formData.years_of_experience) || formData.years_of_experience < 0 || formData.years_of_experience > 60) {
      return 'Please enter a valid number between 0 and 60';
    }
    if (!formData.hr_contact_number.trim()) return 'HR contact number is required';
    if (!/^\d{10}$/.test(formData.hr_contact_number.replace(/\D/g, ''))) {
      return 'Please enter a valid 10-digit phone number';
    }
    return '';
  };

  const validateStep2 = () => {
    if (!formData.company_name.trim()) return 'Company name is required';
    if (!formData.company_address.trim()) return 'Company address is required';
    if (!formData.pan_number.trim()) return 'PAN number is required';
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.pan_number)) {
      return 'Please enter a valid PAN number (e.g., AAAPA5055K)';
    }
    if (!formData.pan_document_url) return 'Please upload PAN document';
    if (!formData.agreedToTerms) return 'Please agree to the terms and conditions';
    return '';
  };

  const handleNextStep = () => {
    setError('');
    const validationError = validateStep1();
    if (validationError) {
      setError(validationError);
      return;
    }
    setCurrentStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const validationError = validateStep2();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/recruiter/kyc`, {
        company_name: formData.company_name,
        company_website: formData.company_website || null,
        company_address: formData.company_address,
        pan_number: formData.pan_number.toUpperCase(),
        pan_document_url: formData.pan_document_url,
        hr_contact_number: formData.hr_contact_number,
        linkedin_profile_url: formData.linkedin_profile_url || null,
        years_of_experience: parseInt(formData.years_of_experience)
      },
  {
    withCredentials: true // ✅ put it here
  });

      if (response.status === 201) {
        setIsFormDirty(false);
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

  const handlePreviousStep = () => {
    if (currentStep === 2) {
      setError('');
      setSuccess('');
      setCurrentStep(1);
    }
  };

  const handleCancel = () => {
    if (isFormDirty || formData.years_of_experience || formData.company_name) {
      setShowExitWarning(true);
    }
  };

  const confirmExit = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Exit Warning Modal */}
        {showExitWarning && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="w-6 h-6 text-red-600" />
                <h2 className="text-xl font-bold text-gray-900">Unsaved Changes</h2>
              </div>
              <p className="text-gray-600 mb-6">
                If you leave or refresh the page, your form data will be cleared. Are you sure you want to exit?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowExitWarning(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                >
                  Continue Form
                </button>
                <button
                  onClick={confirmExit}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
                >
                  Exit & Logout
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Recruiter KYC Verification</h1>
            <p className="text-gray-600">
              Complete your Know Your Customer verification in 2 steps
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              {/* Step 1 */}
              <div className="flex items-center gap-3 flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition ${
                    currentStep >= 1
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  1
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">Recruiter Details</p>
                  <p className="text-xs text-gray-500">Experience & Contact</p>
                </div>
              </div>

              {/* Connector */}
              <div
                className={`w-8 h-1 transition ${
                  currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />

              {/* Step 2 */}
              <div className="flex items-center gap-3 flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition ${
                    currentStep >= 2
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  2
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">Company Details</p>
                  <p className="text-xs text-gray-500">Company & PAN Info</p>
                </div>
              </div>
            </div>

            {/* Progress percentage */}
            <div className="w-full bg-gray-200 rounded-full h-1">
              <div
                className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 2) * 100}%` }}
              />
            </div>
          </div>

          {/* Security Notice */}
          <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg flex items-start gap-3">
            <Lock className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-orange-900">Security Notice</p>
              <p className="text-xs text-orange-700 mt-1">
                Do not go back, refresh, or close this page while filling the form. Your data will be lost. You can also not skip steps.
              </p>
            </div>
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

          <form onSubmit={currentStep === 2 ? handleSubmit : (e) => { e.preventDefault(); handleNextStep(); }} className="space-y-6">
            {/* STEP 1: RECRUITER DETAILS */}
            {currentStep === 1 && (
              <>
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

                {/* Years of Experience */}
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
                  <p className="text-xs text-gray-500 mt-1">Enter your total professional experience in years</p>
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
                  <p className="text-xs text-gray-500 mt-1">10-digit mobile number without country code</p>
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
                  <p className="text-xs text-gray-500 mt-1">Optional: Link to your LinkedIn profile</p>
                </div>
              </>
            )}

            {/* STEP 2: COMPANY DETAILS */}
            {currentStep === 2 && (
              <>
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
                  <p className="text-xs text-gray-500 mt-1">Format: 5 letters, 4 digits, 1 letter (e.g., AAAPA5055K)</p>
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
              </>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-4 pt-6 border-t border-gray-200">
              {currentStep === 2 && (
                <button
                  type="button"
                  onClick={handlePreviousStep}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold"
                >
                  ← Back
                </button>
              )}

              {currentStep === 1 && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 px-6 py-3 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition font-semibold"
                >
                  Cancel
                </button>
              )}

              {currentStep === 1 ? (
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold flex items-center justify-center gap-2"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold"
                >
                  {loading ? 'Submitting KYC...' : 'Submit KYC for Verification'}
                </button>
              )}
            </div>
          </form>

          <p className="mt-6 text-xs text-gray-500 text-center">
            Your information is secure and will only be used for verification purposes.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RecruiterKycFormMultiStep;
