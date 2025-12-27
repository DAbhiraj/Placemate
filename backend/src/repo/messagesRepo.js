import { pool } from "../db/db.js";

export const messagesRepository = {
  async getOrCreateConversation(spocId, jobId) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      // Find recruiter for job
      const jobRes = await client.query(
        "SELECT recruiter_id FROM jobs WHERE job_id = $1",
        [jobId]
      );
      if (jobRes.rows.length === 0) {
        throw new Error("Job not found");
      }
      const recruiterId = jobRes.rows[0].recruiter_id;
      if (!recruiterId) {
        throw new Error("Recruiter not associated with job");
      }

      // Upsert conversation
      const convRes = await client.query(
        `INSERT INTO conversations (job_id, spoc_id, recruiter_id)
         VALUES ($1, $2, $3)
         ON CONFLICT (job_id, spoc_id) DO UPDATE SET updated_at = CURRENT_TIMESTAMP
         RETURNING *`,
        [jobId, spocId, recruiterId]
      );
      await client.query("COMMIT");
      return convRes.rows[0];
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  },

  async listSpocConversations(userId) {
    const res = await pool.query(
      `SELECT c.conversation_id,
              c.job_id,
              c.spoc_id,
              c.recruiter_id,
              c.created_at,
              c.updated_at,
              j.company_name,
              j.role as job_role,
              spoc.name as spoc_name,
              spoc.email as spoc_email,
              recruiter.name as recruiter_name,
              recruiter.email as recruiter_email,
              CASE WHEN c.spoc_id = $1 THEN recruiter.name ELSE spoc.name END as participant_name,
              CASE WHEN c.spoc_id = $1 THEN recruiter.email ELSE spoc.email END as participant_email,
              CASE WHEN c.spoc_id = $1 THEN 'recruiter' ELSE 'spoc' END as participant_role,
              COALESCE(SUM(CASE WHEN m.recipient_id = $1 AND m.is_read = FALSE THEN 1 ELSE 0 END), 0) as unread_count,
              MAX(m.created_at) as last_message_at,
              MAX(m.content) FILTER (
                WHERE m.created_at = (
                  SELECT MAX(created_at) FROM conversation_messages WHERE conversation_id = c.conversation_id
                )
              ) as last_message
       FROM conversations c
       JOIN jobs j ON j.job_id = c.job_id
       LEFT JOIN users spoc ON spoc.user_id = c.spoc_id
       LEFT JOIN users recruiter ON recruiter.user_id = c.recruiter_id
       LEFT JOIN conversation_messages m ON m.conversation_id = c.conversation_id
       WHERE c.spoc_id = $1 OR c.recruiter_id = $1
       GROUP BY c.conversation_id, c.job_id, c.recruiter_id, c.spoc_id, c.created_at, c.updated_at, j.company_name, j.role, spoc.name, spoc.email, recruiter.name, recruiter.email
       ORDER BY last_message_at DESC NULLS LAST, c.updated_at DESC`,
      [userId]
    );
    return res.rows;
  },

  async getMessages(conversationId, limit = 50, before = null) {
    let query = `SELECT message_id, sender_id, recipient_id, content, is_read, created_at
                 FROM conversation_messages
                 WHERE conversation_id = $1`;
    const params = [conversationId];
    if (before) {
      query += " AND created_at < $2";
      params.push(before);
    }
    query += " ORDER BY created_at DESC LIMIT $" + (params.length + 1);
    params.push(limit);
    const res = await pool.query(query, params);
    // return newest last
    return res.rows.reverse();
  },

  async addMessage(conversationId, senderId, recipientId, content) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const insertRes = await client.query(
        `INSERT INTO conversation_messages (conversation_id, sender_id, recipient_id, content)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [conversationId, senderId, recipientId, content]
      );

      await client.query(
        `UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE conversation_id = $1`,
        [conversationId]
      );

      await client.query("COMMIT");
      return insertRes.rows[0];
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  },

  async markRead(conversationId, recipientId) {
    const res = await pool.query(
      `UPDATE conversation_messages SET is_read = TRUE
       WHERE conversation_id = $1 AND recipient_id = $2 AND is_read = FALSE`,
      [conversationId, recipientId]
    );
    return { updated: res.rowCount };
  }
};
