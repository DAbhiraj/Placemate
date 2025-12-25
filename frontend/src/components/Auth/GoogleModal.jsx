import React from "react";
import GoogleSignIn from "./GoogleSignIn";

const GoogleModal = ({setShowGoogleModal,handleGoogleError,handleGoogleSuccess, role, loading, onBegin}) => {
return(
<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
                {/* Loading Overlay */}
                {loading && (
                  <div className="absolute inset-0 bg-white/90 rounded-lg flex flex-col items-center justify-center z-10">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-3"></div>
                    <p className="text-sm text-gray-600">Signing you in...</p>
                  </div>
                )}

                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">{role === "spoc" ? "Coordinator" : "Student"} Sign in</h3>
                  <button
                    onClick={() => setShowGoogleModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                    disabled={loading}
                  >
                    ✕
                  </button>
                </div>
                <p className="text-sm text-gray-600 mb-4">Sign in with your Google account</p>
                <div className="flex justify-center">
                  <GoogleSignIn
                    role={role || "Student"}
                    onBegin={onBegin}
                    onSuccess={(user) => {
                      // Keep modal open to show loading overlay; it'll close on redirect
                      handleGoogleSuccess(user);
                    }}
                    onError={handleGoogleError}
                  />
                </div>
              </div>
            </div>
);
}

export default GoogleModal;