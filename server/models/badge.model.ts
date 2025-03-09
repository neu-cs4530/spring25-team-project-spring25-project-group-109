import mongoose, { Model } from 'mongoose';
import { DatabaseBadge } from '../types/types';
import badgeSchema from './schema/badge.schema';

/**
 * Mongoose model for the `Badges` collection.
 *
 * This model provides an interface for interacting with badge documents in the database.
 */
const BadgeModel: Model<DatabaseBadge> = mongoose.model<DatabaseBadge>('Badge', badgeSchema);

export default BadgeModel;
