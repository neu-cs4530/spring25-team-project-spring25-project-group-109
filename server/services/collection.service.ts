import CollectionModel from '../models/collections.model';
import UserModel from '../models/users.model';
import QuestionModel from '../models/questions.model';
import { populateDocument } from '../utils/database.util';
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

    const populatedCollections = await Promise.all(
      collections.map(async collection => ({
        ...collection,
        questions: await Promise.all(
          collection.questions.map((questionId: string) =>
            populateDocument(questionId, 'question'),
          ),
        ),
      })),
    );

    return populatedCollections;
  } catch {
    return [];
  }
};

/**
 * Deletes a collection from the database by its id.
 *
 * @param {string} collectionId - the id of the collection to be deleted.
 * @returns {Promise<CollectionResponse>} - resolves with the deleted collection object or an error message.
 */

export const deleteCollection = async (collectionId: string): Promise<CollectionResponse> => {
  try {
    const deletedCollection: DatabaseCollection | null =
      await CollectionModel.findByIdAndDelete(collectionId);

    if (!deletedCollection) {
      throw new Error('Error deleting collection');
    }

    return deletedCollection;
  } catch (error) {
    return { error: `Error occurred when deleting collection: ${error}` };
  }
};

/**
 * Updates a collection in the database.
 *
 * @param {string} collectionId - the id of the collection to be updated.
 * @param {Partial<Collection>} updates - an object containing the fields to update and their new values.
 * @returns {Promise<CollectionResponse>} - resolves with the updated collection object or an error message.
 */

export const updateCollection = async (
  collectionId: string,
  updates: Partial<Collection>,
): Promise<CollectionResponse> => {
  try {
    const updatedCollection: DatabaseCollection | null = await CollectionModel.findByIdAndUpdate(
      collectionId,
      { $set: updates },
      { new: true },
    );

    if (!updatedCollection) {
      throw new Error('Collection not found');
    }

    return updatedCollection;
  } catch (error) {
    return { error: `Error occurred when updating collection: ${error}` };
  }
};

/**
 * Adds a question to a collection.
 * @param {string} collectionId - the id of the collection to which the question will be added.
 * @param {string} questionId - the id of the question to be added.
 * @returns {Promise<CollectionResponse>} - resolves with the updated collection object or an error message.
 */
export const addQuestionToCollection = async (
  collectionId: string,
  questionId: string,
): Promise<CollectionResponse> => {
  try {
    const questionExists = await QuestionModel.findById(questionId);
    if (!questionExists) {
      throw new Error('Question not found');
    }

    const updatedCollection: DatabaseCollection | null = await CollectionModel.findByIdAndUpdate(
      collectionId,
      { $addToSet: { questions: questionId } },
      { new: true },
    );

    if (!updatedCollection) {
      throw new Error('Collection not found');
    }

    return updatedCollection;
  } catch (error) {
    return { error: `Error adding question to collection: ${error}` };
  }
};

/**
 * Removes a question from a collection.
 * @param {string} collectionId - the id of the collection from which the question will be removed.
 * @param {string} questionId - the id of the question to be removed.
 * @returns {Promise<CollectionResponse>} - resolves with the updated collection object or an error message.
 */
export const removeQuestionFromCollection = async (
  collectionId: string,
  questionId: string,
): Promise<CollectionResponse> => {
  try {
    const questionExists = await QuestionModel.findById(questionId);
    if (!questionExists) {
      throw new Error('Question not found');
    }

    const updatedCollection: DatabaseCollection | null = await CollectionModel.findByIdAndUpdate(
      collectionId,
      { $pull: { questions: questionId } },
      { new: true },
    );

    if (!updatedCollection) {
      throw new Error('Collection not found');
    }

    return updatedCollection;
  } catch (error) {
    return { error: `Error removing question from collection: ${error}` };
  }
};
