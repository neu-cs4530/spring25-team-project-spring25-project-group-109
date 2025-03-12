import { Request } from 'express';
import { ObjectId } from 'mongodb';

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
  type: 'post' | 'answer' | 'follow' | 'suggestion';
}

/**
 * Represents an notification stored in the database.
 * - `_id`: The unique identifier of the notifcation.
 * - `comments`: A list of ObjectId references to the comments related to the answer.
 */
export interface DatabaseNotification extends Notification {
  _id: ObjectId;
}

/**
 * Interface extending the request body for adding a notification to a question.
 * - `qid`: The unique identifier of the question being answered.
 * - `ans`: The answer being added.
 */
export interface AddNotificationRequest extends Request {
  body: {
    qid: string;
    Notification: Notifcation;
  };
}

/**
 * Type representing possible responses for an Notification-related operation.
 * - Either a `DatabaseNotification` object or an error message.
 */
export type NotifcationResponse = DatabaseNotification | { error: string };
