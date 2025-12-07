import React, { useEffect, useState } from "react";
import { CheckCircle, Clock, LogOut } from "lucide-react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const RecruiterVerificationPending = ({ recruiterId, onVerified }) => {
  const [kycStatus, setKycStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkCount, setCheckCount] = useState(0);

  useEffect(() => {
    checkKycStatus();
    const interval = setInterval(() => {
      checkKycStatus();
      setCheckCount((prev) => prev + 1);
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [recruiterId]);

  const checkKycStatus = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/recruiter/${recruiterId}/kyc`
      );
      setKycStatus(response.data);
      setLoading(false);

      console.log(response.data);
      setTimeout(() => {
        if (response.data?.is_verified === "true") {
          // Store KYC data in localStorage
          if (response.data.company_name) {
            localStorage.setItem("company", response.data.company_name);
          }
          if (response.data.company_website) {
            localStorage.setItem(
              "companyWebsite",
              response.data.company_website
            );
          }
          if (response.data.company_address) {
            localStorage.setItem(
              "companyAddress",
              response.data.company_address
            );
          }
          if (response.data.pan_number) {
            localStorage.setItem("panNumber", response.data.pan_number);
          }
          if (response.data.hr_contact_number) {
            localStorage.setItem(
              "hrContactNumber",
              response.data.hr_contact_number
            );
          }
          if (response.data.linkedin_profile_url) {
            localStorage.setItem(
              "linkedinProfile",
              response.data.linkedin_profile_url
            );
          }
          if (response.data.years_of_experience) {
            localStorage.setItem(
              "yearsOfExperience",
              response.data.years_of_experience
            );
          }

          // Auto redirect to dashboard
          setTimeout(() => {
            onVerified();
          }, 1500);
        }
      }, 3000);
    } catch (error) {
      console.error("Error checking KYC status:", error);
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading verification status...</p>
        </div>
      </div>
    );
  }

  if (kycStatus?.approval_status === "approved") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            KYC Approved!
          </h1>
          <p className="text-gray-600 mb-6">
            Congratulations! Your KYC has been approved. Redirecting to
            dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (kycStatus?.approval_status === "rejected") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">
            KYC Rejected
          </h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-700">
              <strong>Reason:</strong>{" "}
              {kycStatus.rejection_reason ||
                "Please contact support for more details"}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Go Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Clock className="w-8 h-8 text-blue-600 animate-pulse" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">
          KYC Under Review
        </h1>
        <p className="text-gray-600 text-center mb-6">
          Your KYC submission is under review. Verification usually takes 24
          hours.
        </p>

        <div className="space-y-4 mb-6">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-900">
              <strong>Submitted:</strong>{" "}
              {kycStatus?.submission_date
                ? new Date(kycStatus.submission_date).toLocaleDateString()
                : "Today"}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-700">
              We'll notify you as soon as your KYC is verified. You can close
              this tab and come back later.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={checkKycStatus}
            className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Refresh Status
          </button>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>

        <p className="text-xs text-gray-500 text-center mt-4">
          Auto-checking every 5 seconds... (Checked: {checkCount} times)
        </p>
      </div>
    </div>
  );
};

export default RecruiterVerificationPending;
