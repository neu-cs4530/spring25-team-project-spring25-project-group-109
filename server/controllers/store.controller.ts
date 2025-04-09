import express, { Response } from 'express';
import { CreateStoreRequest, GetStoreByUserRequest, UnlockFeatureRequest } from '../types/types';
import { saveStore, getStore, unlockFeature } from '../services/store.service';

const storeController = () => {
  const router = express.Router();

  const isCreateStoreRequestValid = (req: CreateStoreRequest): boolean => {
    const { username, coinCount, unlockedFeatures } = req.body;
    return username !== undefined && coinCount !== undefined && unlockedFeatures !== undefined;
  };

  const isUpdateFeatureRequestValid = (req: UnlockFeatureRequest): boolean =>
    req.body.username !== null &&
    req.body.username !== undefined &&
    req.body.username !== '' &&
    req.body.featureName !== null &&
    req.body.featureName !== undefined;

  /**
   * Creates a new store object.
   *
   * @param req the request object containing the store data.
   * @param res the response object to send the result.
   * @returns {Promise<void>} a promise that resolves when the store is created.
   */
  const createStoreRoute = async (req: CreateStoreRequest, res: Response): Promise<void> => {
    if (!req.body || !isCreateStoreRequestValid(req)) {
      res.status(400).send('Invalid store creation request');
      return;
    }

    const { username, coinCount, unlockedFeatures } = req.body;

    try {
      const savedStore = await saveStore({ username, coinCount, unlockedFeatures });
      if ('error' in savedStore) {
        throw new Error(savedStore.error);
      }
      res.status(200).json(savedStore);
    } catch (err: unknown) {
      res.status(500).send(`Error saving store: ${(err as Error).message}`);
    }
  };

  /**
   * Gets the store data for a user.
   *
   * @param req the request object containing the user's username.
   * @param res the response object to send the result.
   * @returns {Promise<void>} a promise that resolves when the store data is retrieved.
   */
  const getStoreByUserRoute = async (req: GetStoreByUserRequest, res: Response): Promise<void> => {
    const { username } = req.params;

    try {
      const store = await getStore(username);
      if ('error' in store) {
        throw new Error(store.error);
      }
      res.status(200).json(store);
    } catch (err: unknown) {
      res.status(500).send(`Error fetching store: ${(err as Error).message}`);
    }
  };

  /**
   * Unlocks a feature.
   *
   * @param req the request object containing the unlock feature data.
   * @param res the response object to send the result.
   * @returns {Promise<void>} a promise that resolves when the feature is unlocked.
   */
  const unlockFeatureRoute = async (req: UnlockFeatureRequest, res: Response): Promise<void> => {
    if (!isUpdateFeatureRequestValid(req)) {
      res.status(400).send('Invalid unlock feature request');
      return;
    }

    const { username, featureName } = req.body;

    try {
      const response = await unlockFeature(username, featureName);
      if ('error' in response) {
        throw new Error(response.error);
      }
      res.status(200).json(response);
    } catch (err: unknown) {
      res.status(500).send(`Error unlocking feature: ${(err as Error).message}`);
    }
  };

  router.post('/createStore', createStoreRoute);
  router.get('/getStoreByUser/:username', getStoreByUserRoute);
  router.patch('/unlockFeature', unlockFeatureRoute);

  return router;
};

export default storeController;
