import FeatureModel from '../models/feature.model';
import StoreModel from '../models/store.model';
import UserModel from '../models/users.model';
import { Store, StoreResponse } from '../types/types';

/**
 * Save a new store to the database.
 * @param store The store object to be saved in the database.
 * @returns {Promise<StoreResponse>} A promise that resolves to the saved store data or an error response.
 *   - If successful, the saved store object is returned.
 *   - If an error occurs, an error message is returned in the format `{ error: string }`.
 */
export const saveStore = async (store: Store): Promise<StoreResponse> => {
  try {
    const userExists = await UserModel.findOne({
      username: store.username,
    });

    if (!userExists) {
      throw new Error('User does not exist');
    }
    const result = await StoreModel.create(store);
    return result;
  } catch (error) {
    return { error: `Error creating user store: ${(error as Error).message}` };
  }
};

/**
 * Get the store data for a user.
 * @param username The username of the user to get the store data for.
 * @returns {Promise<StoreResponse>} A promise that resolves to the store data or an error response.
 *   - If successful, the store object is returned.
 *   - If an error occurs, an error message is returned in the format `{ error: string }`.
 */
export const getStore = async (username: string): Promise<StoreResponse> => {
  try {
    const userExists = await UserModel.findOne({ username });

    if (!userExists) {
      throw new Error('User does not exist');
    }

    const store = await StoreModel.findOne({ username }).lean();

    if (!store) {
      throw new Error('Store not found for the provided user');
    }

    return store;
  } catch (error) {
    return { error: `Error fetching store: ${(error as Error).message}` };
  }
};

/**
 * Updates the coin count for a user.
 *
 * @param username user to update
 * @param amount number of coins to add or subtract
 * @returns {Promise<DatabaseStore | null>} - The updated store object or an error message.
 */
export const updateCoins = async (username: string, amount: number): Promise<StoreResponse> => {
  try {
    const userExists = await UserModel.findOne({ username });

    if (!userExists) {
      throw new Error('User does not exist');
    }

    const result = await StoreModel.findOneAndUpdate(
      { username },
      { $inc: { coinCount: amount } },
      { new: true },
    );

    if (!result) {
      throw new Error('Failed to update coins');
    }

    return result;
  } catch (error) {
    return { error: `Error updating coins: ${(error as Error).message}` };
  }
};

/**
 * Unlock a feature for a user.
 * @param username The username of the user to unlock the feature for.
 * @param featureName The name of the feature to unlock.
 * @returns {Promise<StoreResponse>} A promise that resolves to the updated store data or an error response.
 *  - If successful, the updated store object is returned.
 * - If an error occurs, an error message is returned in the format `{ error: string }`.
 */
// removes coins from store and adds to unlocked feature
export const unlockFeature = async (
  username: string,
  featureName: 'Nim' | 'Custom Photo',
): Promise<StoreResponse> => {
  try {
    const userStore = await StoreModel.findOne({ username });
    if (!userStore) {
      throw new Error('User coin data not found');
    }

    const feature = await FeatureModel.findOne({ name: featureName });
    if (!feature) {
      throw new Error('Feature not found');
    }

    if (userStore.unlockedFeatures.includes(featureName)) {
      throw new Error(`${feature.name} is already unlocked`);
    }

    // Check if user has enough coins to purchase feature and then update
    if (userStore.coinCount < feature.price) {
      throw new Error(`Insufficient coins to unlock ${feature.name}`);
    }
    const updatedCurrency = await updateCoins(username, -feature.price);
    if ('error' in updatedCurrency) {
      throw new Error(`Failed to update coins`);
    }
    const updatedStore = await StoreModel.findOneAndUpdate(
      { username },
      { $addToSet: { unlockedFeatures: featureName } },
      { new: true },
    );
    if (!updatedStore) {
      throw new Error(`Failed to update features for ${featureName}`);
    }
    return updatedStore; // Store with deducted coins and new unlocked features
  } catch (error) {
    return { error: `Error unlocking feature: ${(error as Error).message}` };
  }
};

export default {
  saveStore,
  getStore,
  updateCoins,
  unlockFeature,
};
