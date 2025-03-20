import { Schema } from 'mongoose';

/**
 * Mongoose schema for the "Features" collection.
 * This schema defines the structure of a feature, including its name, description, and price.
 *
 * - `name`: The unique name of the feature (required, indexed).
 * - `description`: A brief description of the feature (indexed).
 * - `price`: The coin cost required to unlock the feature (required, defaults to 0).
 */
const featureSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    description: {
      type: String,
      index: true,
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { collection: 'Features' },
);

export default featureSchema;
