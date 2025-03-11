import { text } from 'express';
import { Schema } from 'mongoose';
/**
 * Mongoose schema for the Notification collection.
 *
 * This schema defines the structure for storing notifications in the database.
 * Each answer includes the following fields:
 * - `text`: The content of the answer.
 * - `ansBy`: The username of the user who provided the answer.
 * - `ansDateTime`: The date and time when the answer was given.
 * - `comments`: Comments that have been added to the answer by users.
 */
const notificationSchema: Schema = new Schema({
  username: {
    type: String,
  },
  text: {
    type: String,
  },
  seen: {
    type: Boolean,
  },
  type: {
    type: String,
    enum: ['post', 'answer', 'follow', 'suggestion'],
  },
});

export default notificationSchema;
