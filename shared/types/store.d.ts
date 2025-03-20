import { Request } from 'express';
import { FeatureType } from './feature';

/**
 * Represents a user store.
 * - `username`: the username of the user.
 * - `coinCount`: the number of coins the user has.
 * - `unlockedFeatures`: the features the user has unlocked.
 */
export interface Store {
  username: string;
  coinCount: number;
  unlockedFeatures: FeatureType[]; // names of Feature objects
}

/**
 * Represents a user store stored in the database.
 * - `_id`: Unique identifier for the store.
 */
export interface DatabaseStore extends Store {
  _id: mongoose.Types.ObjectId;
}

/**
 * Interface extending the request body for creating a store object.
 * - `body`: the store object being created.
 */
// todo create when we create a user
export interface CreateStoreRequest extends Request {
  body: Store;
}

/**
 * Request for fetching store based on the user's username.
 * - `params`: contains the `store` of the user to look up.
 */
export interface GetStoreByUserRequest extends Request {
  params: {
    username: string;
  };
}

/**
 * Interface extending the request body for unlocking a feature.
 * - `body`: the store object being updated.
 */
export interface UnlockFeatureRequest extends Request {
  body: {
    username: string;
    featureName: FeatureType;
  };
}

export type StoreResponse = DatabaseStore | { error: string };
