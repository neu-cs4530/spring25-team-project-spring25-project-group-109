import { ObjectId } from 'mongodb';
import { DatabaseFeature } from '../../types/types';
import getFeaturesList from '../../services/feature.service';
import FeatureModel from '../../models/feature.model';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const mockingoose = require('mockingoose');

const mockFeature: DatabaseFeature = {
  _id: new ObjectId(),
  name: 'Nim',
  description: 'Nim game',
  price: 0,
};

describe('getFeaturesList', () => {
  beforeEach(() => {
    mockingoose.resetAll();
  });

  it('should return the users', async () => {
    mockingoose(FeatureModel).toReturn([mockFeature], 'find');

    const retrievedFeature = (await getFeaturesList()) as DatabaseFeature[];

    expect(retrievedFeature[0].name).toEqual(mockFeature.name);
    expect(retrievedFeature[0].description).toEqual(mockFeature.description);
    expect(retrievedFeature[0].price).toEqual(mockFeature.price);
  });

  it('should throw an error if the users cannot be found', async () => {
    mockingoose(FeatureModel).toReturn(null, 'find');

    const getFeaturesError = await getFeaturesList();

    expect('error' in getFeaturesError).toBe(true);
  });

  it('should throw an error if there is an error while searching the database', async () => {
    mockingoose(FeatureModel).toReturn(new Error('Error finding document'), 'find');

    const getFeaturesError = await getFeaturesList();

    expect('error' in getFeaturesError).toBe(true);
  });
});
