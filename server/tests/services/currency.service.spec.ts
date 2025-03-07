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

// TODO: Write tests for error cases

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
  });
});
