import { notificationRepository } from "../repo/notificationRepo.js";

export const notificationService = {
  // Send notification to any user
  notifyUser: async (userId, message, type, title = null) => {
    const notificationTitle = title || getDefaultTitle(type);
    return await notificationRepository.create(userId, notificationTitle, message, type);
  },

  // Legacy method - for backward compatibility
  notifyStudent: async (studentId, message, type, title = null) => {
    const notificationTitle = title || getDefaultTitle(type);
    return await notificationRepository.create(studentId, notificationTitle, message, type);
  },

  getUserNotifications: async (userId) => {
    //console.log(userId+" in notification service");
    return await notificationRepository.findByUserId(userId);
  },

  markRead: async (notifId, userId) => {
    await notificationRepository.markAsRead(notifId, userId);
  },

  // Delete notification for a user
  deleteNotification: async (notifId, userId) => {
    await notificationRepository.deleteForUser(notifId, userId);
  },

  // Bulk notifications for assessment/interview updates
  notifyBulkStudents: async (studentIds, message, type, title = null) => {
    const notificationTitle = title || getDefaultTitle(type);
    const promises = studentIds.map(studentId =>
      notificationRepository.create(studentId, notificationTitle, message, type)
    );
    return await Promise.all(promises);
  },

  
  notifyByRole: async (role, message, type, title) => {
    const notificationTitle = title || getDefaultTitle(type);
    return await notificationRepository.createForRole(role, notificationTitle, message, type);
  },

  
  notifyBulkByRole: async (userIds, message, type, title = null) => {
    const notificationTitle = title || getDefaultTitle(type);
    const promises = userIds.map(userId =>
      notificationRepository.create(userId, notificationTitle, message, type)
    );
    return await Promise.all(promises);
  },

  // Notify students about online assessment
  notifyOnlineAssessment: async (studentIds, jobTitle, assessmentDate) => {
    const message = `You have qualified for the online assessment for ${jobTitle}. Assessment date: ${assessmentDate}`;
    return await this.notifyBulkStudents(studentIds, message, 'ONLINE_ASSESSMENT', 'Online Assessment Qualified');
  },

  // Notify students about interview
  notifyInterview: async (studentIds, jobTitle, interviewDate) => {
    const message = `Congratulations! You have been shortlisted for interview for ${jobTitle}. Interview date: ${interviewDate}`;
    return await this.notifyBulkStudents(studentIds, message, 'INTERVIEW_SHORTLISTED', 'Interview Shortlisted');
  },

  // Notify students about selection
  notifySelection: async (studentIds, jobTitle) => {
    const message = `Congratulations! You have been selected for ${jobTitle}. Please check your email for further details.`;
    return await this.notifyBulkStudents(studentIds, message, 'SELECTED', 'Congratulations - Selected!');
  },

  // Notify students about rejection
  notifyRejection: async (studentIds, jobTitle) => {
    const message = `Thank you for applying to ${jobTitle}. Unfortunately, you were not selected this time. Keep applying!`;
    return await this.notifyBulkStudents(studentIds, message, 'REJECTED', 'Application Update');
  }
};

// Helper function to get default titles based on notification type
function getDefaultTitle(type) {
  switch (type) {
    case 'APPLICATION_SUBMITTED':
      return 'Application Submitted';
    case 'APPLICATION_UPDATED':
      return 'Application Updated';
    case 'APPLICATION_STATUS_APPLIED':
      return 'Application Status Update';
    case 'APPLICATION_STATUS_SHORTLISTED':
      return 'Application Shortlisted';
    case 'APPLICATION_STATUS_INTERVIEWED':
      return 'Interview Scheduled';
    case 'APPLICATION_STATUS_SELECTED':
      return 'Congratulations - Selected!';
    case 'APPLICATION_STATUS_REJECTED':
      return 'Application Update';
    case 'ONLINE_ASSESSMENT':
      return 'Online Assessment Qualified';
    case 'INTERVIEW_SHORTLISTED':
      return 'Interview Shortlisted';
    case 'SELECTED':
      return 'Congratulations - Selected!';
    case 'REJECTED':
      return 'Application Update';
    default:
      return 'Notification';
  }
}
