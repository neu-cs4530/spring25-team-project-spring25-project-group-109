import mongoose, { Model } from 'mongoose';
import { DatabaseFeature } from '../types/types';
import featureSchema from './schema/feature.schema';

/**
 * TODO
 *
 * @type {Model<DatabaseFeature>}
 */
const FeatureModel: Model<DatabaseFeature> = mongoose.model<DatabaseFeature>(
  'Features',
  featureSchema,
);

export default FeatureModel;
