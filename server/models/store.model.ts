import mongoose, { Model } from 'mongoose';
import { DatabaseStore } from '../types/types';
import storeSchema from './schema/store.schema';

/**
 * Mongoose model for the `Store` collection.
 *
 * This model is created using the `Store` interface and the `storeSchema`, representing the
 * `Store` collection in the MongoDB database, and provides an interface for interacting with
 * the stored statistics of each user.
 *
 * @type {Model<DatabaseStore>}
 */
const StoreModel: Model<DatabaseStore> = mongoose.model<DatabaseStore>('Store', storeSchema);

export default StoreModel;
