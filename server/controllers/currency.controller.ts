import express, { Response } from 'express';
import {
  CreateCurrencyRequest,
  GetCurrencyByUserRequest,
  UnlockFeatureRequest,
} from '../types/types';
import { saveCurrency, getCurrency, unlockFeature } from '../services/currency.service';

const currencyController = () => {
  const router = express.Router();

  const isCreateCurrencyRequestValid = (req: CreateCurrencyRequest): boolean => {
    const { username, coinCount, customPhoto, nim } = req.body;
    return (
      username !== undefined &&
      coinCount !== undefined &&
      customPhoto !== undefined &&
      nim !== undefined
    );
  };

  const isUpdateFeatureRequestValid = (req: UnlockFeatureRequest): boolean => {
    const { username, feature, cost } = req.body;
    return !!username && !!feature && !!cost;
  };

  /**
   * Creates a new currency object.
   *
   * @param req the request object containing the currency data.
   * @param res the response object to send the result.
   * @returns {Promise<void>} a promise that resolves when the currency is created.
   */
  const createCurrencyRoute = async (req: CreateCurrencyRequest, res: Response): Promise<void> => {
    if (!req.body || !isCreateCurrencyRequestValid(req)) {
      res.status(400).send('Invalid currency creation request');
      return;
    }

    const { username, coinCount, customPhoto, nim } = req.body;

    try {
      const savedCurrency = await saveCurrency({ username, coinCount, customPhoto, nim });

      res.status(200).json(savedCurrency);
    } catch (err: unknown) {
      res.status(500).send(`Error saving currency: ${(err as Error).message}`);
    }
  };

  /**
   * Gets the currency data for a user.
   *
   * @param req the request object containing the user's username.
   * @param res the response object to send the result.
   * @returns {Promise<void>} a promise that resolves when the currency data is retrieved.
   */
  const getCurrenyByUserRoute = async (
    req: GetCurrencyByUserRequest,
    res: Response,
  ): Promise<void> => {
    const { username } = req.params;

    try {
      const currency = await getCurrency(username);

      res.status(200).json(currency);
    } catch (err: unknown) {
      res.status(500).send(`Error fetching currency: ${(err as Error).message}`);
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
    if (!req.body || !isUpdateFeatureRequestValid(req)) {
      res.status(400).send('Invalid unlock feature request');
      return;
    }

    const { username, feature, cost } = req.body;

    try {
      const response = await unlockFeature(username, feature, cost);

      res.status(200).json(response);
    } catch (err: unknown) {
      res.status(500).send(`Error unlocking feature: ${(err as Error).message}`);
    }
  };

  router.post('/createCurrency', createCurrencyRoute);
  router.get('/getCurrencyByUser/:username', getCurrenyByUserRoute);
  router.post('/unlockFeature', unlockFeatureRoute);

  return router;
};

export default currencyController;
