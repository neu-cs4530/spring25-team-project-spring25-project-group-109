import mongoose, { Model } from 'mongoose';
import { DatabaseFeature } from '../types/types';
import featureSchema from './schema/feature.schema';

/**
 * Mongoose model for the "Features" collection.
 * This model represents purchasable features in the application.
 *
 * Each feature includes:
 * - `name` (String): The unique name of the feature.
 * - `description` (String): A brief explanation of the feature.
 * - `price` (Number): The coin cost required to unlock the feature.
 *
 * @module FeatureModel
 * @type {Model<DatabaseFeature>}
 */
const FeatureModel: Model<DatabaseFeature> = mongoose.model<DatabaseFeature>(
  'Features',
  featureSchema,
);

export default FeatureModel;
