import { Request } from 'express';
import { ObjectId } from 'mongodb';

export type NotificationType = 'badge' | 'answer' | 'follow' | 'comment';

/**
 * Represents a nofication.
 * - `username`: The username of the user who received the notification.
 * - `text`: The notification text.
 * - `seen`: Indicator if the notification has been seen or not.
 * - `type`: The notification type.
 */
export interface Notification {
  username: string;
  text: string;
  seen: boolean;
  type: NotificationType;
}

/**
 * Represents an notification stored in the database.
 * - `_id`: The unique identifier of the notifcation.
 * - `comments`: A list of ObjectId references to the comments related to the answer.
 */
export interface DatabaseNotification extends Notification {
  _id: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interface extending the request body for creating a new notification.
 * - `body`: The notification being created.
 */
export interface CreateNotificationRequest extends Request {
  body: Notification;
}

/**
 * Express request for fetching notifications based on the user's username.
 * - `params`: contains the `username` of the user to look up the notifications.
 */
export interface GetNotificationsForUserRequest extends Request {
  params: {
    username: string;
  };
}

/**
 * Type representing possible responses for an Notification-related operation.
 * - Either a `DatabaseNotification` object or an error message.
 */
export type NotificationResponse = DatabaseNotification | { error: string };

/**
 * Type representing possible responses for a multiple-Notification-related operation.
 * - Either a list of `DatabaseNotification` objects or an error message.
 */
export type NotificationsResponse = DatabaseNotification[] | { error: string };
