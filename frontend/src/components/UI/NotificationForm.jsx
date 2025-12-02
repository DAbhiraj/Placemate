import React, { useState } from "react";
import { X, Upload, Mail, FileText, CheckCircle, XCircle } from "lucide-react";
import * as XLSX from "xlsx";

const NotificationForm = ({ isOpen, onClose, onSendNotification }) => {
    const [formData, setFormData] = useState({
        statusUpdate: "",
        companyName: "",
        customMessage: "",
        excelFile: null,
        studentEmails: []
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const statusOptions = [
        { value: "shortlist", label: "Shortlist", color: "bg-blue-100 text-blue-800" },
        { value: "interview_shortlist", label: "Interview Shortlist", color: "bg-yellow-100 text-yellow-800" },
        { value: "selected", label: "Final Selected", color: "bg-green-100 text-green-800" },
        { value: "rejected", label: "Final Rejected", color: "bg-red-100 text-red-800" }
    ];

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (file.type !== "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" &&
            file.type !== "application/vnd.ms-excel") {
            setError("Please upload a valid Excel file (.xlsx or .xls)");
            return;
        }

        setFormData(prev => ({ ...prev, excelFile: file }));
        setError("");

        // Parse Excel file to extract emails
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: "array" });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);

                // Extract emails from the first column or look for email column
                const emails = jsonData
                    .map(row => {
                        // Look for email in common column names
                        const emailValue = row.email || row.Email || row.EMAIL ||
                            row["Email Address"] || row["email address"] ||
                            Object.values(row)[0]; // First column if no email column found
                        return emailValue && typeof emailValue === 'string' && emailValue.includes('@') ? emailValue : null;
                    })
                    .filter(email => email);

                if (emails.length === 0) {
                    setError("No valid email addresses found in the Excel file");
                    return;
                }

                setFormData(prev => ({ ...prev, studentEmails: emails }));
            } catch (err) {
                setError("Error reading Excel file. Please ensure it's a valid Excel file.");
                console.error("Excel parsing error:", err);
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!formData.statusUpdate || !formData.companyName || formData.studentEmails.length === 0) {
            setError("Please fill in all required fields and upload an Excel file with student emails");
            return;
        }

        setIsLoading(true);
        try {
            await onSendNotification(formData);
            setFormData({
                statusUpdate: "",
                companyName: "",
                customMessage: "",
                excelFile: null,
                studentEmails: []
            });
            onClose();
        } catch (err) {
            setError(err.message || "Failed to send notifications");
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case "shortlist":
                return <CheckCircle className="w-4 h-4" />;
            case "interview_shortlist":
                return <FileText className="w-4 h-4" />;
            case "selected":
                return <CheckCircle className="w-4 h-4" />;
            case "rejected":
                return <XCircle className="w-4 h-4" />;
            default:
                return <Mail className="w-4 h-4" />;
        }
    };

    if (!isOpen) return null;

    return (
           <div className="fixed inset-0 bg-white/10 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold flex items-center">
                        <Mail className="w-5 h-5 mr-2 text-blue-600" />
                        Send Notification
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Status Update Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Update Status *
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            {statusOptions.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, statusUpdate: option.value }))}
                                    className={`flex items-center justify-center p-3 border-2 rounded-lg transition-all ${formData.statusUpdate === option.value
                                        ? `border-blue-500 ${option.color}`
                                        : "border-gray-200 hover:border-gray-300"
                                        }`}
                                >
                                    {getStatusIcon(option.value)}
                                    <span className="ml-2 font-medium">{option.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Company Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Company Name *
                        </label>
                        <input
                            type="text"
                            value={formData.companyName}
                            onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter company name"
                            required
                        />
                    </div>

                    {/* Custom Message */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Custom Message (Optional)
                        </label>
                        <textarea
                            value={formData.customMessage}
                            onChange={(e) => setFormData(prev => ({ ...prev, customMessage: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows="3"
                            placeholder="Add a custom message for the notification..."
                        />
                    </div>

                    {/* Excel File Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Student Emails (Excel File) *
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                            <input
                                type="file"
                                accept=".xlsx,.xls"
                                onChange={handleFileUpload}
                                className="hidden"
                                id="excel-upload"
                            />
                            <label
                                htmlFor="excel-upload"
                                className="cursor-pointer flex flex-col items-center"
                            >
                                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                <span className="text-sm text-gray-600">
                                    {formData.excelFile
                                        ? formData.excelFile.name
                                        : "Click to upload Excel file with student emails"
                                    }
                                </span>
                                <span className="text-xs text-gray-500 mt-1">
                                    Supports .xlsx and .xls files
                                </span>
                            </label>
                        </div>
                        {formData.studentEmails.length > 0 && (
                            <div className="mt-3 p-3 bg-green-50 rounded-lg">
                                <p className="text-sm text-green-800 font-medium">
                                    Found {formData.studentEmails.length} email addresses
                                </p>
                                <div className="mt-2 max-h-20 overflow-y-auto">
                                    {formData.studentEmails.slice(0, 5).map((email, index) => (
                                        <span key={index} className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded mr-1 mb-1 inline-block">
                                            {email}
                                        </span>
                                    ))}
                                    {formData.studentEmails.length > 5 && (
                                        <span className="text-xs text-green-700">
                                            ... and {formData.studentEmails.length - 5} more
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-800">{error}</p>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading || !formData.statusUpdate || !formData.companyName || formData.studentEmails.length === 0}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center"
                        >
                            {isLoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Mail className="w-4 h-4 mr-2" />
                                    Send Notifications
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NotificationForm;
