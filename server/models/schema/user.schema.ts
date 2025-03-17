import { Schema } from 'mongoose';

/**
 * Mongoose schema for the User collection.
 *
 * This schema defines the structure for storing users in the database.
 * Each User includes the following fields:
 * - `username`: The username of the user.
 * - `password`: The encrypted password securing the user's account.
 * - `dateJoined`: The date the user joined the platform.
 * - `biography`: The biography of the user.
 * - `profilePhoto`: A path to the URL of the profile photo of the user.
 * - `badgesEarned`: A list of ids referencing the badges the user has earned and their dates.
 * - `following`: A list of usernames representing the users this user is following.
 * - `followers`: A list of usernames representing the users that follow this user.
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
    following: [{ type: String, required: true }], // the strings are usernames
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
    following: [{ type: String, required: true, default: [] }],
    followers: [{ type: String, required: true, default: [] }],
  },
  { collection: 'User' },
);

export default userSchema;
