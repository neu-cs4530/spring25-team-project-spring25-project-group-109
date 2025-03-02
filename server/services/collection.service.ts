import CollectionModel from '../models/collections.model';
import UserModel from '../models/users.model';
import {
  DatabaseCollection,
  Collection,
  CollectionResponse,
  CollectionsResponse,
  DatabaseUser,
} from '../types/types';

/**
 * Saves a new collection to the database.
 *
 * @param {Collection} collection - the collection object to be saved.
 * @returns {Promise<CollectionResponse>} - resolves with the saved collection object or an error message.
 */
export const saveCollection = async (collection: Collection): Promise<CollectionResponse> => {
  try {
    const userExists: DatabaseUser | null = await UserModel.findOne({
      username: collection.username,
    });

    if (!userExists) {
      throw new Error('User does not exist.');
    }

    const result: DatabaseCollection = await CollectionModel.create(collection);
    return result;
  } catch (error) {
    return { error: `Error occurred when saving collection: ${error}` };
  }
};

/**
 * Retrieves all collections of the provided user.
 *
 * @param username - the username of the user.
 * @returns {Promise<CollectionsResponse>} - an array of collections or an empty array.
 */
export const getCollectionsByUser = async (username: string): Promise<CollectionsResponse> => {
  try {
    const userExists: DatabaseUser | null = await UserModel.findOne({ username });

    if (!userExists) {
      throw new Error('User does not exist.');
    }

    const collections = await CollectionModel.find({ username }).lean();

    if (!collections) {
      throw new Error('Collections not found for the provided user');
    }

    return collections;
  } catch {
    return [];
  }
};
