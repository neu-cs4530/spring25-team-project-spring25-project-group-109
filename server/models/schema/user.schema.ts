import { Schema } from 'mongoose';

/**
 * Mongoose schema for the User collection.
 *
 * This schema defines the structure for storing users in the database.
 * Each User includes the following fields:
 * - `username`: The username of the user.
 * - `password`: The encrypted password securing the user's account.
 * - `dateJoined`: The date the user joined the platform.
 */
const userSchema: Schema = new Schema(
  {
    username: {
      type: String,
      unique: true,
      immutable: true,
    },
    password: {
      type: String,
    },
    dateJoined: {
      type: Date,
    },
    biography: {
      type: String,
      default: '',
    },
    profilePhoto: {
      type: String,
      default: '/images/avatars/default-avatar.png',
    },
    badgesEarned: [
      {
        badgeId: { type: Schema.Types.ObjectId, ref: 'Badge', required: true },
        dateEarned: { type: Date, required: true, default: Date.now },
      },
    ],
  },
  { collection: 'User' },
);

export default userSchema;
