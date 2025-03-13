import { Schema } from 'mongoose';
/**
 * Mongoose schema for the Notification collection.
 *
 * This schema defines the structure for storing notifications in the database.
 * Each notification includes the following fields:
 * - `username`: The username of the user who received the notification.
 * - `text`: The notification text.
 * - `seen`: Indicator if the notification has been seen or not.
 * - `type`: The notification type.

 */
const notificationSchema: Schema = new Schema({
  username: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  seen: {
    type: Boolean,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['badge', 'answer', 'follow', 'comment'],
  },
});

export default notificationSchema;
