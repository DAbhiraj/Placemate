import { pool } from "../db/db.js";

export const notificationRepository = {
  create: async (userId, title, message, type) => {
    const res = await pool.query(
      `INSERT INTO notifications (id, title, message, type)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [userId, title, message, type]
    );
    return res.rows[0];
  },

  findByUserId: async (userId) => {
    //console.log(userId+" in notification repo");
    const res = await pool.query(
      `SELECT * FROM notifications WHERE id = $1 ORDER BY created_at DESC`,
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
