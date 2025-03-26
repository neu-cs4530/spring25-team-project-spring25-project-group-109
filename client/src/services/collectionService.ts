import { Collection, DatabaseCollection } from '../types/types';
import api from './config';

const COLLECTION_API_URL = `${process.env.REACT_APP_SERVER_URL}/collection`;

/**
 * Function to create a new collection.
 * @param collection The collection object to create.
 * @returns A promise resolving to the created collection instance.
 * @throws Error if there is an issue while creating the collection.
 */

const createCollection = async (collection: Collection): Promise<DatabaseCollection> => {
  const res = await api.post(`${COLLECTION_API_URL}/createCollection`, collection);

  if (res.status !== 200) {
    throw new Error('Error while creating a new collection');
  }

  return res.data;
};

/**
 * Function to get collections by username.
 * @param username The username to fetch collections for.
 * @returns A promise resolving to the user's collections.
 * @throws Error if there is an issue while fetching the collections.
 */

const getCollectionsByUsername = async (
  username: string,
  requestingUser: string,
): Promise<DatabaseCollection[]> => {
  const res = await api.get(
    `${COLLECTION_API_URL}/getCollectionsByUser/${username}?requestingUser=${requestingUser}`,
  );

  if (res.status !== 200) {
    throw new Error('Error while fetching collections');
  }

  return res.data;
};

/**
 * Function to add a question to a collection.
 * @param collectionId The ID of the collection to add the question to.
 * @param questionId The ID of the question to add.
 * @returns A promise resolving to the updated collection instance.
 * @throws Error if there is an issue while adding the question to the collection.
 */
const addQuestionToCollection = async (
  collectionId: string,
  questionId: string,
): Promise<DatabaseCollection> => {
  const res = await api.patch(`${COLLECTION_API_URL}/addQuestion/${collectionId}`, {
    questionId,
  });

  if (res.status !== 200) {
    throw new Error('Error while adding question to collection');
  }

  return res.data;
};

const removeQuestionFromCollection = async (
  collectionId: string,
  questionId: string,
): Promise<DatabaseCollection> => {
  const res = await api.patch(`${COLLECTION_API_URL}/removeQuestion/${collectionId}`, {
    questionId,
  });

  if (res.status !== 200) {
    throw new Error('Error while removing question to collection');
  }

  return res.data;
};

const renameCollection = async (
  collectionId: string,
  name: string,
): Promise<DatabaseCollection> => {
  const res = await api.patch(`${COLLECTION_API_URL}/updateCollectionName/${collectionId}`, {
    name,
  });
  if (res.status !== 200) {
    throw new Error('Error while adding question to collection');
  }

  return res.data;
};

const deleteCollection = async (collectionId: string): Promise<DatabaseCollection> => {
  const res = await api.delete(`${COLLECTION_API_URL}/deleteCollection/${collectionId}`);
  if (res.status !== 200) {
    throw new Error('Error while deleting collection');
  }
  return res.data;
};

const updateCollectionVisibility = async (
  collectionId: string,
  visibility: string,
): Promise<DatabaseCollection> => {
  const res = await api.patch(`${COLLECTION_API_URL}/updateCollectionVisibility/${collectionId}`, {
    visibility,
  });
  if (res.status !== 200) {
    throw new Error('Error while updating collection visibility');
  }
  return res.data;
};

export {
  createCollection,
  getCollectionsByUsername,
  addQuestionToCollection,
  renameCollection,
  deleteCollection,
  updateCollectionVisibility,
  removeQuestionFromCollection,
};
