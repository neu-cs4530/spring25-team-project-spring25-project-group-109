import mongoose, { Model } from 'mongoose';
import { DatabaseUserStats } from '../types/types';
import userStatsSchema from './schema/userstats.schema';

/**
 * Mongoose model for the `UserStats` collection.
 *
 * This model is created using the `UserStats` interface and the `userStatsSchema`, representing the
 * `UserStats` collection in the MongoDB database, and provides an interface for interacting with
 * the stored statistics of each user.
 *
 * @type {Model<DatabaseUserStats>}
 */
const UserStatsModel: Model<DatabaseUserStats> = mongoose.model<DatabaseUserStats>(
  'UserStats',
  userStatsSchema,
);

export default UserStatsModel;
