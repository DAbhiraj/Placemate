import React from "react";
import { Loader2 } from "lucide-react";

const Loader = ({ text = "Loading..." }) => (
  <div className="flex flex-col items-center justify-center py-10">
    <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-2" />
    <span className="text-blue-700 font-medium text-lg">{text}</span>
  </div>
);

export default Loader;
