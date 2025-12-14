import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import RecruiterKycFormMultiStep from '../../components/Recruiter/RecruiterKycFormMultiStep';
import RecruiterVerificationPending from '../../components/Recruiter/RecruiterVerificationPending';
import RecruiterDashboard from './RecruiterDashboard';
import axiosClient from '../../api/axiosClient';

const API_URL = import.meta.env.VITE_API_URL;

const RecruiterOnboarding = () => {
  const navigate = useNavigate();
  const [recruiterData, setRecruiterData] = useState(null);
  const [kycStatus, setKycStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    checkRecruiterStatus();
  }, []);

  const checkRecruiterStatus = async () => {
    try {
      console.log("🟡 RecruiterOnboarding - START checkRecruiterStatus");
      const email = localStorage.getItem('email');
      const name = localStorage.getItem('name');
      const role = localStorage.getItem('role');

      console.log("🟡 RecruiterOnboarding - localStorage data:", { 
        email, 
        name, 
        role,
      });

      // Get recruiter data
      setRecruiterData({
        email,
        name
      });

      // Check if recruiter is verified
      const userResponse = await axiosClient.get(`/recruiter`);
      const user = userResponse.data;
      
      console.log("RecruiterOnboarding - User from API:", user);
      console.log("RecruiterOnboarding - User is verified:", user.is_verified);

      if (user.is_verified) {
        // Already verified, show dashboard
        console.log("🟡 RecruiterOnboarding - User is VERIFIED, setting kycStatus to 'verified'");
        setKycStatus('verified');
        setLoading(false);
        return;
      }

      // Check if KYC already submitted
      const kycResponse = await axiosClient.get(`/recruiter/kyc`);
      if (kycResponse.data) {
        // KYC submitted, check status
        if (kycResponse.data.approval_status === 'approved') {
          setKycStatus('verified');
        } else if (kycResponse.data.approval_status === 'pending') {
          setKycStatus('pending');
        } else if (kycResponse.data.approval_status === 'rejected') {
          setKycStatus('rejected');
        }
      } else {
        // No KYC submitted, show form
        setKycStatus('form');
      }

      setLoading(false);
    } catch (err) {
      console.error('Error checking recruiter status:', err);
      if (err.response?.status === 404) {
        // Recruiter endpoint not found, show form
        setKycStatus('form');
        
        setRecruiterData({
          email: localStorage.getItem('email'),
          name: localStorage.getItem('name')
        });
      } else {
        setError('Error loading recruiter data');
      }
      setLoading(false);
    }
  };

  const handleKycSuccess = () => {
    setKycStatus('pending');
  };

  const handleVerificationComplete = () => {
    setKycStatus('verified');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (kycStatus === 'form') {
    return (
      <RecruiterKycFormMultiStep 
        recruiterData={recruiterData} 
        onSuccess={handleKycSuccess}
      />
    );
  }

  if (kycStatus === 'pending' || kycStatus === 'rejected') {
    return (
      <RecruiterVerificationPending 
        onVerified={handleVerificationComplete}
      />
    );
  }

  if (kycStatus === 'verified') {
    console.log("🟡 RecruiterOnboarding - RENDER: kycStatus is 'verified', redirecting to dashboard");
    window.location.href = '/recruiter/viewjobs';
    return null;
  }

  console.log("📄 RecruiterOnboarding - RENDER: kycStatus =", kycStatus);
  return null;
};

export default RecruiterOnboarding;
