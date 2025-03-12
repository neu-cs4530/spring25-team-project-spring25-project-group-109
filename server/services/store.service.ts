import FeatureModel from '../models/feature.model';
import StoreModel from '../models/store.model';
import UserModel from '../models/users.model';
import { DatabaseStore, Store, DatabaseUser, DatabaseFeature } from '../types/types';

/**
 * Saves a new store entry for a user.
 *
 * @param {Store} store - The store object to save.
 * @returns {Promise<DatabaseStore>} - The saved store object.
 * @throws {Error} - If the user does not exist or if an error occurs.
 */
export const saveStore = async (store: Store): Promise<DatabaseStore> => {
  try {
    const userExists: DatabaseUser | null = await UserModel.findOne({
      username: store.username,
    });

    if (!userExists) {
      throw new Error('User does not exist.');
    }
    const result: DatabaseStore = await StoreModel.create(store);
    return result;
  } catch (error) {
    throw Error(`Error occurred when saving store: ${error}`);
  }
};

/**
 * Retrieves the store data for a specific user.
 *
 * @param {string} username - The username of the store owner.
 * @returns {Promise<Store>} - The store object.
 * @throws {Error} - If the user or store does not exist.
 */
export const getStore = async (username: string): Promise<Store> => {
  try {
    const userExists: DatabaseUser | null = await UserModel.findOne({ username });

    if (!userExists) {
      throw new Error('User does not exist.');
    }

    const store = await StoreModel.findOne({ username }).lean();

    if (!store) {
      throw new Error('Store not found for the provided user');
    }

    return store;
  } catch (error) {
    throw new Error(`Error occurred when fetching store: ${error}`);
  }
};

/**
 * Updates the coin count for a user.
 *
 * @param {string} username - The username of the user.
 * @param {number} amount - The number of coins to add (positive) or subtract (negative).
 * @returns {Promise<DatabaseStore | null>} - The updated store object or an error message.
 * @throws {Error} - If the user does not exist or the update fails.
 */
export const updateCoins = async (
  username: string,
  amount: number,
): Promise<DatabaseStore | null> => {
  try {
    const userExists = await UserModel.findOne({ username });

    if (!userExists) {
      throw new Error('User does not exist.');
    }

    const result = await StoreModel.findOneAndUpdate(
      { username },
      { $inc: { coinCount: amount } },
      { new: true },
    );

    if (!result) {
      throw new Error('Failed to update coins.');
    }

    return result;
  } catch (error) {
    throw new Error(`Error occurred when updating coins: ${error}`);
  }
};

/**
 * Unlocks a feature for a user by deducting the necessary coins and updating the store.
 *
 * @param {string} username - The username of the user unlocking the feature.
 * @param {'Nim' | 'Custom Profile Photo'} featureName - The name of the feature to unlock.
 * @returns {Promise<DatabaseStore>} - The updated store object with the unlocked feature.
 * @throws {Error} - If the store, feature, or user data is missing, or if there are insufficient coins.
 */
export const unlockFeature = async (
  username: string,
  featureName: 'Nim' | 'Custom Profile Photo',
): Promise<DatabaseStore> => {
  try {
    const userStore: DatabaseStore | null = await StoreModel.findOne({ username });
    if (!userStore) {
      throw new Error('User coin data not found.');
    }

    const feature: DatabaseFeature | null = await FeatureModel.findOne({ name: featureName });
    if (!feature) {
      throw new Error('Feature not found.');
    }

    if (userStore.unlockedFeatures.includes(featureName)) {
      throw new Error(`${feature.name} is already unlocked.`);
    }

    // Check if user has enough coins to purchase feature and then update
    if (userStore.coinCount < feature.price) {
      throw new Error(`Insufficient coins to unlock ${feature.name}.`);
    }
    const updatedCurrency = await updateCoins(username, -feature.price);
    if (!updatedCurrency) {
      throw new Error(`Failed to unlock ${feature.name}.`);
    }
    const updatedStore = await StoreModel.findOneAndUpdate(
      { username },
      { $addToSet: { unlockedFeatures: featureName } },
      { new: true },
    );
    if (!updatedStore) {
      throw new Error(`Failed to update features for ${featureName}.`);
    }
    return updatedStore; // Store with deducted coins and new unlocked features
  } catch (error) {
    throw new Error(`Error occurred when unlocking: ${error}`);
  }
};

export default {
  saveStore,
  getStore,
  updateCoins,
  unlockFeature,
};
