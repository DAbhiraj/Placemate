import { notificationService } from "../services/notificationService.js";

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

    // Mark notification as read
    async markNotificationAsRead(req, res) {
        try {
            const { notificationId } = req.params;
            await notificationService.markRead(notificationId);
            res.json({ message: "Notification marked as read" });
        } catch (err) {
            console.error("Error marking notification as read:", err);
            res.status(500).json({ message: "Failed to mark notification as read" });
        }
    }
};
