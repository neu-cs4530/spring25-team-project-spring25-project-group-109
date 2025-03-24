import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';
import CollectionModel from '../../models/collections.model';
import UserModel from '../../models/users.model';
import QuestionModel from '../../models/questions.model';
import {
  saveCollection,
  getCollectionsByUser,
  deleteCollection,
  updateCollection,
  addQuestionToCollection,
  removeQuestionFromCollection,
} from '../../services/collection.service';
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

    it('should return an error if the collection already exists', async () => {
      mockingoose(UserModel).toReturn(user, 'findOne');
      mockingoose(CollectionModel).toReturn(savedCollection, 'findOne');
      const result = (await saveCollection(collection)) as DatabaseCollection;
      expect('error' in result).toBe(true);
      if ('error' in result) {
        expect(result.error).toContain('Collection with the same name already exists');
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

  describe('deleteCollection', () => {
    it('should delete the collection successfully', async () => {
      const collectionId = new mongoose.Types.ObjectId().toString();
      const existingCollection: DatabaseCollection = {
        _id: new ObjectId(collectionId),
        name: 'favorites',
        username: user.username,
        questions: [],
        visibility: 'public',
      };
      mockingoose(CollectionModel).toReturn(existingCollection, 'findOneAndDelete');
      const result = await deleteCollection(collectionId);
      if ('error' in result) {
        throw new Error(result.error);
      }
      expect(result).toBeDefined();
      expect(result._id.toString()).toBe(collectionId);
      expect(result.name).toBe(existingCollection.name);
      expect(result.username).toBe(existingCollection.username);
      expect(result.questions).toEqual(existingCollection.questions);
      expect(result.visibility).toBe(existingCollection.visibility);
    });

    it('should return an error if the collection is not found', async () => {
      const collectionId = new mongoose.Types.ObjectId().toString();

      mockingoose(CollectionModel).toReturn(null, 'findByIdAndDelete');

      const result = await deleteCollection(collectionId);

      expect('error' in result).toBe(true);
      if ('error' in result) {
        expect(result.error).toContain('Error deleting collection');
      }
    });
  });

  describe('updateCollection', () => {
    it('should update the collection successfully', async () => {
      const collectionId = new mongoose.Types.ObjectId().toString();
      const updates: Partial<Collection> = { name: 'Updated Collection' };

      const existingCollection: DatabaseCollection = {
        _id: new ObjectId(collectionId),
        name: 'Old Collection',
        username: 'testUser',
        questions: [],
        visibility: 'public',
      };

      const updatedCollection = { ...existingCollection, ...updates };

      mockingoose(CollectionModel).toReturn(updatedCollection, 'findOneAndUpdate');

      const result = await updateCollection(collectionId, updates);
      if ('error' in result) {
        throw new Error(result.error);
      }

      expect(result).toBeDefined();
      expect(result.name).toBe(updates.name);
      expect(result.username).toBe(existingCollection.username);
      expect(result.questions).toEqual(existingCollection.questions);
      expect(result.visibility).toBe(existingCollection.visibility);
      expect(result._id.toString()).toBe(collectionId);
    });

    it('should return an error if the collection is not found', async () => {
      const collectionId = new mongoose.Types.ObjectId().toString();
      const updates: Partial<Collection> = { name: 'Updated Collection' };

      mockingoose(CollectionModel).toReturn(null, 'findByIdAndUpdate');

      const result = await updateCollection(collectionId, updates);

      expect('error' in result).toBe(true);
      if ('error' in result) {
        expect(result.error).toContain('Error occurred when updating collection');
      }
    });
  });

  describe('addQuestionToCollection', () => {
    it('should add a question to the collection successfully', async () => {
      const collectionId = new mongoose.Types.ObjectId().toString();
      const questionId = new mongoose.Types.ObjectId();

      const existingCollection: DatabaseCollection = {
        _id: new ObjectId(collectionId),
        name: 'favorites',
        username: user.username,
        questions: [],
        visibility: 'public',
      };

      const updatedCollection: DatabaseCollection = {
        ...existingCollection,
        questions: [questionId],
      };

      mockingoose(QuestionModel).toReturn({ _id: questionId }, 'findOne');
      mockingoose(CollectionModel).toReturn(existingCollection, 'findOne');
      mockingoose(CollectionModel).toReturn(updatedCollection, 'findOneAndUpdate');

      const result = await addQuestionToCollection(collectionId, questionId.toString());
      if ('error' in result) {
        throw new Error(result.error);
      }

      expect(result).toBeDefined();
      expect(result.questions).toEqual([questionId]);
    });

    it('should return an error if the question is not found', async () => {
      const collectionId = new mongoose.Types.ObjectId().toString();
      const questionId = new mongoose.Types.ObjectId().toString();

      mockingoose(QuestionModel).toReturn(null, 'findOne');

      const result = await addQuestionToCollection(collectionId, questionId);

      expect('error' in result).toBe(true);
      if ('error' in result) {
        expect(result.error).toContain(
          'Error adding question to collection: Error: Question not found',
        );
      }
    });

    it('should return an error if the collection is not found', async () => {
      const collectionId = new mongoose.Types.ObjectId().toString();
      const questionId = new mongoose.Types.ObjectId().toString();

      mockingoose(QuestionModel).toReturn({ _id: questionId }, 'findOne');
      mockingoose(CollectionModel).toReturn(null, 'findOneAndUpdate');

      const result = await addQuestionToCollection(collectionId, questionId);

      expect('error' in result).toBe(true);
      if ('error' in result) {
        expect(result.error).toContain(
          'Error adding question to collection: Error: Collection not found',
        );
      }
    });

    it('should return an error if the question is already in the collection', async () => {
      const collectionId = new mongoose.Types.ObjectId().toString();
      const questionId = new mongoose.Types.ObjectId();

      const existingCollection: DatabaseCollection = {
        _id: new ObjectId(collectionId),
        name: 'favorites',
        username: user.username,
        questions: [questionId],
        visibility: 'public',
      };

      mockingoose(QuestionModel).toReturn({ _id: questionId }, 'findOne');
      mockingoose(CollectionModel).toReturn(existingCollection, 'findOne');

      const result = await addQuestionToCollection(collectionId, questionId.toString());

      expect('error' in result).toBe(true);
      if ('error' in result) {
        expect(result.error).toContain('Question is already in the collection.');
      }
    });
  });

  describe('removeQuestionFromCollection', () => {
    it('should remove a question from the collection successfully', async () => {
      const collectionId = new mongoose.Types.ObjectId().toString();
      const questionId = new mongoose.Types.ObjectId();

      const existingCollection: DatabaseCollection = {
        _id: new ObjectId(collectionId),
        name: 'favorites',
        username: user.username,
        questions: [questionId],
        visibility: 'public',
      };

      const updatedCollection: DatabaseCollection = {
        ...existingCollection,
        questions: [],
      };

      mockingoose(QuestionModel).toReturn({ _id: questionId }, 'findOne');
      mockingoose(CollectionModel).toReturn(updatedCollection, 'findOneAndUpdate');

      const result = await removeQuestionFromCollection(collectionId, questionId.toString());
      if ('error' in result) {
        throw new Error(result.error);
      }

      expect(result).toBeDefined();
      expect(result.questions).toEqual([]);
    });

    it('should return an error if the question is not found', async () => {
      const collectionId = new mongoose.Types.ObjectId().toString();
      const questionId = new mongoose.Types.ObjectId().toString();

      mockingoose(QuestionModel).toReturn(null, 'findOne');

      const result = await removeQuestionFromCollection(collectionId, questionId);

      expect('error' in result).toBe(true);
      if ('error' in result) {
        expect(result.error).toContain(
          'Error removing question from collection: Error: Question not found',
        );
      }
    });

    it('should return an error if the collection is not found', async () => {
      const collectionId = new mongoose.Types.ObjectId().toString();
      const questionId = new mongoose.Types.ObjectId().toString();

      mockingoose(QuestionModel).toReturn({ _id: questionId }, 'findOne');
      mockingoose(CollectionModel).toReturn(null, 'findOneAndUpdate');

      const result = await removeQuestionFromCollection(collectionId, questionId);

      expect('error' in result).toBe(true);
      if ('error' in result) {
        expect(result.error).toContain(
          'Error removing question from collection: Error: Collection not found',
        );
      }
    });
  });
});
