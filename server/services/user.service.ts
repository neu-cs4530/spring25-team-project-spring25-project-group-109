import { ObjectId } from 'mongodb';
import { PipelineStage } from 'mongoose';
import UserModel from '../models/users.model';
import UserStatsModel from '../models/userstats.model';
import {
  DatabaseStore,
  DatabaseUser,
  DatabaseUserStats,
  SafeDatabaseUser,
  User,
  UserCredentials,
  UserResponse,
  UsersResponse,
  RankedUsersResponse,
} from '../types/types';
import StoreModel from '../models/store.model';
import AnswerModel from '../models/answers.model';

/**
 * Saves a new user to the database.
 *
 * @param {User} user - The user object to be saved, containing user details like username, password, etc.
 * @returns {Promise<UserResponse>} - Resolves with the saved user object (without the password) or an error message.
 */
export const saveUser = async (user: User): Promise<UserResponse> => {
  try {
    const result: DatabaseUser = await UserModel.create(user);

    // Remove password field from returned object
    const safeUser: SafeDatabaseUser = {
      _id: result._id,
      username: result.username,
      dateJoined: result.dateJoined,
      biography: result.biography,
      profilePhoto: result.profilePhoto,
      badgesEarned: result.badgesEarned,
      followers: result.followers,
      following: result.following,
    };

    return safeUser;
  } catch (error) {
    return { error: `Error occurred when saving user: ${error}` };
  }
};

/**
 * Creates a corresponding UserStats object for a new user.
 *
 * @param username - The unique identifier of the newly created user.
 * @returns {Promise<DatabaseUserStats | { error: string }>}
 */
export const saveUserStats = async (
  username: string,
): Promise<DatabaseUserStats | { error: string }> => {
  try {
    const result: DatabaseUserStats = await UserStatsModel.create({
      username,
      questionsCount: 0,
      commentsCount: 0,
      answersCount: 0,
      nimWinCount: 0,
    });
    return result;
  } catch (error) {
    return { error: `Error creating user stats: ${error}` };
  }
};

/**
 * Creates a corresponding Store object for a new user.
 *
 * @param username - The unique identifier of the newly created user.
 * @returns {Promise<DatabaseStore | { error: string }>}
 */
export const saveUserStore = async (
  username: string,
): Promise<DatabaseStore | { error: string }> => {
  try {
    const result: DatabaseStore = await StoreModel.create({
      username,
      coinCount: 0,
      unlockedFeatures: [],
    });
    return result;
  } catch (error) {
    return { error: `Error creating user store: ${error}` };
  }
};

/**
 * Retrieves a user from the database by their username.
 *
 * @param {string} username - The username of the user to find.
 * @returns {Promise<UserResponse>} - Resolves with the found user object (without the password) or an error message.
 */
export const getUserByUsername = async (username: string): Promise<UserResponse> => {
  try {
    const user: SafeDatabaseUser | null = await UserModel.findOne({ username }).select('-password');

    if (!user) {
      throw Error('User not found');
    }

    return user;
  } catch (error) {
    return { error: `Error occurred when finding user: ${error}` };
  }
};

/**
 * Retrieves all users from the database.
 * Users documents are returned in the order in which they were created, oldest to newest.
 *
 * @returns {Promise<UsersResponse>} - Resolves with the found user objects (without the passwords) or an error message.
 */
export const getUsersList = async (): Promise<UsersResponse> => {
  try {
    const users: SafeDatabaseUser[] = await UserModel.find().select('-password');

    if (!users) {
      throw Error('Users could not be retrieved');
    }

    return users;
  } catch (error) {
    return { error: `Error occurred when finding users: ${error}` };
  }
};

/**
 * Authenticates a user by verifying their username and password.
 *
 * @param {UserCredentials} loginCredentials - An object containing the username and password.
 * @returns {Promise<UserResponse>} - Resolves with the authenticated user object (without the password) or an error message.
 */
export const loginUser = async (loginCredentials: UserCredentials): Promise<UserResponse> => {
  const { username, password } = loginCredentials;

  try {
    const user: SafeDatabaseUser | null = await UserModel.findOne({ username, password }).select(
      '-password',
    );

    if (!user) {
      throw Error('Authentication failed');
    }

    return user;
  } catch (error) {
    return { error: `Error occurred when authenticating user: ${error}` };
  }
};

/**
 * Deletes a user from the database by their username.
 *
 * @param {string} username - The username of the user to delete.
 * @returns {Promise<UserResponse>} - Resolves with the deleted user object (without the password) or an error message.
 */
export const deleteUserByUsername = async (username: string): Promise<UserResponse> => {
  try {
    const deletedUser: SafeDatabaseUser | null = await UserModel.findOneAndDelete({
      username,
    }).select('-password');

    if (!deletedUser) {
      throw Error('Error deleting user');
    }

    return deletedUser;
  } catch (error) {
    return { error: `Error occurred when finding user: ${error}` };
  }
};

/**
 * Updates user information in the database.
 *
 * @param {string} username - The username of the user to update.
 * @param {Partial<User>} updates - An object containing the fields to update and their new values.
 * @returns {Promise<UserResponse>} - Resolves with the updated user object (without the password) or an error message.
 */
export const updateUser = async (
  username: string,
  updates: Partial<User>,
): Promise<UserResponse> => {
  try {
    const updatedUser: SafeDatabaseUser | null = await UserModel.findOneAndUpdate(
      { username },
      { $set: updates },
      { new: true },
    ).select('-password');

    if (!updatedUser) {
      throw Error('Error updating user');
    }

    return updatedUser;
  } catch (error) {
    return { error: `Error occurred when updating user: ${error}` };
  }
};

export const getRankedUsersList = async (
  startDate?: string | null,
  endDate?: string | null,
): Promise<RankedUsersResponse> => {
  try {
    const pipeline = [];
    if (startDate && endDate) {
      pipeline.push({
        $match: { ansDateTime: { $gte: new Date(startDate), $lte: new Date(endDate) } },
      });
    }
    pipeline.push(
      { $group: { _id: '$ansBy', count: { $sum: 1 } } },
      {
        $lookup: {
          from: UserModel.collection.name,
          localField: '_id',
          foreignField: 'username',
          as: 'user_info',
        },
      },
      {
        $unwind: '$user_info',
      },
      {
        $sort: { count: -1 },
      },
    );
    const users = await AnswerModel.aggregate(pipeline as PipelineStage[]);
    if (!users) {
      throw Error('Ranked users list could not be retrieved');
    }

    const usersList = users.map(user => {
      delete user.user_info.password;
      return { count: user.count, ...user.user_info };
    });
    return usersList;
  } catch (error) {
    return { error: `Error occurred when finding ranked users: ${error}` };
  }
};
/**
 * Award one or more badges to a user.
 *
 * @param userId - The ID of the user to award the badges to.
 * @param badgeIds - The IDs of the badges to award.
 * @returns {Promise<UserResponse>} - The updated user object after badges are awarded.
 */
export const awardBadgeToUser = async (
  username: string,
  badgeIds: ObjectId[],
): Promise<UserResponse> => {
  try {
    // create badge objects with badgeId and dateEarned for each badgeId
    const badgesToAward = badgeIds.map(badgeId => ({
      badgeId,
      dateEarned: new Date(),
    }));

    // add badges to the user's badgesEarned array
    const updatedUser = await UserModel.findOneAndUpdate(
      { username },
      { $push: { badgesEarned: { $each: badgesToAward } } },
      { new: true },
    ).select('-password');

    if (!updatedUser) {
      throw new Error('User not found');
    }
    return updatedUser;
  } catch (error) {
    return { error: `Error occurred when updating badges: ${error}` };
  }
};
