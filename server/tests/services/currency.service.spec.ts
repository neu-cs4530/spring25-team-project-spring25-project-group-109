import { ObjectId } from 'mongodb';
import CurrencyModel from '../../models/currency.model';
import UserModel from '../../models/users.model';
import { saveCurrency, unlockFeature, updateCoins } from '../../services/currency.service';
import * as currencyService from '../../services/currency.service';
import { Currency, DatabaseCurrency } from '../../types/types';
import { user } from '../mockData.models';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const mockingoose = require('mockingoose');

const currency: Currency = {
  username: user.username,
  coinCount: 0,
  customPhoto: false,
  nim: false,
};

describe('Test Currency Service', () => {
  beforeEach(() => {
    mockingoose.resetAll();
    jest.clearAllMocks();
  });

  describe('saveCurrency', () => {
    it('should return the saved currency', async () => {
      mockingoose(UserModel).toReturn(user, 'findOne');
      mockingoose(CurrencyModel).toReturn(currency, 'create');

      const result = (await saveCurrency(currency)) as DatabaseCurrency;

      expect(result._id).toBeDefined();
      expect(result.username).toEqual(currency.username);
      expect(result.customPhoto).toEqual(currency.customPhoto);
      expect(result.nim).toEqual(currency.nim);
    });

    it('should throw an error if the user does not exist', async () => {
      mockingoose(UserModel).toReturn(null, 'findOne');

      await expect(saveCurrency(currency)).rejects.toThrow('User does not exist.');
    });

    it('should throw an error if the currency creation fails', async () => {
      mockingoose(UserModel).toReturn(user, 'findOne');
      jest.spyOn(CurrencyModel, 'create').mockRejectedValueOnce(new Error('DB Error'));

      await expect(saveCurrency(currency)).rejects.toThrow(
        'Error occurred when saving currency: Error: DB Error',
      );
    });
  });

  describe('updateCoins', () => {
    it('should return the updated currency with incremented coin count', async () => {
      const initialCoinCount = 5;
      const incrementAmount = 10;

      const savedCurrency: DatabaseCurrency = {
        _id: new ObjectId(),
        username: user.username,
        coinCount: initialCoinCount,
        customPhoto: false,
        nim: false,
      };

      const updatedCurrency: DatabaseCurrency = {
        ...savedCurrency,
        coinCount: initialCoinCount + incrementAmount,
      };

      mockingoose(UserModel).toReturn(user, 'findOne');

      mockingoose(CurrencyModel).toReturn(updatedCurrency, 'findOneAndUpdate');

      const result = (await updateCoins(user.username, incrementAmount)) as DatabaseCurrency;

      expect(result).toBeDefined();
      expect(result.username).toEqual(user.username);
      expect(result.coinCount).toEqual(initialCoinCount + incrementAmount);
      expect(result.customPhoto).toEqual(savedCurrency.customPhoto);
      expect(result.nim).toEqual(savedCurrency.nim);
    });

    it('should return the updated currency with decremented coin count', async () => {
      const initialCoinCount = 15;
      const decrementAmount = 5;

      const savedCurrency: DatabaseCurrency = {
        _id: new ObjectId(),
        username: user.username,
        coinCount: initialCoinCount,
        customPhoto: false,
        nim: false,
      };

      const updatedCurrency: DatabaseCurrency = {
        ...savedCurrency,
        coinCount: initialCoinCount - decrementAmount,
      };

      mockingoose(UserModel).toReturn(user, 'findOne');

      mockingoose(CurrencyModel).toReturn(updatedCurrency, 'findOneAndUpdate');

      const result = (await updateCoins(user.username, -decrementAmount)) as DatabaseCurrency;

      expect(result).toBeDefined();
      expect(result.username).toEqual(user.username);
      expect(result.coinCount).toEqual(initialCoinCount - decrementAmount);
      expect(result.customPhoto).toEqual(savedCurrency.customPhoto);
      expect(result.nim).toEqual(savedCurrency.nim);
    });

    it('should throw an error if the user does not exist', async () => {
      mockingoose(UserModel).toReturn(null, 'findOne');

      await expect(updateCoins(user.username, 10)).rejects.toThrow('User does not exist.');
    });

    it('should throw an error if find one and update fails', async () => {
      mockingoose(UserModel).toReturn(user, 'findOne');
      mockingoose(CurrencyModel).toReturn(null, 'findOneAndUpdate');

      await expect(updateCoins(user.username, 10)).rejects.toThrow('Failed to update coins.');
    });
  });

  describe('getCurrency', () => {
    it('should return the currency data for the user', async () => {
      mockingoose(UserModel).toReturn(user, 'findOne');
      mockingoose(CurrencyModel).toReturn(currency, 'findOne');

      const savedCurrency: DatabaseCurrency = {
        _id: new ObjectId(),
        username: user.username,
        coinCount: 0,
        customPhoto: false,
        nim: false,
      };

      const currencyData = await currencyService.getCurrency(user.username);

      expect(currencyData).toMatchObject({
        username: savedCurrency.username,
        coinCount: savedCurrency.coinCount,
        customPhoto: savedCurrency.customPhoto,
        nim: savedCurrency.nim,
      });
    });

    it('should throw an error if the user does not exist', async () => {
      mockingoose(UserModel).toReturn(null, 'findOne');

      await expect(currencyService.getCurrency(user.username)).rejects.toThrow(
        'User does not exist.',
      );
    });

    it('should throw an error if the currency data is not found', async () => {
      mockingoose(UserModel).toReturn(user, 'findOne');
      mockingoose(CurrencyModel).toReturn(null, 'findOne');

      await expect(currencyService.getCurrency(user.username)).rejects.toThrow(
        'Error occurred when fetching currency: Error: Currency not found for the provided user',
      );
    });
  });

  describe('unlockFeature', () => {
    let updateCoinsSpy: jest.SpyInstance;

    beforeEach(() => {
      updateCoinsSpy = jest.spyOn(currencyService, 'updateCoins');
    });

    it('should successfully unlock the "nim" feature if user has enough coins', async () => {
      const initialCoinCount = 15;
      const feature = 'nim';
      const cost = 10;

      const savedCurrency: DatabaseCurrency = {
        _id: new ObjectId(),
        username: user.username,
        coinCount: initialCoinCount,
        customPhoto: false,
        nim: false,
      };

      const updatedCurrency: DatabaseCurrency = {
        ...savedCurrency,
        coinCount: initialCoinCount - cost,
        nim: true,
      };

      mockingoose(UserModel).toReturn(user, 'findOne');
      mockingoose(CurrencyModel).toReturn(savedCurrency, 'findOne');
      mockingoose(CurrencyModel).toReturn(updatedCurrency, 'findOneAndUpdate');
      (updateCoins as jest.Mock).mockResolvedValue(updatedCurrency);

      const result = await unlockFeature(user.username, feature, cost);

      expect(result.nim).toBe(true);
      expect(result.coinCount).toBe(initialCoinCount - cost);
    });

    it('should successfully unlock the "customPhoto" feature if user has enough coins', async () => {
      const initialCoinCount = 15;
      const feature = 'customPhoto';
      const cost = 5;

      const savedCurrency: DatabaseCurrency = {
        _id: new ObjectId(),
        username: user.username,
        coinCount: initialCoinCount,
        customPhoto: false,
        nim: false,
      };

      const updatedCurrency: DatabaseCurrency = {
        ...savedCurrency,
        coinCount: initialCoinCount - cost,
        customPhoto: true,
      };

      mockingoose(UserModel).toReturn(user, 'findOne');
      mockingoose(CurrencyModel).toReturn(savedCurrency, 'findOne');
      mockingoose(CurrencyModel).toReturn(updatedCurrency, 'findOneAndUpdate');
      (updateCoins as jest.Mock).mockResolvedValue(updatedCurrency);

      const result = await unlockFeature(user.username, feature, cost);

      expect(result.customPhoto).toBe(true);
      expect(result.coinCount).toBe(initialCoinCount - cost);
    });

    it('should throw an error if the user currency data is not found', async () => {
      mockingoose(UserModel).toReturn(user, 'findOne');
      mockingoose(CurrencyModel).toReturn(null, 'findOne');

      await expect(unlockFeature(user.username, 'nim', 10)).rejects.toThrow(
        'User currency data not found.',
      );
    });

    it('should throw an error if the feature is already unlocked', async () => {
      const initialCoinCount = 15;
      const feature = 'nim';
      const cost = 10;

      const savedCurrency: DatabaseCurrency = {
        _id: new ObjectId(),
        username: user.username,
        coinCount: initialCoinCount,
        customPhoto: false,
        nim: true,
      };

      mockingoose(UserModel).toReturn(user, 'findOne');
      mockingoose(CurrencyModel).toReturn(savedCurrency, 'findOne');

      await expect(unlockFeature(user.username, feature, cost)).rejects.toThrow(
        `${feature} is already unlocked.`,
      );
    });

    it('should throw an error if the user does not have enough coins', async () => {
      const initialCoinCount = 5;
      const feature = 'nim';
      const cost = 10;

      const savedCurrency: DatabaseCurrency = {
        _id: new ObjectId(),
        username: user.username,
        coinCount: initialCoinCount,
        customPhoto: false,
        nim: false,
      };

      mockingoose(UserModel).toReturn(user, 'findOne');
      mockingoose(CurrencyModel).toReturn(savedCurrency, 'findOne');

      await expect(unlockFeature(user.username, feature, cost)).rejects.toThrow(
        `Insufficient coins to unlock ${feature}.`,
      );
    });

    it('should throw an error if the updateCoins function returns null', async () => {
      const initialCoinCount = 15;
      const feature = 'nim';
      const cost = 10;

      const savedCurrency: DatabaseCurrency = {
        _id: new ObjectId(),
        username: user.username,
        coinCount: initialCoinCount,
        customPhoto: false,
        nim: false,
      };

      mockingoose(UserModel).toReturn(user, 'findOne');
      mockingoose(CurrencyModel).toReturn(savedCurrency, 'findOne');
      (updateCoins as jest.Mock).mockResolvedValue(null);

      await expect(unlockFeature(user.username, feature, cost)).rejects.toThrow(
        `Failed to unlock ${feature}.`,
      );
    });

    it('should throw an error if the function fails to update feature field', async () => {
      const initialCoinCount = 15;
      const feature = 'nim';
      const cost = 10;

      const savedCurrency: DatabaseCurrency = {
        _id: new ObjectId(),
        username: user.username,
        coinCount: initialCoinCount,
        customPhoto: false,
        nim: false,
      };

      const updatedCurrency: DatabaseCurrency = {
        ...savedCurrency,
        coinCount: initialCoinCount - cost,
        nim: true,
      };

      mockingoose(UserModel).toReturn(user, 'findOne');
      mockingoose(CurrencyModel).toReturn(savedCurrency, 'findOne');
      mockingoose(CurrencyModel).toReturn(updatedCurrency, 'findOneAndUpdate');
      (updateCoins as jest.Mock).mockResolvedValue(updatedCurrency);
      mockingoose(CurrencyModel).toReturn(null, 'findOneAndUpdate');

      await expect(unlockFeature(user.username, feature, cost)).rejects.toThrow(
        `Error occurred when unlocking: Error: Failed to update feature nim.`,
      );
    });

    it('should throw an error if the updateCoins function fails', async () => {
      const initialCoinCount = 15;
      const feature = 'nim';
      const cost = 10;

      const savedCurrency: DatabaseCurrency = {
        _id: new ObjectId(),
        username: user.username,
        coinCount: initialCoinCount,
        customPhoto: false,
        nim: false,
      };

      mockingoose(UserModel).toReturn(user, 'findOne');
      mockingoose(CurrencyModel).toReturn(savedCurrency, 'findOne');
      (updateCoins as jest.Mock).mockRejectedValue(new Error('Failed to update coins.'));

      await expect(unlockFeature(user.username, feature, cost)).rejects.toThrow(
        'Failed to update coins.',
      );
    });
  });
});
