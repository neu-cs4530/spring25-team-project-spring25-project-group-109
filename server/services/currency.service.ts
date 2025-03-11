import CurrencyModel from '../models/currency.model';
import UserModel from '../models/users.model';
import { DatabaseCurrency, Currency, DatabaseUser } from '../types/types';

/**
 * Saves a new currency to the database.
 *
 * @param {DatabaseCurrency} currency - the currency object to be saved
 * @returns {Promise<DatabaseCurrency | null>} - The updated currency object or an error message.
 */
export const saveCurrency = async (currency: Currency): Promise<DatabaseCurrency> => {
  try {
    const userExists: DatabaseUser | null = await UserModel.findOne({
      username: currency.username,
    });

    if (!userExists) {
      throw new Error('User does not exist.');
    }

    const result: DatabaseCurrency = await CurrencyModel.create(currency);
    return result;
  } catch (error) {
    throw Error(`Error occurred when saving currency: ${error}`);
  }
};

/** Gets user's currency given a username.
 * @param username - the username to search for
 * @returns {Promise<Currency>} - The currency object or an error message.
 */
export const getCurrency = async (username: string): Promise<Currency> => {
  try {
    const userExists: DatabaseUser | null = await UserModel.findOne({ username });

    if (!userExists) {
      throw new Error('User does not exist.');
    }

    const currency = await CurrencyModel.findOne({ username }).lean();

    if (!currency) {
      throw new Error('Currency not found for the provided user');
    }

    return currency;
  } catch (error) {
    throw new Error(`Error occurred when fetching currency: ${error}`);
  }
};

/**
 * Updates the coin count for a user.
 *
 * @param username user to update
 * @param amount number of coins to add or subtract
 * @returns {Promise<DatabaseCurrency | null>} - The updated currency object or an error message.
 */
export const updateCoins = async (
  username: string,
  amount: number,
): Promise<DatabaseCurrency | null> => {
  try {
    const userExists = await UserModel.findOne({ username });

    if (!userExists) {
      throw new Error('User does not exist.');
    }

    const result = await CurrencyModel.findOneAndUpdate(
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

export const unlockFeature = async (
  username: string,
  feature: 'nim' | 'customPhoto',
  cost: number,
): Promise<DatabaseCurrency> => {
  try {
    const userCurrency = await CurrencyModel.findOne({ username });

    if (!userCurrency) {
      throw new Error('User currency data not found.');
    }

    if (
      (feature === 'nim' && userCurrency.nim) ||
      (feature === 'customPhoto' && userCurrency.customPhoto)
    ) {
      throw new Error(`${feature} is already unlocked.`);
    }

    if (userCurrency.coinCount < cost) {
      throw new Error(`Insufficient coins to unlock ${feature}.`);
    }

    const updatedCurrency = await updateCoins(username, -cost);

    if (!updatedCurrency) {
      throw new Error(`Failed to unlock ${feature}.`);
    }

    const updatedCurrencywithFeatureUnlocked = await CurrencyModel.findOneAndUpdate(
      { username },
      { [feature]: true },
      { new: true },
    );

    if (!updatedCurrencywithFeatureUnlocked) {
      throw new Error(`Failed to update feature ${feature}.`);
    }

    return updatedCurrencywithFeatureUnlocked;
  } catch (error) {
    throw new Error(`Error occurred when unlocking: ${error}`);
  }
};

export default {
  saveCurrency,
  getCurrency,
  updateCoins,
  unlockFeature,
};
