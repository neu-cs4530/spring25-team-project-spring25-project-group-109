import express, { Response } from 'express';
import { CreateCollectionRequest, GetCollectionsByUserRequest } from '../types/types';
import { saveCollection, getCollectionsByUser } from '../services/collection.service';

const collectionController = () => {
  const router = express.Router();
  /**
   * Validates that the request body contains all required fields for a collection.
   *
   * @param req The incoming request containing collection data.
   * @returns `true` if the body contains valid collection fields; otherwise, `false`.
   */
  const isCreateCollectionRequestValid = (req: CreateCollectionRequest): boolean => {
    const { name, username, questions } = req.body;
    return !!name && !!username && Array.isArray(questions);
  };

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

  router.post('/createCollection', createCollectionRoute);
  router.get('/getCollectionsByUser/:username', getCollectionsByUserRoute);

  return router;
};

export default collectionController;
