/**
 * Represents a feature that users can unlock.
 */
export interface Feature {
  name: FeatureType;
  description: string;
  price: number;
}

export type FeatureType = 'Nim' | 'Custom Profile Photo';

/**
 * Defines the available feature types.
 */
export interface DatabaseFeature extends Feature {
  _id: mongoose.Types.ObjectId;
}

/**
 * Represents the response for multiple feature-related operations.
 * - `DatabaseFeature[]`: A list of feature objects if the operation is successful.
 * - `error`: An error message if the operation fails.
 */
export type FeaturesResponse = DatabaseFeature[] | { error: string };
