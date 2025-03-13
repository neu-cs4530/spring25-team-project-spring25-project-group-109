import { DatabaseBadge } from '@fake-stack-overflow/shared';
import BadgeModel from '../../models/badge.model';
import { saveBadge } from '../../services/badge.service';
import { badge } from '../mockData.models';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const mockingoose = require('mockingoose');

describe('User model', () => {
  beforeEach(() => {
    mockingoose.resetAll();
  });

  describe('saveBadge', () => {
    beforeEach(() => {
      mockingoose.resetAll();
    });

    it('should return the saved badge', async () => {
      mockingoose(BadgeModel).toReturn(badge, 'create');

      const savedBadge = (await saveBadge(badge)) as DatabaseBadge;

      expect(savedBadge._id).toBeDefined();
      expect(savedBadge.description).toEqual(badge.description);
      expect(savedBadge.imagePath).toEqual(badge.imagePath);
      expect(savedBadge.name).toEqual(badge.name);
      expect(savedBadge.threshold).toEqual(badge.threshold);
      expect(savedBadge.type).toEqual(badge.type);
    });

    it('should throw an error if error when saving to database', async () => {
      jest
        .spyOn(BadgeModel, 'create')
        .mockRejectedValueOnce(() => new Error('Error saving document'));

      const saveError = await saveBadge(badge);

      expect('error' in saveError).toBe(true);
    });
  });
});
