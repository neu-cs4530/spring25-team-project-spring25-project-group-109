import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';
import UserModel from '../../models/users.model';
import {
  awardBadgeToUser,
  deleteUserByUsername,
  getUserByUsername,
  getUsersList,
  loginUser,
  saveUser,
  saveUserStats,
  saveUserStore,
  updateUser,
  getRankedUsersList,
} from '../../services/user.service';
import AnswerModel from '../../models/answers.model';
import {
  DatabaseStore,
  DatabaseUserStats,
  SafeDatabaseUser,
  User,
  UserCredentials,
  RankedUser,
} from '../../types/types';
import { user, safeUser, mockUserStats, mockDatabaseStore, safeUserTwo } from '../mockData.models';
import UserStatsModel from '../../models/userstats.model';
import StoreModel from '../../models/store.model';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const mockingoose = require('mockingoose');

describe('User model', () => {
  beforeEach(() => {
    mockingoose.resetAll();
  });

  describe('saveUser', () => {
    beforeEach(() => {
      mockingoose.resetAll();
    });

    it('should return the saved user', async () => {
      mockingoose(UserModel).toReturn(user, 'create');

      const savedUser = (await saveUser(user)) as SafeDatabaseUser;

      expect(savedUser._id).toBeDefined();
      expect(savedUser.username).toEqual(user.username);
      expect(savedUser.dateJoined).toEqual(user.dateJoined);
    });

    it('should throw an error if error when saving to database', async () => {
      jest
        .spyOn(UserModel, 'create')
        .mockRejectedValueOnce(() => new Error('Error saving document'));

      const saveError = await saveUser(user);

      expect('error' in saveError).toBe(true);
    });
  });
});

describe('getUserByUsername', () => {
  beforeEach(() => {
    mockingoose.resetAll();
  });

  it('should return the matching user', async () => {
    mockingoose(UserModel).toReturn(safeUser, 'findOne');

    const retrievedUser = (await getUserByUsername(user.username)) as SafeDatabaseUser;

    expect(retrievedUser.username).toEqual(user.username);
    expect(retrievedUser.dateJoined).toEqual(user.dateJoined);
  });

  it('should throw an error if the user is not found', async () => {
    mockingoose(UserModel).toReturn(null, 'findOne');

    const getUserError = await getUserByUsername(user.username);

    expect('error' in getUserError).toBe(true);
  });

  it('should throw an error if there is an error while searching the database', async () => {
    mockingoose(UserModel).toReturn(new Error('Error finding document'), 'findOne');

    const getUserError = await getUserByUsername(user.username);

    expect('error' in getUserError).toBe(true);
  });
});

describe('getUsersList', () => {
  beforeEach(() => {
    mockingoose.resetAll();
  });

  it('should return the users', async () => {
    mockingoose(UserModel).toReturn([safeUser], 'find');

    const retrievedUsers = (await getUsersList()) as SafeDatabaseUser[];

    expect(retrievedUsers[0].username).toEqual(safeUser.username);
    expect(retrievedUsers[0].dateJoined).toEqual(safeUser.dateJoined);
  });

  it('should throw an error if the users cannot be found', async () => {
    mockingoose(UserModel).toReturn(null, 'find');

    const getUsersError = await getUsersList();

    expect('error' in getUsersError).toBe(true);
  });

  it('should throw an error if there is an error while searching the database', async () => {
    mockingoose(UserModel).toReturn(new Error('Error finding document'), 'find');

    const getUsersError = await getUsersList();

    expect('error' in getUsersError).toBe(true);
  });
});

describe('loginUser', () => {
  beforeEach(() => {
    mockingoose.resetAll();
  });

  it('should return the user if authentication succeeds', async () => {
    mockingoose(UserModel).toReturn(safeUser, 'findOne');

    const credentials: UserCredentials = {
      username: user.username,
      password: user.password,
    };

    const loggedInUser = (await loginUser(credentials)) as SafeDatabaseUser;

    expect(loggedInUser.username).toEqual(user.username);
    expect(loggedInUser.dateJoined).toEqual(user.dateJoined);
  });

  it('should return the user if the password fails', async () => {
    mockingoose(UserModel).toReturn(null, 'findOne');

    const credentials: UserCredentials = {
      username: user.username,
      password: 'wrongPassword',
    };

    const loginError = await loginUser(credentials);

    expect('error' in loginError).toBe(true);
  });

  it('should return the user is not found', async () => {
    mockingoose(UserModel).toReturn(null, 'findOne');

    const credentials: UserCredentials = {
      username: 'wrongUsername',
      password: user.password,
    };

    const loginError = await loginUser(credentials);

    expect('error' in loginError).toBe(true);
  });
});

describe('deleteUserByUsername', () => {
  beforeEach(() => {
    mockingoose.resetAll();
  });

  it('should return the deleted user when deleted succesfully', async () => {
    mockingoose(UserModel).toReturn(safeUser, 'findOneAndDelete');

    const deletedUser = (await deleteUserByUsername(user.username)) as SafeDatabaseUser;

    expect(deletedUser.username).toEqual(user.username);
    expect(deletedUser.dateJoined).toEqual(user.dateJoined);
  });

  it('should throw an error if the username is not found', async () => {
    mockingoose(UserModel).toReturn(null, 'findOneAndDelete');

    const deletedError = await deleteUserByUsername(user.username);

    expect('error' in deletedError).toBe(true);
  });

  it('should throw an error if a database error while deleting', async () => {
    mockingoose(UserModel).toReturn(new Error('Error deleting object'), 'findOneAndDelete');

    const deletedError = await deleteUserByUsername(user.username);

    expect('error' in deletedError).toBe(true);
  });
});

describe('updateUser', () => {
  const updatedUser: User = {
    ...user,
    password: 'newPassword',
  };

  const safeUpdatedUser: SafeDatabaseUser = {
    _id: new mongoose.Types.ObjectId(),
    username: user.username,
    dateJoined: user.dateJoined,
    badgesEarned: [],
    followers: [],
    following: [],
  };

  const updates: Partial<User> = {
    password: 'newPassword',
  };

  beforeEach(() => {
    mockingoose.resetAll();
  });

  it('should return the updated user when updated succesfully', async () => {
    mockingoose(UserModel).toReturn(safeUpdatedUser, 'findOneAndUpdate');

    const result = (await updateUser(user.username, updates)) as SafeDatabaseUser;

    expect(result.username).toEqual(user.username);
    expect(result.username).toEqual(updatedUser.username);
    expect(result.dateJoined).toEqual(user.dateJoined);
    expect(result.dateJoined).toEqual(updatedUser.dateJoined);
  });

  it('should throw an error if the username is not found', async () => {
    mockingoose(UserModel).toReturn(null, 'findOneAndUpdate');

    const updatedError = await updateUser(user.username, updates);

    expect('error' in updatedError).toBe(true);
  });

  it('should throw an error if a database error while deleting', async () => {
    mockingoose(UserModel).toReturn(new Error('Error updating object'), 'findOneAndUpdate');

    const updatedError = await updateUser(user.username, updates);

    expect('error' in updatedError).toBe(true);
  });

  it('should update the biography if the user is found', async () => {
    const newBio = 'This is a new biography';
    // Make a new partial updates object just for biography
    const biographyUpdates: Partial<User> = { biography: newBio };

    // Mock the DB to return a safe user (i.e., no password in results)
    mockingoose(UserModel).toReturn({ ...safeUpdatedUser, biography: newBio }, 'findOneAndUpdate');

    const result = await updateUser(user.username, biographyUpdates);

    // Check that the result is a SafeUser and the biography got updated
    if ('username' in result) {
      expect(result.biography).toEqual(newBio);
    } else {
      throw new Error('Expected a safe user, got an error object.');
    }
  });

  it('should return an error if biography update fails because user not found', async () => {
    // Simulate user not found
    mockingoose(UserModel).toReturn(null, 'findOneAndUpdate');

    const newBio = 'No user found test';
    const biographyUpdates: Partial<User> = { biography: newBio };
    const updatedError = await updateUser(user.username, biographyUpdates);

    expect('error' in updatedError).toBe(true);
  });

  it('should update the profile photo if the user is found', async () => {
    const newPhoto = '/images/avatars/avatar1.png';
    const profilePhotoUpdate: Partial<User> = { profilePhoto: newPhoto };

    mockingoose(UserModel).toReturn(
      { ...safeUpdatedUser, profilePhoto: newPhoto },
      'findOneAndUpdate',
    );

    const result = await updateUser(user.username, profilePhotoUpdate);

    if ('username' in result) {
      expect(result.profilePhoto).toEqual(newPhoto);
    } else {
      throw new Error('Expected a safe user, got an error object.');
    }
  });

  it('should return an error if profile photo update fails because user not found', async () => {
    mockingoose(UserModel).toReturn(null, 'findOneAndUpdate');

    const newPhoto = '/images/avatars/avatar1.png';
    const profilePhotoUpdate: Partial<User> = { profilePhoto: newPhoto };
    const updatedError = await updateUser(user.username, profilePhotoUpdate);

    expect('error' in updatedError).toBe(true);
  });
});

describe('saveUserStats', () => {
  it('should return a saved user stats object', async () => {
    mockingoose(UserStatsModel).toReturn(mockUserStats, 'create');

    const result = (await saveUserStats('testUser')) as DatabaseUserStats;

    expect(result.answersCount).toEqual(mockUserStats.answersCount);
    expect(result.questionsCount).toEqual(mockUserStats.questionsCount);
    expect(result.commentsCount).toEqual(mockUserStats.commentsCount);
    expect(result.nimWinCount).toEqual(mockUserStats.nimWinCount);
  });
  it('should throw an error if error when saving to database', async () => {
    jest
      .spyOn(UserStatsModel, 'create')
      .mockRejectedValueOnce(() => new Error('Error saving document'));

    const saveError = await saveUserStats('testUser');

    expect('error' in saveError).toBe(true);
  });
});

describe('saveUserStore', () => {
  it('should return a saved user stats object', async () => {
    mockingoose(StoreModel).toReturn(mockDatabaseStore, 'create');

    const result = (await saveUserStore(mockDatabaseStore.username)) as DatabaseStore;

    expect(result.coinCount).toEqual(mockDatabaseStore.coinCount);
    expect(result.unlockedFeatures).toEqual(mockDatabaseStore.unlockedFeatures);
    expect(result.username).toEqual(mockDatabaseStore.username);
  });
  it('should throw an error if error when saving to database', async () => {
    jest
      .spyOn(StoreModel, 'create')
      .mockRejectedValueOnce(() => new Error('Error saving document'));

    const saveError = await saveUserStore('testUser');

    expect('error' in saveError).toBe(true);
  });
});

describe('awardBadgeToUser', () => {
  it('should succesfully award badge', async () => {
    mockingoose(UserModel).toReturn(user, 'findOneAndUpdate');

    const badgeId = new ObjectId();
    const result = (await awardBadgeToUser(user.username, [badgeId])) as SafeDatabaseUser;
    expect(result.badgesEarned.some(badge => badge.badgeId === badgeId.toString()));
    expect(result.username).toEqual(user.username);
    expect(result.dateJoined).toEqual(user.dateJoined);
  });

  it('should return error if UserModel fails', async () => {
    mockingoose(UserModel).toReturn(new Error('Error updating object'), 'findOneAndUpdate');

    const result = await awardBadgeToUser(user.username, [new ObjectId()]);
    expect('error' in result).toBe(true);
  });

  it('should return error if UserModel returns null', async () => {
    mockingoose(UserModel).toReturn(null, 'findOneAndUpdate');

    const result = await awardBadgeToUser(user.username, [new ObjectId()]);
    expect('error' in result).toBe(true);
  });
});

describe('getRankedUsersList', () => {
  beforeEach(() => {
    mockingoose.resetAll();
  });

  it('should push to the pipeline if startDate and endDate are provided', async () => {
    const startDate = '2023-01-01';
    const endDate = '2023-12-31';

    const pipeline = [
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: '$userId',
          count: { $sum: 1 },
          user_info: { $first: '$$ROOT' },
        },
      },
      {
        $sort: { count: -1 },
      },
    ];

    mockingoose(AnswerModel).toReturn(pipeline, 'aggregate');

    await getRankedUsersList(startDate, endDate);
  });

  it('should return the users', async () => {
    const usersArray = [safeUser, safeUserTwo];
    const answerArray = [
      { _id: safeUserTwo.username, count: 2, user_info: { ...safeUserTwo } },
      { _id: safeUser.username, count: 1, user_info: { ...safeUser } },
    ];

    mockingoose(UserModel).toReturn(usersArray, 'find');
    mockingoose(AnswerModel).toReturn(answerArray, 'aggregate');

    const retrievedUsers = (await getRankedUsersList()) as RankedUser[];
    expect(retrievedUsers[0].username).toEqual(safeUserTwo.username);
    expect(retrievedUsers[0].count).toEqual(2);
  });

  it('should throw an error if the users cannot be found', async () => {
    mockingoose(AnswerModel).toReturn(null, 'aggregate');

    const getUsersError = await getRankedUsersList();

    expect('error' in getUsersError).toBe(true);
  });

  it('should throw an error if there is an error while searching the database', async () => {
    mockingoose(AnswerModel).toReturn(new Error('Error finding document'), 'aggregate');

    const getUsersError = await getRankedUsersList();

    expect('error' in getUsersError).toBe(true);
  });
});
