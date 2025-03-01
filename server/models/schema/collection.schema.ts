import { Schema } from 'mongoose';

/**
 * Mongoose schema for the Collection collection.
 *
 * This schema defines the structure for storing collections in the database.
 * Each Collection includes the following fields:
 * - `name`: the name of the collection.
 * - `username`: the username of the user that owns the collection.
 * - `questions`: an array of ObjectIds referencing the Questions in the collection.
 * - `visibility`: the visibility of the collection, either 'public' or 'private'.
 */
const collectionSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      ref: 'User',
      required: true,
    },
    questions: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Question',
      },
    ],
    visibility: {
      type: String,
      enum: ['public', 'private'],
      default: 'public',
    },
  },
  { collection: 'Collection' },
);

export default collectionSchema;
