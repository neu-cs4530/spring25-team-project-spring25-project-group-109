import { DatabaseBadge } from '@fake-stack-overflow/shared';
import BadgeModel from '../../models/badge.model';
import { checkAndAwardBadges, getBadgesList, saveBadge } from '../../services/badge.service';
import { badge, dbBadge, mockUserStatsFull, user } from '../mockData.models';
import UserModel from '../../models/users.model';
import UserStatsModel from '../../models/userstats.model';
import * as notifUtil from '../../services/notification.service';

const saveNotificationSpy = jest.spyOn(notifUtil, 'saveNotification');

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
      mockingoose(BadgeModel).toReturn(new Error('Error saving document'), '$save');

      const saveError = await saveBadge(badge);

      expect('error' in saveError).toBe(true);
      expect(saveError).toEqual({ error: 'Error creating user badge (Error saving document)' });
    });
  });

  describe('getBadgesList', () => {
    it('should properly return badges', async () => {
      mockingoose(BadgeModel).toReturn([badge], 'find');

      const badges = (await getBadgesList()) as DatabaseBadge[];
      expect(badges.length).toBe(1);
      expect(badges[0].name).toEqual(badge.name);
      expect(badges[0].description).toEqual(badge.description);
      expect(badges[0].imagePath).toEqual(badge.imagePath);
      expect(badges[0].threshold).toEqual(badge.threshold);
      expect(badges[0].type).toEqual(badge.type);
    });

    it('should return error if badge model errors', async () => {
      jest.spyOn(BadgeModel, 'find').mockRejectedValueOnce(() => new Error('Error'));

      const saveError = await getBadgesList();

      expect('error' in saveError).toBe(true);
    });

    it('should return empty array if badge model returns null', async () => {
      mockingoose(BadgeModel).toReturn(null, 'find');
      const badges = await getBadgesList();

      expect(badges).toEqual([]);
    });

    it('should return badges only of a specific type', async () => {
      mockingoose(BadgeModel).toReturn([badge], 'find');

      const badges = (await getBadgesList('question')) as DatabaseBadge[];
      expect(badges.length).toBe(1);
      expect(badges[0].name).toEqual(badge.name);
      expect(badges[0].description).toEqual(badge.description);
      expect(badges[0].imagePath).toEqual(badge.imagePath);
      expect(badges[0].threshold).toEqual(badge.threshold);
      expect(badges[0].type).toEqual(badge.type);
    });
  });

  describe('checkAndAwardBadges', () => {
    it('should properly award badges if user stats are high enough', async () => {
      mockingoose(UserModel).toReturn(user, 'findOne');
      mockingoose(UserStatsModel).toReturn(mockUserStatsFull, 'findOne');
      mockingoose(BadgeModel).toReturn([badge], 'find');

      const mockNotif = {
        username: user.username,
        text: `You have earned the badge ${badge.name}!`,
        seen: false,
        type: 'badge',
      };

      const badges = (await checkAndAwardBadges('user1')) as DatabaseBadge[];
      expect(badges.length).toEqual(1);
      expect(badges[0].description).toEqual(badge.description);
      expect(badges[0].imagePath).toEqual(badge.imagePath);
      expect(badges[0].name).toEqual(badge.name);
      expect(badges[0].threshold).toEqual(badge.threshold);
      expect(badges[0].type).toEqual(badge.type);
      expect(saveNotificationSpy).toHaveBeenCalledWith(mockNotif);
    });

    it('should return error if user is null', async () => {
      mockingoose(UserModel).toReturn(null, 'findOne');

      const badges = await checkAndAwardBadges('user1');
      expect('error' in badges).toBe(true);
    });

    it('should return error if usermodel throws error', async () => {
      mockingoose(UserModel).toReturn(new Error('error'), 'findOne');

      const badges = await checkAndAwardBadges('user1');
      expect('error' in badges).toBe(true);
    });

    it('should return error if user stats is null', async () => {
      mockingoose(UserModel).toReturn(user, 'findOne');
      mockingoose(UserStatsModel).toReturn(null, 'findOne');

      const badges = await checkAndAwardBadges('user1');
      expect('error' in badges).toBe(true);
    });

    it('should return error if userstatsmodel throws error', async () => {
      mockingoose(UserModel).toReturn(user, 'findOne');
      mockingoose(UserStatsModel).toReturn(new Error('error'), 'findOne');

      const badges = await checkAndAwardBadges('user1');
      expect('error' in badges).toBe(true);
    });

    it('should not return error if badges is null', async () => {
      mockingoose(UserModel).toReturn(user, 'findOne');
      mockingoose(UserStatsModel).toReturn(mockUserStatsFull, 'findOne');
      mockingoose(BadgeModel).toReturn(null, 'find');

      const badges = await checkAndAwardBadges('user1');
      expect(badges).toEqual([]);
    });

    it('should return error if badgemodel throws error', async () => {
      mockingoose(UserModel).toReturn(user, 'findOne');
      mockingoose(UserStatsModel).toReturn(mockUserStatsFull, 'findOne');
      mockingoose(BadgeModel).toReturn(new Error('error'), 'find');

      const badges = await checkAndAwardBadges('user1');
      expect('error' in badges).toBe(true);
    });

    it('should not add badge if user already has badge', async () => {
      // the only badge you can get are for asking 5 questions
      // user already has badge for asking 5 questions
      // check that if we call checkAndAwardBadges, it doesn't return the badge as a new badge to add to user
      const userWithBadge = { ...user, badgesEarned: [{ badgeId: dbBadge._id }] };
      mockingoose(UserModel).toReturn(userWithBadge, 'findOne');
      mockingoose(UserStatsModel).toReturn({ ...mockUserStatsFull, questionsCount: 8 }, 'findOne');
      mockingoose(BadgeModel).toReturn([dbBadge], 'find');

      const badges = await checkAndAwardBadges('user1');
      expect(badges).toEqual([]);
    });
  });
});
