import React, { useState, useEffect } from "react";
import { X, Upload, Mail, FileText, AlertCircle, Download } from "lucide-react";
import * as XLSX from "xlsx";

const SpocNotificationModal = ({ isOpen, onClose, onSendNotification, job }) => {
  const [formData, setFormData] = useState({
    notificationType: "general",
    companyName: job?.company || "",
    description: "",
    excelFile: null,
    studentEmails: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Auto-fill company name when job changes
    if (job) {
      setFormData(prev => ({ ...prev, companyName: job.company }));
    }
  }, [job]);

  const notificationTypes = [
    { value: "general", label: "General Notification", color: "bg-blue-100 text-blue-800" },
    { value: "shortlist", label: "Shortlist", color: "bg-green-100 text-green-800" },
    { value: "interview_shortlist", label: "Interview Shortlist", color: "bg-yellow-100 text-yellow-800" },
    { value: "selected", label: "Final Selection", color: "bg-emerald-100 text-emerald-800" }
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

        // Extract emails from the Excel file
        const emails = jsonData
          .map(row => {
            const emailValue = row.email || row.Email || row.EMAIL ||
              row["Email Address"] || row["email address"] ||
              Object.values(row)[0];
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

    if (!formData.notificationType || !formData.companyName || !formData.excelFile) {
      setError("Please fill in all required fields and upload an Excel file");
      return;
    }

    if (formData.studentEmails.length === 0) {
      setError("No valid student emails found in the uploaded file");
      return;
    }

    setIsLoading(true);
    try {
      await onSendNotification(formData);
      setFormData({
        notificationType: "general",
        companyName: job?.company || "",
        description: "",
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

  const downloadExcelTemplate = () => {
    // Create sample Excel template
    const templateData = [
      { email: "student1@example.com" },
      { email: "student2@example.com" },
      { email: "student3@example.com" }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Students");
    XLSX.writeFile(wb, "student_email_template.xlsx");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-600" />
              Notify Students - {job?.title}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Send notifications to students for {job?.company}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Notification Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notification Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {notificationTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, notificationType: type.value }))}
                  className={`px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all ${
                    formData.notificationType === type.value
                      ? `${type.color} border-current`
                      : "bg-white border-gray-200 text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Company Name (Auto-filled) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.companyName}
              readOnly
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">Auto-filled from job details</p>
          </div>

          {/* Excel File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Student Email List <span className="text-red-500">*</span>
            </label>
            <div className="space-y-3">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <label className="cursor-pointer">
                  <span className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                    Click to upload Excel file
                  </span>
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  Excel file with student emails (.xlsx or .xls)
                </p>
              </div>

              {formData.excelFile && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-green-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-900">{formData.excelFile.name}</p>
                    <p className="text-xs text-green-700">{formData.studentEmails.length} email(s) found</p>
                  </div>
                </div>
              )}

              {/* Download Template Button */}
              <button
                type="button"
                onClick={downloadExcelTemplate}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download Excel Template
              </button>

              {/* Excel Format Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs font-medium text-blue-900 mb-1">📋 Required Excel Format:</p>
                <ul className="text-xs text-blue-800 space-y-0.5 ml-4 list-disc">
                  <li>Column header: "email" (or "Email", "EMAIL")</li>
                  <li>Each row should contain one student email address</li>
                  <li>Example: student@student.nitw.ac.in</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Message (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              placeholder="Add any additional information or instructions for students..."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !formData.excelFile || formData.studentEmails.length === 0}
              className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4" />
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

export default SpocNotificationModal;
