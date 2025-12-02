import { pool } from "../db/db.js";

export const notificationRepository = {
  create: async (userId, title, message, type) => {
    const res = await pool.query(
      `INSERT INTO notifications (user_id, title, message, type)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [userId, title, message, type]
    );
    return res.rows[0];
  },

  findByUserId: async (userId) => {
    //console.log(userId+" in notification repo");
    const res = await pool.query(
      `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );
    return res.rows;
  },

  markAsRead: async (notificationId) => {
    
    await pool.query(
      `UPDATE notifications SET is_read = true WHERE notification_id = $1`,
      [notificationId]
    );
  },

  // Create notifications for all users with a specific role
  createForRole: async (role, title, message, type) => {
    const res = await pool.query(
      `INSERT INTO notifications (id, title, message, type)
       SELECT user_id, $1, $2, $3
       FROM users
       WHERE role = $4
       RETURNING *`,
      [title, message, type, role]
    );
    return res.rows;
  },

  // Get notifications by role
  findByRole: async (role) => {
    const res = await pool.query(
      `SELECT n.*, u.name as user_name, u.email 
       FROM notifications n
       JOIN users u ON n.user_id = u.user_id
       WHERE u.role = $1 
       ORDER BY n.created_at DESC`,
      [role]
    );
    return res.rows;
  },

  // Get unread notifications count for a user
  getUnreadCount: async (userId) => {
    const res = await pool.query(
      `SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND is_read = false`,
      [userId]
    );
    return res.rows[0].count;
  },

  // Get all notifications (for admins)
  findAll: async () => {
    const res = await pool.query(
      `SELECT n.*, u.name as user_name, u.role as user_role, u.email
       FROM notifications n
       JOIN users u ON n.user_id = u.user_id
       ORDER BY n.created_at DESC`
    );
    return res.rows;
  },
  
};
