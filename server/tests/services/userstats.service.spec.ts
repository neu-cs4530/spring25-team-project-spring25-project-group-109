import UserStatsModel from '../../models/userstats.model';
import { mockDBUserStats } from '../mockData.models';
import getUserStats from '../../services/userstats.service';
import { DatabaseUserStats } from '../../types/types';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const mockingoose = require('mockingoose');

describe('getUserStats', () => {
  beforeEach(() => {
    mockingoose.resetAll();
  });

  it('should return the matching user stats', async () => {
    mockingoose(UserStatsModel).toReturn(mockDBUserStats, 'findOne');

    const retrievedUserStats = (await getUserStats('u')) as DatabaseUserStats;

    expect(retrievedUserStats.username).toEqual(mockDBUserStats.username);
    expect(retrievedUserStats.answersCount).toEqual(mockDBUserStats.answersCount);
    expect(retrievedUserStats.questionsCount).toEqual(mockDBUserStats.questionsCount);
    expect(retrievedUserStats.nimWinCount).toEqual(mockDBUserStats.nimWinCount);
    expect(retrievedUserStats.commentsCount).toEqual(mockDBUserStats.commentsCount);
  });

  it('should throw an error if the user is not found', async () => {
    mockingoose(UserStatsModel).toReturn(null, 'findOne');

    const getUserError = await getUserStats('u');

    expect('error' in getUserError).toBe(true);
  });

  it('should throw an error if there is an error while searching the database', async () => {
    mockingoose(UserStatsModel).toReturn(new Error('Error finding document'), 'findOne');

    const getUserError = await getUserStats('u');

    expect('error' in getUserError).toBe(true);
  });
});
