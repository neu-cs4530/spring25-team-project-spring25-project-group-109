import { Schema } from 'mongoose';

/**
 * Mongoose schema for tracking a user's currency and how it is spent.
 *
 * This schema defines the structure for storing currency transactions
 * in the database. Each record includes the following fields:
 * - `userId`: Reference to the corresponding User document.
 * - `coinCount`: Number of coins the user has.
 * - `customPhoto`: Boolean indicating whether a user has unlocked a custom profile picture.
 * - `nim`: Boolean indicating whether a user has unlocked the nim game.
 */
const currencySchema = new Schema(
  {
    username: { type: String, ref: 'User', unique: true, required: true, index: true },
    coinCount: { type: Number, default: 0 },
    customPhoto: { type: Boolean, default: false },
    nim: { type: Boolean, default: false },
  },
  { collection: 'Currency' },
);

export default currencySchema;
