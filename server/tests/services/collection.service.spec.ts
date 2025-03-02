import { ObjectId } from 'mongodb';
import CollectionModel from '../../models/collections.model';
import UserModel from '../../models/users.model';
import { saveCollection, getCollectionsByUser } from '../../services/collection.service';
import { Collection, DatabaseCollection } from '../../types/types';
import { user } from '../mockData.models';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const mockingoose = require('mockingoose');

const collection: Collection = {
  name: 'favorites',
  username: user.username,
  questions: [],
  visibility: 'public',
};

const savedCollection: DatabaseCollection = {
  _id: new ObjectId(),
  name: 'favorites',
  username: user.username,
  questions: [],
  visibility: 'public',
};

describe('Test Collection Service', () => {
  beforeEach(() => {
    mockingoose.resetAll();
  });

  describe('saveCollection', () => {
    it('should return the saved collection', async () => {
      mockingoose(UserModel).toReturn(user, 'findOne');
      mockingoose(CollectionModel).toReturn(collection, 'create');

      const result = (await saveCollection(collection)) as DatabaseCollection;

      expect(result._id).toBeDefined();
      expect(result.name).toEqual(collection.name);
      expect(result.username).toEqual(collection.username);
      expect(result.questions).toEqual(collection.questions);
      expect(result.visibility).toEqual(collection.visibility);
    });

    it('should return an error if the user is not found', async () => {
      mockingoose(UserModel).toReturn(null, 'findOne');

      const result = (await saveCollection(collection)) as DatabaseCollection;

      expect('error' in result).toBe(true);
      if ('error' in result) {
        expect(result.error).toContain('User does not exist');
      }
    });

    it('should return an error if an exception occurs', async () => {
      mockingoose(UserModel).toReturn(user, 'findOne');
      jest.spyOn(CollectionModel, 'create').mockRejectedValueOnce(new Error('DB Error'));

      const result = (await saveCollection(collection)) as DatabaseCollection;

      expect('error' in result).toBe(true);
      if ('error' in result) {
        expect(result.error).toContain('Error occurred when saving collection:');
      }
    });
  });

  describe('getCollectionsByUser', () => {
    it('should return the collections of the provided user', async () => {
      mockingoose(UserModel).toReturn(user, 'findOne');
      mockingoose(CollectionModel).toReturn([savedCollection], 'find');

      const collections = await getCollectionsByUser(user.username);

      expect(collections).toHaveLength(1);
      expect(collections).toEqual([savedCollection]);
    });

    it('should return an empty array if the user is not found', async () => {
      mockingoose(UserModel).toReturn(null, 'findOne');

      const result = await getCollectionsByUser(user.username);

      expect(result).toHaveLength(0);
    });

    it('should return an empty array if the there are no collections', async () => {
      mockingoose(UserModel).toReturn(user, 'findOne');
      mockingoose(CollectionModel).toReturn(null, 'find');

      const result = await getCollectionsByUser(user.username);

      expect(result).toHaveLength(0);
    });
  });
});
