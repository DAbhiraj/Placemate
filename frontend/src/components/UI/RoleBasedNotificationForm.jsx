import React, { useState } from "react";
import { X, Bell, Users, UserCheck } from "lucide-react";

const RoleBasedNotificationForm = ({ isOpen, onClose, onSendNotification }) => {
    const [formData, setFormData] = useState({
        message: "",
        title: "",
        type: "GENERAL",
        selectedRoles: []
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const availableRoles = [
        { value: "Student", label: "Students" },
        { value: "Faculty", label: "Faculty" },
        { value: "placement_coordinator", label: "Placement Coordinators" },
    ];

    const notificationTypes = [
        { value: "GENERAL", label: "General" },
    ];

    const toggleRole = (role) => {
        setFormData(prev => ({
            ...prev,
            selectedRoles: prev.selectedRoles.includes(role)
                ? prev.selectedRoles.filter(r => r !== role)
                : [...prev.selectedRoles, role]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!formData.message || formData.selectedRoles.length === 0) {
            setError("Please fill in all required fields and select at least one role");
            return;
        }

        setIsLoading(true);
        try {
            await onSendNotification(formData);
            setFormData({
                message: "",
                title: "",
                type: "GENERAL",
                selectedRoles: []
            });
            onClose();
        } catch (err) {
            setError(err.message || "Failed to send notifications");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold flex items-center">
                        <Bell className="w-5 h-5 mr-2 text-blue-600" />
                        Send Role-Based Notification
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Target Roles */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Select Target Roles *
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            {availableRoles.map((role) => (
                                <button
                                    key={role.value}
                                    type="button"
                                    onClick={() => toggleRole(role.value)}
                                    className={`flex items-center p-3 border-2 rounded-lg transition-all ${
                                        formData.selectedRoles.includes(role.value)
                                            ? "border-blue-500 bg-blue-50"
                                            : "border-gray-200 hover:border-gray-300"
                                    }`}
                                >
                                    {role.value === "Faculty" ? (
                                        <UserCheck className="w-5 h-5 mr-2 text-blue-600" />
                                    ) : role.value === "placement_coordinator" ? (
                                        <Users className="w-5 h-5 mr-2 text-purple-600" />
                                    ) : role.value === "Admin" ? (
                                        <Users className="w-5 h-5 mr-2 text-green-600" />
                                    ) : (
                                        <Users className="w-5 h-5 mr-2 text-gray-600" />
                                    )}
                                    <span className="font-medium">{role.label}</span>
                                </button>
                            ))}
                        </div>
                        {formData.selectedRoles.length > 0 && (
                            <p className="mt-2 text-sm text-blue-600">
                                Selected: {formData.selectedRoles.join(", ")}
                            </p>
                        )}
                    </div>

                    {/* Notification Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Notification Title*
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter notification title"
                            required
                        />
                    </div>

                    {/* Notification Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Notification Type
                        </label>
                        <select
                            value={formData.type}
                            onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            {notificationTypes.map((type) => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Message */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Message
                        </label>
                        <textarea
                            value={formData.message}
                            onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows="4"
                            placeholder="Enter your notification message..."
                        />
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
                            disabled={isLoading || !formData.title || formData.selectedRoles.length === 0}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center"
                        >
                            {isLoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Bell className="w-4 h-4 mr-2" />
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

export default RoleBasedNotificationForm;
