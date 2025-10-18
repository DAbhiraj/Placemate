import { notificationRepository } from "../repo/notificationRepo.js";

export const notificationService = {
  notifyStudent: async (studentId, message, type) => {
    return await notificationRepository.create(studentId, message, type);
  },

  getUserNotifications: async (studentId) => {
    return await notificationRepository.findByUserId(studentId);
  },

  markRead: async (notifId) => {
    await notificationRepository.markAsRead(notifId);
  },
};
