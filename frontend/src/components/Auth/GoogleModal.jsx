import React from "react";
import GoogleSignIn from "./GoogleSignIn";

const GoogleModal = ({setShowGoogleModal,handleGoogleError,handleGoogleSuccess, role}) => {
return(
<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">{role === "spoc" ? "Coordinator" : "Student"} Sign in</h3>
                  <button onClick={() => setShowGoogleModal(false)} className="text-gray-500 hover:text-gray-700">✕</button>
                </div>
                <p className="text-sm text-gray-600 mb-4">Sign in with your Google account</p>
                <div className="flex justify-center">
                  <GoogleSignIn role={role || "Student"} onSuccess={(user) => { setShowGoogleModal(false); handleGoogleSuccess(user); }} onError={handleGoogleError} />
                </div>
              </div>
            </div>
);
}

export default GoogleModal;