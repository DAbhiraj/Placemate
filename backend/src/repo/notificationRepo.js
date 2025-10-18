import { pool } from "../db/db.js";

export const notificationRepository = {
  create: async (userId, message, type) => {
    const res = await pool.query(
      `INSERT INTO notifications (user_id, message, type)
       VALUES ($1, $2, $3) RETURNING *`,
      [userId, message, type]
    );
    return res.rows[0];
  },

  findByUserId: async (userId) => {
    const res = await pool.query(
      `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );
    return res.rows;
  },

  markAsRead: async (notifId) => {
    await pool.query(
      `UPDATE notifications SET is_read = true WHERE id = $1`,
      [notifId]
    );
  },
};
