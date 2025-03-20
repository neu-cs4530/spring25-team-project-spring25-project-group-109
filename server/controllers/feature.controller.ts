import express, { Request, Response, Router } from 'express';
import getFeaturesList from '../services/feature.service';

const featureController = () => {
  const router: Router = express.Router();

  /**
   * Retrieves all features from the database.
   * Feature documents are returned in the order of price
   * @param res The response, either returning the features or an error.
   * @returns A promise resolving to void.
   */
  const getFeatures = async (_: Request, res: Response): Promise<void> => {
    try {
      const features = await getFeaturesList();

      if ('error' in features) {
        throw Error(features.error);
      }

      res.status(200).json(features.sort((a, b) => a.price - b.price));
    } catch (error) {
      res.status(500).send(`Error when getting features: ${error}`);
    }
  };

  router.get('/getFeatures', getFeatures);
  return router;
};

export default featureController;
