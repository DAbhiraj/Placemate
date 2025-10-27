# Role-Based Notifications Implementation

## Overview
This document describes the implementation of role-based notifications for Students, Faculty, and Placement Coordinators in the Placemate system.

## What Was Implemented

### Backend Changes

#### 1. Enhanced User Registration (authcontroller.js)
- Added support for three role types:
  - `Student` (default)
  - `Admin`
  - `Faculty`
  - `Placement Coordinator`
- Role is now stored in the database and used throughout the system

#### 2. Enhanced Notification Service (notificationService.js)
- Added `notifyUser()` method for sending notifications to any user
- Added `notifyByRole()` method to send notifications to all users with a specific role
- Added `notifyBulkByRole()` for bulk role-based notifications
- Maintained backward compatibility with existing student notification methods

#### 3. Enhanced Notification Repository (notificationRepo.js)
- Added `createForRole()` - Creates notifications for all users with a specific role
- Added `findByRole()` - Retrieves notifications for a specific role
- Added `getUnreadCount()` - Gets count of unread notifications for a user
- Added `findAll()` - Retrieves all notifications (for admins)

#### 4. Enhanced Notification Controller (notificationController.js)
- `getUserNotifications()` - Get notifications for a specific user
- `getUnreadCount()` - Get unread notification count for a user
- `markNotificationAsRead()` - Mark a notification as read
- `getNotificationsByRole()` - Get notifications for a specific role
- `sendNotificationByRole()` - Send notifications to users by role
- `getAllNotifications()` - Get all notifications (admin only)

#### 5. Enhanced Admin Controller (adminController.js)
- Added `sendNotificationToRoles()` method
- Allows admins to send notifications to multiple roles at once
- Accepts an array of roles (Student, Faculty, Placement Coordinator, Admin)

#### 6. Updated Routes (routes.js)
- Added new notification endpoints:
  - `GET /notifications/:userId/unread` - Get unread count
  - `GET /notifications/role/:role` - Get notifications by role
  - `POST /notifications/send-by-role` - Send notifications to a role
  - `GET /notifications/all` - Get all notifications
  - `POST /admin/send-notification-roles` - Admin endpoint for role-based notifications

### Frontend Changes

#### 1. Updated Registration (NormalLogin.jsx)
- Added "Faculty" and "Placement Coordinator" to role selection dropdown
- Users can now register with these new roles

#### 2. Created Role-Based Notification Form (RoleBasedNotificationForm.jsx)
- New component for admins to send notifications to specific roles
- Features:
  - Role selection (Student, Faculty, Placement Coordinator, Admin)
  - Notification title and message
  - Notification type selection (General, Announcement, Deadline, Update, Reminder)
  - Multi-role support
  - Visual indicators for different roles

#### 3. Enhanced Admin Panel (Admin.jsx)
- Added role-based notification functionality
- New button in quick actions: "Role-Based Notification"
- Integrated `RoleBasedNotificationForm` component
- Added `handleSendRoleBasedNotification()` handler

#### 4. Updated Navbar (Navbar.jsx)
- Notifications now work for all user roles (not just students)
- Different navigation items for different roles:
  - **Students**: Dashboard, Upcoming Deadlines, Jobs, My Applications, Alumni Stories
  - **Faculty/Placement Coordinator**: Dashboard, Job Opportunities, Alumni Stories
  - **Admins**: Admin Panel
- Notification bell shows for all authenticated users

## How It Works

### For Students:
- Students receive notifications about their applications, interviews, deadlines, etc.
- Notifications appear in the notification bell in the navbar
- Students can view and mark notifications as read

### For Faculty:
- Faculty members can receive notifications about:
  - New job postings
  - Student placement statistics
  - Important announcements
  - Upcoming deadlines for student opportunities
- Faculty can access notifications through the navbar notification bell

### For Placement Coordinators:
- Placement Coordinators receive notifications about:
  - New company registrations
  - Student placement activities
  - Application statistics
  - Important policy updates
- Placement Coordinators can access notifications through the navbar notification bell

### For Admins:
- Admins can:
  - View all notifications in the system
  - Send notifications to specific roles (Students, Faculty, Placement Coordinators, or multiple roles)
  - Send bulk student notifications via Excel upload
  - Access notification statistics

## API Endpoints

### User Endpoints
```
GET    /api/notifications/:userId              - Get notifications for a user
GET    /api/notifications/:userId/unread     - Get unread count
PUT    /api/notifications/:notificationId/read - Mark notification as read
```

### Role-Based Endpoints
```
GET    /api/notifications/role/:role          - Get notifications by role
POST   /api/notifications/send-by-role       - Send notification to a role
GET    /api/notifications/all                 - Get all notifications (admin only)
```

### Admin Endpoints
```
POST   /api/admin/send-notification           - Send notifications to students via Excel
POST   /api/admin/send-notification-roles    - Send notifications to specific roles
```

## Usage Examples

### Sending Notifications to a Role
```javascript
// Backend
const response = await axios.post(`${API_URL}/admin/send-notification-roles`, {
  message: "New placement policy announced",
  title: "Important Announcement",
  type: "ANNOUNCEMENT",
  roles: ["Faculty", "Placement Coordinator"]
});
```

### Getting Notifications for a User
```javascript
// Frontend
const response = await axios.get(`${API_URL}/notifications/${userId}`);
const notifications = response.data;
```

### Getting Unread Count
```javascript
const response = await axios.get(`${API_URL}/notifications/${userId}/unread`);
const count = response.data.count;
```

## Database Schema

The notifications table structure:
```sql
CREATE TABLE notifications (
    notification_id SERIAL PRIMARY KEY,
    id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
    message TEXT,
    type TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    title TEXT
);
```

## Security Considerations

1. **Role-based Access Control**: Notifications are filtered by user role
2. **Authentication Required**: All notification endpoints require authentication
3. **User Isolation**: Users can only see their own notifications (unless they're admins)
4. **Input Validation**: All notification inputs are validated on both client and server

## Testing Recommendations

1. **Test Student Notifications**: Register as a student and verify notifications appear
2. **Test Faculty Notifications**: Register as faculty and send a notification to faculty role
3. **Test Placement Coordinator Notifications**: Register as a placement coordinator and verify notification delivery
4. **Test Admin Functionality**: Verify admins can send notifications to all roles
5. **Test Role-Based Filtering**: Verify users only see notifications meant for their role

## Future Enhancements

1. **Email Notifications**: Send email when critical notifications are created
2. **Push Notifications**: Implement browser push notifications
3. **Notification Preferences**: Allow users to set notification preferences
4. **Notification Groups**: Create notification groups for easier management
5. **Rich Notifications**: Support for images and links in notifications
6. **Notification History**: Archive and search through notification history

## Files Modified

### Backend
- `backend/src/controllers/authcontroller.js`
- `backend/src/services/notificationService.js`
- `backend/src/repo/notificationRepo.js`
- `backend/src/controllers/notificationController.js`
- `backend/src/controllers/adminController.js`
- `backend/src/routes.js`

### Frontend
- `frontend/src/pages/NormalLogin.jsx`
- `frontend/src/pages/Admin.jsx`
- `frontend/src/components/Layout/Navbar.jsx`
- `frontend/src/components/UI/RoleBasedNotificationForm.jsx` (new file)

## Notes

- All existing student notification functionality remains intact
- The implementation is backward compatible with existing code
- No database migrations are required if the schema is already in place
- The role field in the Users table supports the new roles: "Student", "Admin", "Faculty", "Placement Coordinator"
