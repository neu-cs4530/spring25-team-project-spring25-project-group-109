import mongoose, { Model } from 'mongoose';
import { DatabaseUserStats } from '../types/types';
import userStatsSchema from './schema/userstats.schema';

/**
 * Mongoose model for the `User` collection.
 *
 * This model is created using the `User` interface and the `userSchema`, representing the
 * `User` collection in the MongoDB database, and provides an interface for interacting with
 * the stored users.
 *
 * @type {Model<DatabaseUserStats>}
 */
const UserStatsModel: Model<DatabaseUserStats> = mongoose.model<DatabaseUserStats>('UserStats', userStatsSchema);

export default UserStatsModel;
