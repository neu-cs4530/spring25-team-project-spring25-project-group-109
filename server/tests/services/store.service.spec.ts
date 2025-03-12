import { ObjectId } from 'mongodb';
import StoreModel from '../../models/store.model';
import UserModel from '../../models/users.model';
import { saveStore, unlockFeature, updateCoins } from '../../services/store.service';
import * as storeService from '../../services/store.service';
import { Store, DatabaseStore, Feature, DatabaseFeature } from '../../types/types';
import { user } from '../mockData.models';
import FeatureModel from '../../models/feature.model';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const mockingoose = require('mockingoose');

const store: Store = {
  username: user.username,
  coinCount: 0,
  unlockedFeatures: [],
};

const nimFeature: Feature = {
  name: 'Nim',
  price: 10,
};

const profileFeature: Feature = {
  name: 'Custom Photo',
  price: 0,
};

const nimDBFeature: DatabaseFeature = {
  ...nimFeature,
  _id: new ObjectId(),
};

const profileDBFeature: DatabaseFeature = {
  ...profileFeature,
  _id: new ObjectId(),
};

describe('Test Store Service', () => {
  beforeEach(() => {
    mockingoose.resetAll();
    jest.clearAllMocks();
  });

  describe('saveStore', () => {
    it('should return the saved store', async () => {
      mockingoose(UserModel).toReturn(user, 'findOne');
      mockingoose(StoreModel).toReturn(store, 'create');

      const result = (await saveStore(store)) as DatabaseStore;

      expect(result._id).toBeDefined();
      expect(result.username).toEqual(store.username);
      expect(result.unlockedFeatures).toEqual(store.unlockedFeatures);
    });

    it('should throw an error if the user does not exist', async () => {
      mockingoose(UserModel).toReturn(null, 'findOne');

      await expect(saveStore(store)).rejects.toThrow('User does not exist.');
    });

    it('should throw an error if the store creation fails', async () => {
      mockingoose(UserModel).toReturn(user, 'findOne');
      mockingoose(StoreModel).toReturn(new Error('DB Error'), '$save');

      await expect(saveStore(store)).rejects.toThrow(
        'Error occurred when saving store: Error: DB Error',
      );
    });
  });

  describe('updateCoins', () => {
    it('should return the updated store with incremented coin count', async () => {
      const initialCoinCount = 5;
      const incrementAmount = 10;

      const savedStore: DatabaseStore = {
        _id: new ObjectId(),
        username: user.username,
        coinCount: initialCoinCount,
        unlockedFeatures: [],
      };

      const updatedStore: DatabaseStore = {
        ...savedStore,
        coinCount: initialCoinCount + incrementAmount,
      };

      mockingoose(UserModel).toReturn(user, 'findOne');

      mockingoose(StoreModel).toReturn(updatedStore, 'findOneAndUpdate');

      const result = (await updateCoins(user.username, incrementAmount)) as DatabaseStore;

      expect(result).toBeDefined();
      expect(result.username).toEqual(user.username);
      expect(result.coinCount).toEqual(initialCoinCount + incrementAmount);
      expect(result.unlockedFeatures).toEqual(savedStore.unlockedFeatures);
    });

    it('should return the updated store with decremented coin count', async () => {
      const initialCoinCount = 15;
      const decrementAmount = 5;

      const savedStore: DatabaseStore = {
        _id: new ObjectId(),
        username: user.username,
        coinCount: initialCoinCount,
        unlockedFeatures: [],
      };

      const updatedStore: DatabaseStore = {
        ...savedStore,
        coinCount: initialCoinCount - decrementAmount,
      };

      mockingoose(UserModel).toReturn(user, 'findOne');

      mockingoose(StoreModel).toReturn(updatedStore, 'findOneAndUpdate');

      const result = (await updateCoins(user.username, -decrementAmount)) as DatabaseStore;

      expect(result).toBeDefined();
      expect(result.username).toEqual(user.username);
      expect(result.coinCount).toEqual(initialCoinCount - decrementAmount);
      expect(result.unlockedFeatures).toEqual(savedStore.unlockedFeatures);
    });

    it('should throw an error if the user does not exist', async () => {
      mockingoose(UserModel).toReturn(null, 'findOne');

      await expect(updateCoins(user.username, 10)).rejects.toThrow('User does not exist.');
    });

    it('should throw an error if find one and update fails', async () => {
      mockingoose(UserModel).toReturn(user, 'findOne');
      mockingoose(StoreModel).toReturn(null, 'findOneAndUpdate');

      await expect(updateCoins(user.username, 10)).rejects.toThrow('Failed to update coins.');
    });
  });

  describe('getStore', () => {
    it('should return the store data for the user', async () => {
      mockingoose(UserModel).toReturn(user, 'findOne');
      mockingoose(StoreModel).toReturn(store, 'findOne');

      const storeData = await storeService.getStore(user.username);

      expect(storeData).toMatchObject(store);
    });

    it('should throw an error if the user does not exist', async () => {
      mockingoose(UserModel).toReturn(null, 'findOne');

      await expect(storeService.getStore(user.username)).rejects.toThrow('User does not exist.');
    });

    it('should throw an error if the Store data is not found', async () => {
      mockingoose(UserModel).toReturn(user, 'findOne');
      mockingoose(StoreModel).toReturn(null, 'findOne');

      await expect(storeService.getStore(user.username)).rejects.toThrow(
        'Error occurred when fetching store: Error: Store not found for the provided user',
      );
    });
  });

  describe('unlockFeature', () => {
    let updateCoinsSpy: jest.SpyInstance;

    beforeEach(() => {
      updateCoinsSpy = jest.spyOn(storeService, 'updateCoins');
    });

    it('should successfully unlock the "nim" feature if user has enough coins', async () => {
      const initialCoinCount = 15;
      const feature = 'Nim';
      const cost = 10;

      const savedStore: DatabaseStore = {
        _id: new ObjectId(),
        username: user.username,
        coinCount: initialCoinCount,
        unlockedFeatures: [],
      };

      const updatedStore: DatabaseStore = {
        ...savedStore,
        coinCount: initialCoinCount - cost,
        unlockedFeatures: [],
      };

      mockingoose(UserModel).toReturn(user, 'findOne');
      mockingoose(StoreModel).toReturn(savedStore, 'findOne');
      mockingoose(StoreModel).toReturn(updatedStore, 'findOneAndUpdate');
      mockingoose(FeatureModel).toReturn(nimDBFeature, 'findOne');
      (updateCoins as jest.Mock).mockResolvedValue(updatedStore);

      const result = await unlockFeature(user.username, feature);

      expect(result.coinCount).toBe(initialCoinCount - cost);
      expect(updateCoinsSpy).toHaveBeenCalledWith(user.username, -cost);
    });

    it('should successfully unlock the "customPhoto" feature if user has enough coins', async () => {
      const initialCoinCount = 15;
      const feature = 'Custom Photo';
      const cost = 5;

      const savedStore: DatabaseStore = {
        _id: new ObjectId(),
        username: user.username,
        coinCount: initialCoinCount,
        unlockedFeatures: [],
      };

      const updatedStore: DatabaseStore = {
        ...savedStore,
        coinCount: initialCoinCount - cost,
        unlockedFeatures: ['Custom Photo'],
      };

      mockingoose(UserModel).toReturn(user, 'findOne');
      mockingoose(StoreModel).toReturn(savedStore, 'findOne');
      mockingoose(StoreModel).toReturn(updatedStore, 'findOneAndUpdate');
      mockingoose(FeatureModel).toReturn(profileDBFeature, 'findOne');
      (updateCoins as jest.Mock).mockResolvedValue(updatedStore);

      const result = await unlockFeature(user.username, feature);

      expect(result.unlockedFeatures).toEqual(['Custom Photo']);
      expect(result.coinCount).toBe(initialCoinCount - cost);
    });

    it('should throw an error if the user store data is not found', async () => {
      mockingoose(UserModel).toReturn(user, 'findOne');
      mockingoose(StoreModel).toReturn(null, 'findOne');

      await expect(unlockFeature(user.username, 'Nim')).rejects.toThrow(
        'Error occurred when unlocking: Error: User coin data not found.',
      );
    });

    it('should throw an error if the feature is already unlocked', async () => {
      const initialCoinCount = 15;
      const feature = 'Nim';

      const savedStore: DatabaseStore = {
        _id: new ObjectId(),
        username: user.username,
        coinCount: initialCoinCount,
        unlockedFeatures: ['Nim'],
      };

      mockingoose(UserModel).toReturn(user, 'findOne');
      mockingoose(StoreModel).toReturn(savedStore, 'findOne');
      mockingoose(FeatureModel).toReturn(nimDBFeature, 'findOne');

      await expect(unlockFeature(user.username, feature)).rejects.toThrow(
        `${feature} is already unlocked.`,
      );
    });

    it('should throw an error if the user does not have enough coins', async () => {
      const initialCoinCount = 5;
      const feature = 'Nim';

      const savedStore: DatabaseStore = {
        _id: new ObjectId(),
        username: user.username,
        coinCount: initialCoinCount,
        unlockedFeatures: [],
      };

      mockingoose(UserModel).toReturn(user, 'findOne');
      mockingoose(StoreModel).toReturn(savedStore, 'findOne');
      mockingoose(FeatureModel).toReturn(nimDBFeature, 'findOne');

      await expect(unlockFeature(user.username, feature)).rejects.toThrow(
        `Insufficient coins to unlock ${feature}.`,
      );
    });

    it('should throw an error if the updateCoins function returns null', async () => {
      const initialCoinCount = 15;
      const feature = 'Nim';

      const savedStore: DatabaseStore = {
        _id: new ObjectId(),
        username: user.username,
        coinCount: initialCoinCount,
        unlockedFeatures: [],
      };

      mockingoose(UserModel).toReturn(user, 'findOne');
      mockingoose(StoreModel).toReturn(savedStore, 'findOne');
      mockingoose(FeatureModel).toReturn(nimDBFeature, 'findOne');
      (updateCoins as jest.Mock).mockResolvedValue(null);

      await expect(unlockFeature(user.username, feature)).rejects.toThrow(
        `Failed to unlock ${feature}.`,
      );
    });

    it('should throw an error if the function fails to update feature field', async () => {
      const initialCoinCount = 15;
      const feature = 'Nim';
      const cost = 5;

      const savedStore: DatabaseStore = {
        _id: new ObjectId(),
        username: user.username,
        coinCount: initialCoinCount,
        unlockedFeatures: [],
      };

      const updatedStore: DatabaseStore = {
        ...savedStore,
        coinCount: initialCoinCount - cost,
      };

      mockingoose(UserModel).toReturn(user, 'findOne');
      mockingoose(StoreModel).toReturn(savedStore, 'findOne');
      mockingoose(StoreModel).toReturn(updatedStore, 'findOneAndUpdate');
      (updateCoins as jest.Mock).mockResolvedValue(updatedStore);
      mockingoose(StoreModel).toReturn(null, 'findOneAndUpdate');
      mockingoose(FeatureModel).toReturn(nimDBFeature, 'findOne');

      await expect(unlockFeature(user.username, feature)).rejects.toThrow(
        `Error occurred when unlocking: Error: Failed to update features for Nim.`,
      );
    });

    it('should throw an error if the updateCoins function fails', async () => {
      const initialCoinCount = 15;
      const feature = 'Nim';

      const savedStore: DatabaseStore = {
        _id: new ObjectId(),
        username: user.username,
        coinCount: initialCoinCount,
        unlockedFeatures: [],
      };

      mockingoose(UserModel).toReturn(user, 'findOne');
      mockingoose(StoreModel).toReturn(savedStore, 'findOne');
      mockingoose(FeatureModel).toReturn(nimDBFeature, 'findOne');
      (updateCoins as jest.Mock).mockRejectedValue(new Error('Failed to update coins.'));

      await expect(unlockFeature(user.username, feature)).rejects.toThrow(
        'Failed to update coins.',
      );
    });
  });
});
