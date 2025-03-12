import FeatureModel from '../models/feature.model';
import StoreModel from '../models/store.model';
import UserModel from '../models/users.model';
import { DatabaseStore, Store, DatabaseUser, DatabaseFeature } from '../types/types';

// todo
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

// todo
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
 * @param username user to update
 * @param amount number of coins to add or subtract
 * @returns {Promise<DatabaseStore | null>} - The updated store object or an error message.
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

// todo
// removes coins from store and adds to unlocked feature
export const unlockFeature = async (
  username: string,
  featureName: 'Nim' | 'Custom Photo',
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
