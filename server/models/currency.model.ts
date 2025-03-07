import mongoose, { Model } from 'mongoose';
import { DatabaseCurrency } from '../types/types';
import currencySchema from './schema/currency.schema';

/**
 * Mongoose model for the `Currency` collection.
 *
 * This model is created using the `Currency` interface and the `currencySchema`, representing the
 * `Currency` collection in the MongoDB database, and provides an interface for interacting with
 * the stored statistics of each user.
 *
 * @type {Model<DatabaseCurrency>}
 */
const CurrencyModel: Model<DatabaseCurrency> = mongoose.model<DatabaseCurrency>(
  'Currency',
  currencySchema,
);

export default CurrencyModel;
