import mongoose, { Model } from 'mongoose';
import { DatabaseBadge } from '../types/types';
import badgeSchema from './schema/badge.schema';

/**
 * Mongoose model for the `Badge` collection.
 *
 * This model is created using the `Badge` interface and the `badgeSchema`, representing the
 * `Badge` collection in the MongoDB database, and provides an interface for interacting with
 * the stored badges.
 *
 * @type {Model<DatabaseBadge>}
 */
const BadgeModel: Model<DatabaseBadge> = mongoose.model<DatabaseBadge>('Badge', badgeSchema);

export default BadgeModel;
