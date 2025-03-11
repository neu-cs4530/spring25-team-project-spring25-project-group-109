import { Schema } from 'mongoose';

// todo
const featureSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
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
