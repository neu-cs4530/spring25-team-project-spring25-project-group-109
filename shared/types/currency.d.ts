import { Request } from 'express';
/**
 * Represents a currency object
 * - userId: Reference to the user.
 * - coinCount: Number of coins the user has.
 * - customPhoto: Boolean indicating whether a user has unlocked a custom profile picture.
 * - nim : Boolean indicating whether a user has unlocked the nim game.
 */
export interface Currency {
  username: string;
  coinCount: number;
  customPhoto: boolean;
  nim: boolean;
}

/**
 * Represents a user currency stored in the database.
 * - `_id`: Unique identifier for the currency.
 */
export interface DatabaseCurrency extends Currency {
  _id: mongoose.Types.ObjectId;
}

/**
 * Interface extending the request body for creating a currency object.
 * - `body`: the currency object being created.
 */
export interface CreateCurrencyRequest extends Request {
  body: Currency;
}

/**
 * Request for fetching currency based on the user's username.
 * - `params`: contains the `currency` of the user to look up.
 */
export interface GetCurrencyByUserRequest extends Request {
  params: {
    username: string;
  };
}

/**
 * Interface extending the request body for unlocking a feature.
 * - `body`: the currency object being updated.
 */
export interface UnlockFeatureRequest extends Request {
  body: {
    username: string;
    feature: 'nim' | 'customPhoto';
    cost: number;
  };
}
