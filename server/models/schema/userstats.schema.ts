import { Schema } from 'mongoose';

/**
 * Mongoose schema for tracking user statistics.
 *
 * This schema defines the structure for storing various user activity metrics
 * in the database. Each record includes the following fields:
 * - `userId`: Reference to the corresponding User document.
 * - `questionsCount`: Number of questions posted by the user.
 * - `commentsCount`: Number of comments made by the user.
 * - `answersCount`: Number of answers provided by the user.
 * - `nimWinCount`: Number of Nim game wins achieved by the user.
 */
const userStatsSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    questionsCount: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
    answersCount: { type: Number, default: 0 },
    nimWinCount: { type: Number, default: 0 },
  },
  { collection: 'UserStats' },
);

export default userStatsSchema;
