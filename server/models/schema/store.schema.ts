import { Schema } from 'mongoose';

/**
 * Mongoose schema for the "Store" collection.
 * This schema defines the structure of a user's store data, including their username, coin balance, and unlocked features.
 *
 * - `username`: The unique identifier for the user (required, indexed).
 * - `coinCount`: The number of coins the user has (defaults to 0).
 * - `unlockedFeatures`: An array of features the user has unlocked (defaults to an empty array).
 */
const storeSchema = new Schema(
  {
    username: { type: String, unique: true, required: true, index: true },
    coinCount: { type: Number, default: 0 },
    unlockedFeatures: { type: [String], default: [] },
  },
  { collection: 'Store' },
);

export default storeSchema;
