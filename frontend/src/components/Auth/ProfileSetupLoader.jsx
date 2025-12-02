import React from "react";
import Loader from "../Loader";

const ProfileSetupLoader = () => (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
    <Loader text="Setting up your profile..." />
  </div>
);

export default ProfileSetupLoader;
