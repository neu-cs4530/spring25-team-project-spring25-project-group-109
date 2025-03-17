import express, { Response } from 'express';
import {
  CreateCollectionRequest,
  CollectionByIdRequest,
  GetCollectionsByUserRequest,
  UpdateCollectionVisibilityRequest,
  UpdateCollectionNameRequest,
  QuestionToCollectionRequest,
  FakeSOSocket,
} from '../types/types';
import {
  saveCollection,
  getCollectionsByUser,
  deleteCollection,
  updateCollection,
  addQuestionToCollection,
  removeQuestionFromCollection,
} from '../services/collection.service';

const collectionController = (socket: FakeSOSocket) => {
  const router = express.Router();
  /**
   * Validates that the request body contains all required fields for a chat.
   *
   * @param req The incoming request containing chat data.
   * @returns `true` if the body contains valid chat fields; otherwise, `false`.
   */
  const isCreateCollectionRequestValid = (req: CreateCollectionRequest): boolean => {
    const { name, username, questions } = req.body;
    return !!name && !!username && Array.isArray(questions);
  };

  /**
   * Validates that the request body contains all required fields to update a collection's visibility.
   * @param req The incoming request containing collection data.
   * @returns `true` if the body contains valid collection fields; otherwise, `false`.
   */
  const isUpdateCollectionVisibilityRequestValid = (
    req: UpdateCollectionVisibilityRequest,
  ): boolean =>
    req.params !== undefined &&
    req.params.id !== undefined &&
    req.body !== undefined &&
    req.body.visibility !== undefined &&
    (req.body.visibility === 'public' || req.body.visibility === 'private');

  /**
   * Validates that the request body contains all required fields to update a collection's name.
   * @param req The incoming request containing collection data.
   * @returns `true` if the body contains valid collection fields; otherwise, `false`.
   */
  const isUpdateCollectionNameRequestValid = (req: UpdateCollectionNameRequest): boolean =>
    req.params !== undefined &&
    req.params.id !== undefined &&
    req.body !== undefined &&
    req.body.name !== undefined;

  /**
   * Validates that the request body contains all required fields to add/delete a question to a collection.
   * @param req The incoming request containing collection data.
   * @returns `true` if the body contains valid collection fields; otherwise, `false`.
   */
  const isQuestionToCollectionRequestValid = (req: QuestionToCollectionRequest): boolean =>
    req.params !== undefined &&
    req.params.id !== undefined &&
    req.body !== undefined &&
    req.body.questionId !== undefined;

  /**
   * Creates a new collection.
   *
   * @param req the request object containing the collection data.
   * @param res the response object to send the result.
   * @returns {Promise<void>} a promise that resolves when the collection is created.
   */
  const createCollectionRoute = async (
    req: CreateCollectionRequest,
    res: Response,
  ): Promise<void> => {
    if (!req.body || !isCreateCollectionRequestValid(req)) {
      res.status(400).send('Invalid collection creation request');
      return;
    }

    const { name, username, questions, visibility } = req.body;

    try {
      const savedCollection = await saveCollection({ name, username, questions, visibility });

      if ('error' in savedCollection) {
        throw new Error(savedCollection.error);
      }

      socket.emit('collectionUpdate', { collection: savedCollection, type: 'created' });
      res.status(200).json(savedCollection);
    } catch (err: unknown) {
      res.status(500).send(`Error creating a collection: ${(err as Error).message}`);
    }
  };

  /**
   * Retrieves collections of a user based on their username.
   *
   * @param req the request object containing the username parameter in `req.params`.
   * @param res the response object to send the result, either the collections or an error message.
   * @returns {Promise<void>} a promise that resolves when the collections are successfully retrieved.
   */
  const getCollectionsByUserRoute = async (
    req: GetCollectionsByUserRequest,
    res: Response,
  ): Promise<void> => {
    const { username } = req.params;

    try {
      const collections = await getCollectionsByUser(username);

      if ('error' in collections) {
        throw new Error(collections.error);
      }

      res.status(200).json(collections);
    } catch (err: unknown) {
      res.status(500).send(`Error retrieving collections: ${(err as Error).message}`);
    }
  };

  /**
   * Deletes a collection by its ID.
   * @param req the request object containing the collection ID in `req.params`.
   * @param res the response object to send the result, either a success message or an error.
   * @returns {Promise<void>} a promise that resolves when the collection is successfully deleted.
   */
  const deleteCollectionRoute = async (
    req: CollectionByIdRequest,
    res: Response,
  ): Promise<void> => {
    try {
      const { id } = req.params;

      const deletedCollection = await deleteCollection(id);

      if ('error' in deletedCollection) {
        throw new Error(deletedCollection.error);
      }

      socket.emit('collectionUpdate', { collection: deletedCollection, type: 'deleted' });
      res.status(200).json(deletedCollection);
    } catch (err: unknown) {
      res.status(500).send(`Error deleting collection: ${(err as Error).message}`);
    }
  };

  /**
   * Toggles the visibility of a collection.
   * @param req the request object containing the collection ID and new visibility in the body.
   * @param res the response object to send the result, either a success message or an error.
   * @returns {Promise<void>} a promise that resolves when the collection's visibility is successfully updated.
   */
  const updateCollectionVisibility = async (
    req: UpdateCollectionVisibilityRequest,
    res: Response,
  ): Promise<void> => {
    try {
      if (!isUpdateCollectionVisibilityRequestValid(req)) {
        res.status(400).send('Invalid update collection visibility request');
        return;
      }
      const { id } = req.params;
      const { visibility } = req.body;
      const updatedCollection = await updateCollection(id, { visibility });
      if ('error' in updatedCollection) {
        throw new Error(updatedCollection.error);
      }

      socket.emit('collectionUpdate', { collection: updatedCollection, type: 'updated' });
      res.status(200).json(updatedCollection);
    } catch (err: unknown) {
      res.status(500).send(`Error updating collection visibility: ${(err as Error).message}`);
    }
  };

  /**
   * Updates a collection's name.
   * @param req the request object containing the collection ID and new name in the body.
   * @param res the response object to send the result, either a success message or an error.
   * @return {Promise<void>} a promise that resolves when the collection's name is successfully updated.
   */
  const updateCollectionName = async (
    req: UpdateCollectionNameRequest,
    res: Response,
  ): Promise<void> => {
    try {
      if (!isUpdateCollectionNameRequestValid(req)) {
        res.status(400).send('Invalid update collection name request');
        return;
      }
      const { id } = req.params;
      const { name } = req.body;
      const updatedCollection = await updateCollection(id, { name });
      if ('error' in updatedCollection) {
        throw new Error(updatedCollection.error);
      }

      socket.emit('collectionUpdate', { collection: updatedCollection, type: 'updated' });
      res.status(200).json(updatedCollection);
    } catch (err: unknown) {
      res.status(500).send(`Error updating collection name: ${(err as Error).message}`);
    }
  };

  /**
   * Adds an existing question to a collection.
   * @param req the request object containing the collection ID and question ID in the body.
   * @param res the response object to send the result, either a success message or an error.
   * @return {Promise<void>} a promise that resolves when the question is successfully added to the collection.
   */
  const addQuestion = async (req: QuestionToCollectionRequest, res: Response): Promise<void> => {
    if (!isQuestionToCollectionRequestValid(req)) {
      res.status(400).send('Invalid add question to collection request');
      return;
    }
    try {
      const { id } = req.params;
      const { questionId } = req.body;
      const updatedCollection = await addQuestionToCollection(id, questionId);
      if ('error' in updatedCollection) {
        throw new Error(updatedCollection.error);
      }

      socket.emit('collectionUpdate', { collection: updatedCollection, type: 'updated' });
      res.status(200).json(updatedCollection);
    } catch (err: unknown) {
      res.status(500).send(`Error adding question to collection: ${(err as Error).message}`);
    }
  };

  /**
   * Removes a question from a collection.
   * @param req the request object containing the collection ID and question ID in the body.
   * @param res the response object to send the result, either a success message or an error.
   * @return {Promise<void>} a promise that resolves when the question is successfully removed from the collection.
   */
  const removeQuestion = async (req: QuestionToCollectionRequest, res: Response): Promise<void> => {
    if (!isQuestionToCollectionRequestValid(req)) {
      res.status(400).send('Invalid remove question from collection request');
      return;
    }
    try {
      const { id } = req.params;
      const { questionId } = req.body;
      const updatedCollection = await removeQuestionFromCollection(id, questionId);
      if ('error' in updatedCollection) {
        throw new Error(updatedCollection.error);
      }

      socket.emit('collectionUpdate', { collection: updatedCollection, type: 'updated' });
      res.status(200).json(updatedCollection);
    } catch (err: unknown) {
      res.status(500).send(`Error removing question from collection: ${(err as Error).message}`);
    }
  };

  router.post('/createCollection', createCollectionRoute);
  router.get('/getCollectionsByUser/:username', getCollectionsByUserRoute);
  router.delete('/deleteCollection/:id', deleteCollectionRoute);
  router.patch('/updateCollectionVisibility/:id', updateCollectionVisibility);
  router.patch('/updateCollectionName/:id', updateCollectionName);
  router.patch('/addQuestion/:id', addQuestion);
  router.patch('/removeQuestion/:id', removeQuestion);

  return router;
};

export default collectionController;
