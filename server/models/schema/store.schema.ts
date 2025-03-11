import { Schema } from 'mongoose';

// todo
const storeSchema = new Schema(
  {
    username: { type: String, unique: true, required: true, index: true },
    coinCount: { type: Number, default: 0 },
    unlockedFeatures: { type: [String], default: [] },
  },
  { collection: 'Store' },
);

export default storeSchema;
