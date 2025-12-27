import { messagesRepository } from "../repo/messagesRepo.js";
import { spocRepository } from "../repo/spocRepo.js";

export const messagesService = {
  async ensureConversation(user, jobId) {
    const roles = user.roles || [];
    const isSpoc = roles.includes("spoc");
    const isRecruiter = roles.includes("recruiter");

    if (isSpoc) {
      return messagesRepository.getOrCreateConversation(user.id, jobId);
    }

    if (isRecruiter) {
      const spocId = await spocRepository.getSpocAssignmentByJob(jobId);
      if (!spocId) {
        throw new Error("No SPOC assigned to this job");
      }
      return messagesRepository.getOrCreateConversation(spocId, jobId);
    }

    throw new Error("Unauthorized to open this conversation");
  },

  async listConversations(user) {
    return messagesRepository.listSpocConversations(user.id);
  },

  async getThread(conversationId, userId, limit, before) {
    const messages = await messagesRepository.getMessages(conversationId, limit, before);
    // Mark messages addressed to this user as read
    await messagesRepository.markRead(conversationId, userId);
    return messages;
  },

  async sendMessage(conversationId, senderId, content) {
    // Find conversation participants to set recipient
    // Minimal query: we can infer recipient by comparing sender to spoc_id/recruiter_id
    const { rows } = await import("../db/db.js").then(({ pool }) => pool.query(
      "SELECT spoc_id, recruiter_id FROM conversations WHERE conversation_id = $1",
      [conversationId]
    ));
    if (rows.length === 0) throw new Error("Conversation not found");
    const { spoc_id, recruiter_id } = rows[0];
    const recipientId = senderId === spoc_id ? recruiter_id : spoc_id;
    return messagesRepository.addMessage(conversationId, senderId, recipientId, content);
  }
};
