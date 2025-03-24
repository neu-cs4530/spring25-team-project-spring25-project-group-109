import supertest from 'supertest';
import mongoose from 'mongoose';
import fs from 'fs';
import { app } from '../../app';
import * as util from '../../services/user.service';
import * as notifUtil from '../../services/notification.service';
import { DatabaseUserStats, SafeDatabaseUser, User, NotificationType } from '../../types/types';
import { mockDatabaseStore, mockStoreJSONResponse } from '../mockData.models';

const mockUser: User = {
  username: 'user1',
  password: 'password',
  dateJoined: new Date('2024-12-03'),
  badgesEarned: [],
  followers: [],
  following: [],
};

const mockSafeUser: SafeDatabaseUser = {
  _id: new mongoose.Types.ObjectId(),
  username: 'user1',
  dateJoined: new Date('2024-12-03'),
  badgesEarned: [],
  followers: [],
  following: [],
};

const mockUser2: User = {
  username: 'user2',
  password: 'password',
  dateJoined: new Date('2024-12-03'),
  badgesEarned: [],
  followers: [],
  following: [],
};

const mockSafeUser2: SafeDatabaseUser = {
  _id: new mongoose.Types.ObjectId(),
  username: 'user2',
  dateJoined: new Date('2024-12-03'),
  badgesEarned: [],
  followers: [],
  following: [],
};

const mockUserStats: DatabaseUserStats = {
  _id: new mongoose.Types.ObjectId(),
  username: 'user1',
  questionsCount: 0,
  commentsCount: 0,
  answersCount: 0,
  nimWinCount: 0,
};

const mockUserStatsJSONResponse = {
  _id: mockUserStats._id.toString(),
  username: 'user1',
  questionsCount: 0,
  commentsCount: 0,
  answersCount: 0,
  nimWinCount: 0,
};

const mockUserJSONResponse = {
  _id: mockSafeUser._id.toString(),
  username: 'user1',
  dateJoined: new Date('2024-12-03').toISOString(),
  badgesEarned: [],
  followers: [],
  following: [],
};

const mockUser2JSONResponse = {
  _id: mockSafeUser2._id.toString(),
  username: 'user2',
  dateJoined: new Date('2024-12-03').toISOString(),
  badgesEarned: [],
  followers: [],
  following: [],
};

const saveUserSpy = jest.spyOn(util, 'saveUser');
const saveUserStatsSpy = jest.spyOn(util, 'saveUserStats');
const saveUserStoreSpy = jest.spyOn(util, 'saveUserStore');
const loginUserSpy = jest.spyOn(util, 'loginUser');
const updatedUserSpy = jest.spyOn(util, 'updateUser');
const getUserByUsernameSpy = jest.spyOn(util, 'getUserByUsername');
const getUsersListSpy = jest.spyOn(util, 'getUsersList');
const deleteUserByUsernameSpy = jest.spyOn(util, 'deleteUserByUsername');
const saveNotificationSpy = jest.spyOn(notifUtil, 'saveNotification');
const existsSyncSpy = jest.spyOn(fs, 'existsSync');
const unlinkSyncSpy = jest.spyOn(fs, 'unlinkSync');

jest.mock('multer', () => {
  const multerMock = () => ({
    single: jest.fn(() => (req: Express.Request, res: Express.Response, next: () => void) => {
      req.file = { filename: 'mocked-file.png', buffer: Buffer.from('') } as Express.Multer.File;
      next();
    }),
  });

  multerMock.diskStorage = jest.fn(() => ({
    destination: jest.fn(),
    filename: jest.fn(
      (
        req: Express.Request,
        file: Express.Multer.File,
        cb: (error: Error | null, filename: string) => void,
      ) => cb(null, 'mocked-file.png'),
    ),
  }));

  multerMock.memoryStorage = jest.fn(() => ({}));

  return multerMock;
});

describe('Test userController', () => {
  describe('POST /signup', () => {
    it('should create a new user given correct arguments', async () => {
      const mockReqBody = {
        username: mockUser.username,
        password: mockUser.password,
        biography: 'This is a test biography',
        profilePhoto: '/images/avatars/default-avatar.png',
      };

      saveUserSpy.mockResolvedValueOnce({ ...mockSafeUser, biography: mockReqBody.biography });
      saveUserStatsSpy.mockResolvedValueOnce(mockUserStats);
      saveUserStoreSpy.mockResolvedValueOnce(mockDatabaseStore);

      const response = await supertest(app).post('/user/signup').send(mockReqBody);
      expect(response.status).toBe(200);
      expect(response.body.userStats.username).toEqual(response.body.user.username);
      expect(response.body).toEqual({
        user: { ...mockUserJSONResponse, biography: mockReqBody.biography },
        userStats: mockUserStatsJSONResponse,
        userStore: mockStoreJSONResponse,
      });
      expect(saveUserSpy).toHaveBeenCalledWith({
        ...mockReqBody,
        biography: mockReqBody.biography,
        profilePhoto: mockReqBody.profilePhoto,
        dateJoined: expect.any(Date),
        badgesEarned: [],
        followers: [],
        following: [],
      });
      expect(saveUserStatsSpy).toHaveBeenCalledWith(mockSafeUser.username);
      expect(saveUserStoreSpy).toHaveBeenCalledWith(mockSafeUser.username);
    });

    it('should return 400 for request missing username', async () => {
      const mockReqBody = {
        password: mockUser.password,
      };

      const response = await supertest(app).post('/user/signup').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid user body');
    });

    it('should return 400 for request with empty username', async () => {
      const mockReqBody = {
        username: '',
        password: mockUser.password,
      };

      const response = await supertest(app).post('/user/signup').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid user body');
    });

    it('should return 400 for request missing password', async () => {
      const mockReqBody = {
        username: mockUser.username,
      };

      const response = await supertest(app).post('/user/signup').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid user body');
    });

    it('should return 400 for request with empty password', async () => {
      const mockReqBody = {
        username: mockUser.username,
        password: '',
      };

      const response = await supertest(app).post('/user/signup').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid user body');
    });

    it('should return 500 for a database error while saving user', async () => {
      const mockReqBody = {
        username: mockUser.username,
        password: mockUser.password,
      };

      saveUserSpy.mockResolvedValueOnce({ error: 'Error saving user' });

      const response = await supertest(app).post('/user/signup').send(mockReqBody);

      expect(response.status).toBe(500);
    });
    it('should return 500 for a database error while saving user stats', async () => {
      const mockReqBody = {
        username: mockUser.username,
        password: mockUser.password,
        biography: 'This is a test biography',
      };

      saveUserSpy.mockResolvedValueOnce({ ...mockSafeUser, biography: mockReqBody.biography });
      saveUserStatsSpy.mockResolvedValueOnce({ error: 'Error saving user' });

      const response = await supertest(app).post('/user/signup').send(mockReqBody);

      expect(response.status).toBe(500);
    });
  });

  describe('POST /login', () => {
    it('should succesfully login for a user given correct arguments', async () => {
      const mockReqBody = {
        username: mockUser.username,
        password: mockUser.password,
      };

      loginUserSpy.mockResolvedValueOnce(mockSafeUser);

      const response = await supertest(app).post('/user/login').send(mockReqBody);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUserJSONResponse);
      expect(loginUserSpy).toHaveBeenCalledWith(mockReqBody);
    });

    it('should return 400 for request missing username', async () => {
      const mockReqBody = {
        password: mockUser.password,
      };

      const response = await supertest(app).post('/user/login').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid user body');
    });

    it('should return 400 for request with empty username', async () => {
      const mockReqBody = {
        username: '',
        password: mockUser.password,
      };

      const response = await supertest(app).post('/user/login').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid user body');
    });

    it('should return 400 for request missing password', async () => {
      const mockReqBody = {
        username: mockUser.username,
      };

      const response = await supertest(app).post('/user/login').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid user body');
    });

    it('should return 400 for request with empty password', async () => {
      const mockReqBody = {
        username: mockUser.username,
        password: '',
      };

      const response = await supertest(app).post('/user/login').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid user body');
    });

    it('should return 500 for a database error while saving', async () => {
      const mockReqBody = {
        username: mockUser.username,
        password: mockUser.password,
      };

      loginUserSpy.mockResolvedValueOnce({ error: 'Error authenticating user' });

      const response = await supertest(app).post('/user/login').send(mockReqBody);

      expect(response.status).toBe(500);
    });
  });

  describe('POST /resetPassword', () => {
    it('should succesfully return updated user object given correct arguments', async () => {
      const mockReqBody = {
        username: mockUser.username,
        password: 'newPassword',
      };

      updatedUserSpy.mockResolvedValueOnce(mockSafeUser);

      const response = await supertest(app).patch('/user/resetPassword').send(mockReqBody);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ ...mockUserJSONResponse });
      expect(updatedUserSpy).toHaveBeenCalledWith(mockUser.username, { password: 'newPassword' });
    });

    it('should return 400 for request missing username', async () => {
      const mockReqBody = {
        password: 'newPassword',
      };

      const response = await supertest(app).patch('/user/resetPassword').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid user body');
    });

    it('should return 400 for request with empty username', async () => {
      const mockReqBody = {
        username: '',
        password: 'newPassword',
      };

      const response = await supertest(app).patch('/user/resetPassword').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid user body');
    });

    it('should return 400 for request missing password', async () => {
      const mockReqBody = {
        username: mockUser.username,
      };

      const response = await supertest(app).patch('/user/resetPassword').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid user body');
    });

    it('should return 400 for request with empty password', async () => {
      const mockReqBody = {
        username: mockUser.username,
        password: '',
      };

      const response = await supertest(app).patch('/user/resetPassword').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid user body');
    });

    it('should return 500 for a database error while updating', async () => {
      const mockReqBody = {
        username: mockUser.username,
        password: 'newPassword',
      };

      updatedUserSpy.mockResolvedValueOnce({ error: 'Error updating user' });

      const response = await supertest(app).patch('/user/resetPassword').send(mockReqBody);

      expect(response.status).toBe(500);
    });
  });

  describe('GET /getUser', () => {
    it('should return the user given correct arguments', async () => {
      getUserByUsernameSpy.mockResolvedValueOnce(mockSafeUser);

      const response = await supertest(app).get(`/user/getUser/${mockUser.username}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUserJSONResponse);
      expect(getUserByUsernameSpy).toHaveBeenCalledWith(mockUser.username);
    });

    it('should return 500 if database error while searching username', async () => {
      getUserByUsernameSpy.mockResolvedValueOnce({ error: 'Error finding user' });

      const response = await supertest(app).get(`/user/getUser/${mockUser.username}`);

      expect(response.status).toBe(500);
    });

    it('should return 404 if username not provided', async () => {
      // Express automatically returns 404 for missing parameters when
      // defined as required in the route
      const response = await supertest(app).get('/user/getUser/');
      expect(response.status).toBe(404);
    });
  });

  describe('GET /getUsers', () => {
    it('should return the users from the database', async () => {
      getUsersListSpy.mockResolvedValueOnce([mockSafeUser]);

      const response = await supertest(app).get(`/user/getUsers`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual([mockUserJSONResponse]);
      expect(getUsersListSpy).toHaveBeenCalled();
    });

    it('should return 500 if database error while finding users', async () => {
      getUsersListSpy.mockResolvedValueOnce({ error: 'Error finding users' });

      const response = await supertest(app).get(`/user/getUsers`);

      expect(response.status).toBe(500);
    });
  });

  describe('DELETE /deleteUser', () => {
    it('should return the deleted user given correct arguments', async () => {
      deleteUserByUsernameSpy.mockResolvedValueOnce(mockSafeUser);

      const response = await supertest(app).delete(`/user/deleteUser/${mockUser.username}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUserJSONResponse);
      expect(deleteUserByUsernameSpy).toHaveBeenCalledWith(mockUser.username);
    });

    it('should return 500 if database error while searching username', async () => {
      deleteUserByUsernameSpy.mockResolvedValueOnce({ error: 'Error deleting user' });

      const response = await supertest(app).delete(`/user/deleteUser/${mockUser.username}`);

      expect(response.status).toBe(500);
    });

    it('should return 404 if username not provided', async () => {
      // Express automatically returns 404 for missing parameters when
      // defined as required in the route
      const response = await supertest(app).delete('/user/deleteUser/');
      expect(response.status).toBe(404);
    });
  });

  describe('PATCH /updateBiography', () => {
    it('should successfully update biography given correct arguments', async () => {
      const mockReqBody = {
        username: mockUser.username,
        biography: 'This is my new bio',
      };

      // Mock a successful updateUser call
      updatedUserSpy.mockResolvedValueOnce(mockSafeUser);

      const response = await supertest(app).patch('/user/updateBiography').send(mockReqBody);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUserJSONResponse);
      // Ensure updateUser is called with the correct args
      expect(updatedUserSpy).toHaveBeenCalledWith(mockUser.username, {
        biography: 'This is my new bio',
      });
    });

    it('should return 400 for request missing username', async () => {
      const mockReqBody = {
        biography: 'some new biography',
      };

      const response = await supertest(app).patch('/user/updateBiography').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid user body');
    });

    it('should return 400 for request with empty username', async () => {
      const mockReqBody = {
        username: '',
        biography: 'a new bio',
      };

      const response = await supertest(app).patch('/user/updateBiography').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid user body');
    });

    it('should return 400 for request missing biography field', async () => {
      const mockReqBody = {
        username: mockUser.username,
      };

      const response = await supertest(app).patch('/user/updateBiography').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid user body');
    });

    it('should return 500 if updateUser returns an error', async () => {
      const mockReqBody = {
        username: mockUser.username,
        biography: 'Attempting update biography',
      };

      // Simulate a DB error
      updatedUserSpy.mockResolvedValueOnce({ error: 'Error updating user' });

      const response = await supertest(app).patch('/user/updateBiography').send(mockReqBody);

      expect(response.status).toBe(500);
      expect(response.text).toContain(
        'Error when updating user biography: Error: Error updating user',
      );
    });
  });

  describe('PATCH /updateProfilePhoto', () => {
    beforeEach(() => {
      jest.clearAllMocks();

      getUserByUsernameSpy.mockResolvedValue(mockSafeUser);
    });

    it('should successfully update profilePhoto', async () => {
      const mockReqBody = {
        username: mockUser2.username,
        profilePhoto: '/images/avatars/avatar1.png',
      };

      existsSyncSpy.mockReturnValue(true);
      unlinkSyncSpy.mockImplementation(() => {});

      updatedUserSpy.mockResolvedValueOnce({
        ...mockSafeUser2,
        profilePhoto: mockReqBody.profilePhoto,
      });
      const response = await supertest(app).patch('/user/updateProfilePhoto').send(mockReqBody);

      expect(response.status).toBe(200);
      expect(response.body.profilePhoto).toBe('/images/avatars/avatar1.png');
      expect(updatedUserSpy).toHaveBeenCalledWith(mockSafeUser2.username, {
        profilePhoto: mockReqBody.profilePhoto,
      });
    });

    it('should NOT delete old photo if it is an avatar', async () => {
      mockUser.profilePhoto = '/images/avatars/default-avatar.png'; // Old photo is an avatar

      const mockReqBody = {
        username: mockUser.username,
        profilePhoto: '/uploads/new-pic.jpg',
      };

      updatedUserSpy.mockResolvedValueOnce({
        ...mockSafeUser,
        profilePhoto: mockReqBody.profilePhoto,
      });

      const response = await supertest(app).patch('/user/updateProfilePhoto').send(mockReqBody);

      expect(response.status).toBe(200);
    });

    it('should return 400 for request missing username', async () => {
      const response = await supertest(app)
        .patch('/user/updateProfilePhoto')
        .send({ profilePhoto: '/images/avatars/avatar1.png' });

      expect(response.status).toBe(400);
      expect(response.text).toBe('Invalid user body');
    });

    it('should return 400 for request with empty username', async () => {
      const response = await supertest(app)
        .patch('/user/updateProfilePhoto')
        .send({ username: '', profilePhoto: '/images/avatars/avatar1.png' });

      expect(response.status).toBe(400);
      expect(response.text).toBe('Invalid user body');
    });

    it('should return 400 for request missing profile photo field', async () => {
      const response = await supertest(app)
        .patch('/user/updateProfilePhoto')
        .send({ username: mockUser.username });

      expect(response.status).toBe(400);
      expect(response.text).toBe('Invalid user body');
    });

    it('should return 500 if updateUser returns an error', async () => {
      const mockReqBody = {
        username: mockUser.username,
        profilePhoto: '/images/avatars/avatar1.png',
      };

      updatedUserSpy.mockResolvedValueOnce({ error: 'Error updating user' });

      const response = await supertest(app).patch('/user/updateProfilePhoto').send(mockReqBody);

      expect(response.status).toBe(500);
      expect(response.text).toContain(
        'Error when updating user profile photo: Error: Error updating user',
      );
    });
  });

  describe('uploadProfilePhoto', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return 400 if no file or username is provided', async () => {
      const res = await supertest(app).post('/user/uploadProfilePhoto').send({});
      expect(res.status).toBe(400);
      expect(res.text).toBe('Invalid user body');
    });

    it('should return 500 if user retrieval fails', async () => {
      getUserByUsernameSpy.mockResolvedValue({ error: 'User not found' });
      const res = await supertest(app)
        .post('/user/uploadProfilePhoto')
        .send({ username: 'testuser' });
      expect(res.status).toBe(500);
      expect(res.text).toContain('Error uploading file');
    });

    it('should delete old profile photo if it exists', async () => {
      getUserByUsernameSpy.mockResolvedValue({ ...mockSafeUser, profilePhoto: '/uploads/old.png' });
      updatedUserSpy.mockResolvedValue({ ...mockSafeUser, profilePhoto: '/uploads/new.png' });
      existsSyncSpy.mockReturnValue(true);

      const res = await supertest(app)
        .post('/user/uploadProfilePhoto')
        .send({ username: 'testuser' });

      expect(res.status).toBe(200);
      expect(existsSyncSpy).toHaveBeenCalled();
      expect(unlinkSyncSpy).toHaveBeenCalled();
    });

    it('should return 500 if updating user fails', async () => {
      getUserByUsernameSpy.mockResolvedValue({ ...mockSafeUser, profilePhoto: '/uploads/old.png' });
      updatedUserSpy.mockResolvedValue({ error: 'Update failed' });

      const res = await supertest(app)
        .post('/user/uploadProfilePhoto')
        .send({ username: 'testuser' });

      expect(res.status).toBe(500);
    });
  });

  describe('PATCH /follow', () => {
    it('should successfully follow given correct arguments', async () => {
      const mockReqBody = {
        follower: mockSafeUser.username,
        followee: mockSafeUser2.username,
      };

      const mockNotif = {
        _id: new mongoose.Types.ObjectId(),
        username: mockSafeUser2.username,
        text: `${mockSafeUser.username} followed you!`,
        seen: false,
        type: 'follow' as NotificationType,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      };

      getUserByUsernameSpy.mockResolvedValueOnce(mockSafeUser);
      getUserByUsernameSpy.mockResolvedValueOnce(mockSafeUser2);

      updatedUserSpy.mockResolvedValueOnce(mockSafeUser);
      updatedUserSpy.mockResolvedValueOnce(mockSafeUser2);

      saveNotificationSpy.mockResolvedValueOnce(mockNotif);

      const response = await supertest(app).patch('/user/follow').send(mockReqBody);

      expect(response.status).toBe(200);
      expect(response.body).toEqual([{ ...mockUserJSONResponse }, { ...mockUser2JSONResponse }]);
    });

    it('should return 400 for request missing follower', async () => {
      const mockReqBody = {
        followee: mockUser2.username,
      };

      const response = await supertest(app).patch('/user/follow').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid body');
    });

    it('should return 400 for request with empty follower', async () => {
      const mockReqBody = {
        follower: '',
        followee: mockUser2.username,
      };

      const response = await supertest(app).patch('/user/follow').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid body');
    });

    it('should return 400 for request missing followee', async () => {
      const mockReqBody = {
        follower: mockUser.username,
      };

      const response = await supertest(app).patch('/user/follow').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid body');
    });

    it('should return 400 for request with empty followee', async () => {
      const mockReqBody = {
        follower: mockUser.username,
        followee: '',
      };

      const response = await supertest(app).patch('/user/follow').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid body');
    });

    it('should return 400 if follower and followee are the same', async () => {
      const mockReqBody = {
        follower: mockUser.username,
        followee: mockUser.username,
      };

      const response = await supertest(app).patch('/user/follow').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Cannot follow yourself');
    });

    it('should return 500 if updateUser returns an error', async () => {
      const mockReqBody = {
        follower: mockUser.username,
        followee: mockUser2.username,
      };

      getUserByUsernameSpy.mockResolvedValueOnce(mockSafeUser);
      getUserByUsernameSpy.mockResolvedValueOnce(mockSafeUser2);

      updatedUserSpy.mockResolvedValue({ error: 'Error updating user' });

      const response = await supertest(app).patch('/user/follow').send(mockReqBody);

      expect(response.status).toBe(500);
    });

    it('should return 500 if updateUser returns an error for the second user', async () => {
      const mockReqBody = {
        follower: mockUser.username,
        followee: mockUser2.username,
      };

      getUserByUsernameSpy.mockResolvedValueOnce(mockSafeUser);
      getUserByUsernameSpy.mockResolvedValueOnce(mockSafeUser2);

      updatedUserSpy.mockResolvedValueOnce(mockSafeUser);
      updatedUserSpy.mockResolvedValueOnce({ error: 'Error updating user' });

      const response = await supertest(app).patch('/user/follow').send(mockReqBody);

      expect(response.status).toBe(500);
    });

    it('should return 500 if getUserByUsername returns an error', async () => {
      const mockReqBody = {
        follower: mockUser.username,
        followee: mockUser2.username,
      };

      getUserByUsernameSpy.mockResolvedValue({ error: 'Error getting user' });

      const response = await supertest(app).patch('/user/follow').send(mockReqBody);

      expect(response.status).toBe(500);
    });

    it('should return 500 if getUserByUsername returns an error for the second user', async () => {
      const mockReqBody = {
        follower: mockUser.username,
        followee: mockUser2.username,
      };

      getUserByUsernameSpy.mockResolvedValueOnce(mockSafeUser);
      getUserByUsernameSpy.mockResolvedValueOnce({ error: 'Error getting user' });

      const response = await supertest(app).patch('/user/follow').send(mockReqBody);

      expect(response.status).toBe(500);
    });
  });

  describe('PATCH /unfollow', () => {
    it('should successfully unfollow given correct arguments', async () => {
      const mockReqBody = {
        follower: mockSafeUser.username,
        followee: mockSafeUser2.username,
      };

      getUserByUsernameSpy.mockResolvedValueOnce(mockSafeUser);
      getUserByUsernameSpy.mockResolvedValueOnce(mockSafeUser2);

      updatedUserSpy.mockResolvedValueOnce(mockSafeUser);
      updatedUserSpy.mockResolvedValueOnce(mockSafeUser2);

      const response = await supertest(app).patch('/user/unfollow').send(mockReqBody);

      expect(response.status).toBe(200);
      expect(response.body).toEqual([{ ...mockUserJSONResponse }, { ...mockUser2JSONResponse }]);
    });

    it('should return 400 for request missing follower', async () => {
      const mockReqBody = {
        followee: mockUser2.username,
      };

      const response = await supertest(app).patch('/user/unfollow').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid body');
    });

    it('should return 400 for request with empty follower', async () => {
      const mockReqBody = {
        follower: '',
        followee: mockUser2.username,
      };

      const response = await supertest(app).patch('/user/unfollow').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid body');
    });

    it('should return 400 for request missing followee', async () => {
      const mockReqBody = {
        follower: mockUser.username,
      };

      const response = await supertest(app).patch('/user/unfollow').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid body');
    });

    it('should return 400 for request with empty followee', async () => {
      const mockReqBody = {
        follower: mockUser.username,
        followee: '',
      };

      const response = await supertest(app).patch('/user/unfollow').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid body');
    });

    it('should return 400 if follower and followee are the same', async () => {
      const mockReqBody = {
        follower: mockUser.username,
        followee: mockUser.username,
      };

      const response = await supertest(app).patch('/user/unfollow').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Cannot unfollow yourself');
    });

    it('should return 500 if updateUser returns an error', async () => {
      const mockReqBody = {
        follower: mockUser.username,
        followee: mockUser2.username,
      };

      getUserByUsernameSpy.mockResolvedValueOnce(mockSafeUser);
      getUserByUsernameSpy.mockResolvedValueOnce(mockSafeUser2);

      updatedUserSpy.mockResolvedValue({ error: 'Error updating user' });

      const response = await supertest(app).patch('/user/unfollow').send(mockReqBody);

      expect(response.status).toBe(500);
    });

    it('should return 500 if updateUser returns an error for the second user', async () => {
      const mockReqBody = {
        follower: mockUser.username,
        followee: mockUser2.username,
      };

      getUserByUsernameSpy.mockResolvedValueOnce(mockSafeUser);
      getUserByUsernameSpy.mockResolvedValueOnce(mockSafeUser2);

      updatedUserSpy.mockResolvedValueOnce(mockSafeUser);
      updatedUserSpy.mockResolvedValueOnce({ error: 'Error updating user' });

      const response = await supertest(app).patch('/user/unfollow').send(mockReqBody);

      expect(response.status).toBe(500);
    });

    it('should return 500 if getUserByUsername returns an error', async () => {
      const mockReqBody = {
        follower: mockUser.username,
        followee: mockUser2.username,
      };

      getUserByUsernameSpy.mockResolvedValue({ error: 'Error getting user' });

      const response = await supertest(app).patch('/user/unfollow').send(mockReqBody);

      expect(response.status).toBe(500);
    });

    it('should return 500 if getUserByUsername returns an error for the second user', async () => {
      const mockReqBody = {
        follower: mockUser.username,
        followee: mockUser2.username,
      };

      getUserByUsernameSpy.mockResolvedValueOnce(mockSafeUser);
      getUserByUsernameSpy.mockResolvedValueOnce({ error: 'Error getting user' });

      const response = await supertest(app).patch('/user/unfollow').send(mockReqBody);

      expect(response.status).toBe(500);
    });
  });
});
