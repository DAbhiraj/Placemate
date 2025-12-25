import { pool } from "../db/db.js";

export const notificationRepository = {
  create: async (userId, title, message, type, senderId = null, targetRole = null) => {
    const notificationRes = await pool.query(
      `INSERT INTO notifications (sender_id, title, message, type, target_role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [senderId, title, message, type, targetRole]
    );

    const notification = notificationRes.rows[0];

    await pool.query(
      `INSERT INTO user_notification_status (user_id, notification_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, notification_id) DO NOTHING`,
      [userId, notification.notification_id]
    );

    return notification;
  },

  findByUserId: async (userId) => {
    const res = await pool.query(
      `SELECT n.*, uns.is_read, uns.read_at
       FROM notifications n
       JOIN user_notification_status uns ON n.notification_id = uns.notification_id
       WHERE uns.user_id = $1
       ORDER BY n.created_at DESC`,
      [userId]
    );

    console.log(res.rows)
    return res.rows;
  },

  markAsRead: async (notificationId, userId) => {
    await pool.query(
      `UPDATE user_notification_status 
       SET is_read = true, read_at = CURRENT_TIMESTAMP
       WHERE notification_id = $1 AND user_id = $2`,
      [notificationId, userId]
    );
  },

  // Create notifications for all users with a specific role
  createForRole: async (role, title, message, type, senderId = null) => {
    // Map frontend role names to backend role names
    const roleMapping = {
      'placement-coordinators': 'spoc',
      'students': 'Student',
      'recruiters': 'recruiter',
      'admin': 'admin'
    };

    const actualRole = roleMapping[role.toLowerCase()] || role;

    const res = await pool.query(
      `WITH notification_row AS (
          INSERT INTO notifications (sender_id, title, message, type, target_role)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING notification_id
        ),
        inserted AS (
          INSERT INTO user_notification_status (user_id, notification_id)
          SELECT u.user_id, nr.notification_id
          FROM notification_row nr
          JOIN users u ON (
            LOWER(u.role) = LOWER($6) OR
            ($6 = ANY(u.roles))
          )
          ON CONFLICT (user_id, notification_id) DO NOTHING
          RETURNING user_id, notification_id
        )
      SELECT * FROM inserted`,
      [senderId, title, message, type, actualRole, actualRole]
    );

    return res.rows;
  },

  // Get notifications by role
  findByRole: async (role) => {
    const res = await pool.query(
      `SELECT n.*, u.name as user_name, u.email, uns.user_id, uns.is_read, uns.read_at
       FROM notifications n
       JOIN user_notification_status uns ON n.notification_id = uns.notification_id
       JOIN users u ON uns.user_id = u.user_id
       WHERE LOWER(u.role) = LOWER($1)
       ORDER BY n.created_at DESC`,
      [role]
    );
    return res.rows;
  },

  // Get unread notifications count for a user
  getUnreadCount: async (userId) => {
    const res = await pool.query(
      `SELECT COUNT(*) as count 
       FROM user_notification_status 
       WHERE user_id = $1 AND is_read = false`,
      [userId]
    );
    return res.rows[0].count;
  },

  // Get all notifications (for admins)
  findAll: async () => {
    const res = await pool.query(
      `SELECT n.*, u.name as user_name, u.role as user_role, u.email, uns.user_id, uns.is_read, uns.read_at
       FROM notifications n
       JOIN user_notification_status uns ON n.notification_id = uns.notification_id
       JOIN users u ON uns.user_id = u.user_id
       ORDER BY n.created_at DESC`
    );
    return res.rows;
  },

  // Delete notification status for a specific user
  deleteForUser: async (notificationId, userId) => {
    await pool.query(
      `DELETE FROM user_notification_status 
       WHERE notification_id = $1 AND user_id = $2`,
      [notificationId, userId]
    );
  },
  
};
