import { Schema } from 'mongoose';

/**
 * Mongoose schema for tracking user achievement badges.
 *
 * Each badge has:
 * - `name`: The name of the badge.
 * - `description`: A brief description of the badge.
 * - `type`: The type of user stat this badge is tied to.
 * - `threshold`: The value the user must reach to earn this badge.
 * - `imagePath`: path of the badge image in public folder.
 */
const badgeSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    type: {
      type: String,
      enum: ['question', 'answer', 'comment', 'nim'],
      required: true,
    },
    threshold: { type: Number, required: true },
    imagePath: { type: String, required: true },
  },
  { collection: 'Badges' },
);

export default badgeSchema;
