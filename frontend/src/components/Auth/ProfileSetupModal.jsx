import React, { useState } from "react";
import { X, Loader2 } from "lucide-react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setUser } from "../../store/slices/userSlice";

const ProfileSetupModal = ({ isOpen, onClose, onParsed }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const dispatch = useDispatch();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setUploadError("");
  };

  const handleUpload = async () => {
    if (!file) {
      setUploadError("Please select a file first");
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);
    formData.append("userId", localStorage.getItem("id"));

    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:4000/api/parse-resume",
        
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials : true,
        }
      );

      console.log("Parsed Resume success :", response);

      if(response.status === 200 && response.data?.body) {
        const user = response.data.body;
        // Store relevant fields in localStorage
        if (user.branch) localStorage.setItem('branch', user.branch);
        if (user.name) localStorage.setItem('name', user.name);
        if (user.cgpa !== undefined && user.cgpa !== null && user.cgpa !== "") localStorage.setItem('cgpa', String(user.cgpa));
        if (user.email) localStorage.setItem('email', user.email);
        if (user.roll_no) localStorage.setItem('roll_no', user.roll_no);
        if (user.application_type) localStorage.setItem('application_type',user.application_type);

        // Update Redux user state
        dispatch(setUser({
          ...user,
          branch: user.branch || "",
          name: user.name || "",
          cgpa: user.cgpa || 0,
          email: user.email || "",
          roll_no: user.roll_no || "",
          skills: user.skills || [],
          application_type : user.application_type || "fte"
        }));

        onClose(); // close modal after success
        window.location.href = "/profile";
      }

    } catch (error) {
      console.error("Upload Error:", error);
      setUploadError("Failed to upload. Try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
     <div className="fixed inset-0 bg-white/10 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="p-6">

          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Upload Resume</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>

          <p className="text-gray-600 mb-4">
            Upload your resume to auto-fill your profile details.
          </p>

          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
            className="w-full border p-2 rounded-lg"
          />

          {uploadError && <p className="text-red-500 text-sm mt-2">{uploadError}</p>}

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg font-medium flex items-center"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Upload Resume"
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProfileSetupModal;
