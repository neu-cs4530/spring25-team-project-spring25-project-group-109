import FeatureModel from '../models/feature.model';
import { DatabaseFeature, FeaturesResponse } from '../types/types';

/**
 * Retrieves all features from the database.
 *
 * @returns {Promise<FeaturesResponse>} - Resolves with the found feature objects or an error message.
 */
const getFeaturesList = async (): Promise<FeaturesResponse> => {
  try {
    const features: DatabaseFeature[] = await FeatureModel.find();

    if (!features) {
      throw Error('Features could not be retrieved');
    }

    return features;
  } catch (error) {
    return { error: `Error occurred when finding features: ${error}` };
  }
};

export default getFeaturesList;
