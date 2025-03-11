import { Request } from 'express';
import { ObjectId } from 'mongodb';

/**
 * Represents an answer to a question.
 * - `text`: The answer text.
 * - `ansBy`: The author of the answer.
 * - `ansDateTime`: The timestamp of when the answer was given.
 * - `comments`: A list of comments associated with the answer.
 */
export interface Notification {
  username: string;
  text: string;
  seen: boolean;
  type: 'post' | 'answer' | 'follow' | 'suggestion';
}

/**
 * Represents an answer stored in the database.
 * - `_id`: The unique identifier of the answer.
 * - `comments`: A list of ObjectId references to the comments related to the answer.
 */
export interface DatabaseNotification extends Notification {
  _id: ObjectId;
}

/**
 * Interface extending the request body for adding an answer to a question.
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
 * Type representing possible responses for an Answer-related operation.
 * - Either a `DatabaseAnswer` object or an error message.
 */
export type NotifcationResponse = DatabaseNotification | { error: string };
