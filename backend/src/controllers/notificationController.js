import { notificationService } from "../services/notificationService.js";
import { notificationRepository } from "../repo/notificationRepo.js";

export const notificationController = {
    // Get notifications for a user
    async getUserNotifications(req, res) {
        try {
            const { userId } = req.params;
            //console.log(userId+" in notification controller");
            const notifications = await notificationService.getUserNotifications(userId);
            res.json(notifications);
        } catch (err) {
            console.error("Error fetching notifications:", err);
            res.status(500).json({ message: "Failed to fetch notifications" });
        }
    },

    // Get notifications count for a user
    async getUnreadCount(req, res) {
        try {
            const { userId } = req.params;
            const count = await notificationRepository.getUnreadCount(userId);
            res.json({ count });
        } catch (err) {
            console.error("Error fetching unread count:", err);
            res.status(500).json({ message: "Failed to fetch unread count" });
        }
    },

    // Mark notification as read
    async markNotificationAsRead(req, res) {
        try {
            console.log("in mark notification controller");
            const { notificationId } = req.params;
            console.log(notificationId);
            await notificationService.markRead(notificationId);
            res.json({ message: "Notification marked as read" });
        } catch (err) {
            console.error("Error marking notification as read:", err);
            res.status(500).json({ message: "Failed to mark notification as read" });
        }
    },

  
    async getNotificationsByRole(req, res) {
        try {
            const { role } = req.params;
            const notifications = await notificationRepository.findByRole(role);
            res.json(notifications);
        } catch (err) {
            console.error("Error fetching notifications by role:", err);
            res.status(500).json({ message: "Failed to fetch notifications by role" });
        }
    },


    async sendNotificationByRole(req, res) {
        try {
            const { role, message, type, title } = req.body;
            
            if (!role || !message) {
                return res.status(400).json({ message: "Role and message are required" });
            }

            const notifications = await notificationService.notifyByRole(role, message, type, title);
            res.json({
                message: "Notifications sent successfully",
                notificationsSent: notifications.length
            });
        } catch (err) {
            console.error("Error sending notifications by role:", err);
            res.status(500).json({ message: "Failed to send notifications by role" });
        }
    },

    // Get all notifications (admin only)
    async getAllNotifications(req, res) {
        try {
            const notifications = await notificationRepository.findAll();
            res.json(notifications);
        } catch (err) {
            console.error("Error fetching all notifications:", err);
            res.status(500).json({ message: "Failed to fetch all notifications" });
        }
    }
};
