import { messagesService } from "../services/messagesService.js";

export const messagesController = {
  async listConversations(req, res) {
    try {
      const conversations = await messagesService.listConversations(req.user);
      res.json({ conversations });
    } catch (err) {
      console.error("List conversations error:", err.message);
      res.status(500).json({ message: "Failed to load conversations" });
    }
  },

  async ensureConversation(req, res) {
    try {
      const { jobId } = req.params;
      const conv = await messagesService.ensureConversation(req.user, Number(jobId));
      res.status(201).json(conv);
    } catch (err) {
      console.error("Ensure conversation error:", err.message);
      res.status(400).json({ message: err.message || "Failed to create conversation" });
    }
  },

  async getMessages(req, res) {
    try {
      const userId = req.user.id;
      const { conversationId } = req.params;
      const { limit, before } = req.query;
      const msgs = await messagesService.getThread(Number(conversationId), userId, Number(limit) || 50, before || null);
      res.json({ messages: msgs });
    } catch (err) {
      console.error("Get messages error:", err.message);
      res.status(400).json({ message: "Failed to load messages" });
    }
  },

  async sendMessage(req, res) {
    try {
      const senderId = req.user.id;
      const { conversationId } = req.params;
      const { content } = req.body;
      if (!content || typeof content !== "string" || content.trim().length === 0) {
        return res.status(400).json({ message: "Message content is required" });
      }
      if (content.length > 2000) {
        return res.status(400).json({ message: "Message content too long" });
      }
      const msg = await messagesService.sendMessage(Number(conversationId), senderId, content.trim());
      res.status(201).json(msg);
    } catch (err) {
      console.error("Send message error:", err.message);
      res.status(400).json({ message: "Failed to send message" });
    }
  }
};
