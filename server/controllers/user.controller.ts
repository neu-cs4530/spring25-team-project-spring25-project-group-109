import express, { Request, Response, Router } from 'express';
import {
  UserRequest,
  User,
  UserCredentials,
  UserByUsernameRequest,
  FakeSOSocket,
  UpdateBiographyRequest,
  UpdateProfilePhotoRequest,
  ToggleFollowRequest,
} from '../types/types';
import {
  deleteUserByUsername,
  getUserByUsername,
  getUsersList,
  loginUser,
  saveUser,
  saveUserStats,
  saveUserStore,
  updateUser,
} from '../services/user.service';
import { saveNotification } from '../services/notification.service';
import multer from 'multer';
import path from 'path';

const userController = (socket: FakeSOSocket) => {
  const router: Router = express.Router();

  /**
   * Validates that the request body contains all required fields for a user.
   * @param req The incoming request containing user data.
   * @returns `true` if the body contains valid user fields; otherwise, `false`.
   */
  const isUserBodyValid = (req: UserRequest): boolean =>
    req.body !== undefined &&
    req.body.username !== undefined &&
    req.body.username !== '' &&
    req.body.password !== undefined &&
    req.body.password !== '';

  /**
   * Validates that the request body contains all required fields to update a biography.
   * @param req The incoming request containing user data.
   * @returns `true` if the body contains valid user fields; otherwise, `false`.
   */
  const isUpdateBiographyBodyValid = (req: UpdateBiographyRequest): boolean =>
    req.body !== undefined &&
    req.body.username !== undefined &&
    req.body.username.trim() !== '' &&
    req.body.biography !== undefined;

  /**
   * Validates that the request body contains all required fields to update a biography.
   * @param req The incoming request containing user data.
   * @returns `true` if the body contains valid user fields; otherwise, `false`.
   */
  const isUpdateProfilePhotoBodyValid = (req: UpdateProfilePhotoRequest): boolean =>
    req.body !== undefined &&
    req.body.username !== undefined &&
    req.body.username.trim() !== '' &&
    req.body.profilePhoto !== undefined;

  /**
   * Handles the creation of a new user account.
   * @param req The request containing username, email, and password in the body.
   * @param res The response, either returning the created user or an error.
   * @returns A promise resolving to void.
   */
  const createUser = async (req: UserRequest, res: Response): Promise<void> => {
    if (!isUserBodyValid(req)) {
      res.status(400).send('Invalid user body');
      return;
    }

    const requestUser = req.body;

    const user: User = {
      ...requestUser,
      dateJoined: new Date(),
      biography: requestUser.biography ?? '',
      profilePhoto: requestUser.profilePhoto ?? '/images/avatars/default-avatar.png',
      badgesEarned: [],
      followers: [],
      following: [],
    };

    try {
      const result = await saveUser(user);

      if ('error' in result) {
        throw new Error(result.error);
      }

      // Create corresponding user stats object
      const statsResult = await saveUserStats(result.username);
      if ('error' in statsResult) {
        throw new Error(statsResult.error);
      }

      // Create corresponding user store object
      const storeResult = await saveUserStore(result.username);
      if ('error' in storeResult) {
        throw new Error(storeResult.error);
      }

      socket.emit('userUpdate', {
        user: result,
        type: 'created',
      });
      res.status(200).json({ user: result, userStats: statsResult, userStore: storeResult });
    } catch (error) {
      res.status(500).send(`Error when saving user: ${error}`);
    }
  };

  /**
   * Handles user login by validating credentials.
   * @param req The request containing username and password in the body.
   * @param res The response, either returning the user or an error.
   * @returns A promise resolving to void.
   */
  const userLogin = async (req: UserRequest, res: Response): Promise<void> => {
    try {
      if (!isUserBodyValid(req)) {
        res.status(400).send('Invalid user body');
        return;
      }

      const loginCredentials: UserCredentials = {
        username: req.body.username,
        password: req.body.password,
      };

      const user = await loginUser(loginCredentials);

      if ('error' in user) {
        throw Error(user.error);
      }

      res.status(200).json(user);
    } catch (error) {
      res.status(500).send('Login failed');
    }
  };

  /**
   * Retrieves a user by their username.
   * @param req The request containing the username as a route parameter.
   * @param res The response, either returning the user or an error.
   * @returns A promise resolving to void.
   */
  const getUser = async (req: UserByUsernameRequest, res: Response): Promise<void> => {
    try {
      const { username } = req.params;

      const user = await getUserByUsername(username);

      if ('error' in user) {
        throw Error(user.error);
      }

      res.status(200).json(user);
    } catch (error) {
      res.status(500).send(`Error when getting user by username: ${error}`);
    }
  };

  /**
   * Retrieves all users from the database.
   * @param res The response, either returning the users or an error.
   * @returns A promise resolving to void.
   */
  const getUsers = async (_: Request, res: Response): Promise<void> => {
    try {
      const users = await getUsersList();

      if ('error' in users) {
        throw Error(users.error);
      }

      res.status(200).json(users);
    } catch (error) {
      res.status(500).send(`Error when getting users: ${error}`);
    }
  };

  /**
   * Deletes a user by their username.
   * @param req The request containing the username as a route parameter.
   * @param res The response, either confirming deletion or returning an error.
   * @returns A promise resolving to void.
   */
  const deleteUser = async (req: UserByUsernameRequest, res: Response): Promise<void> => {
    try {
      const { username } = req.params;

      const deletedUser = await deleteUserByUsername(username);

      if ('error' in deletedUser) {
        throw Error(deletedUser.error);
      }

      socket.emit('userUpdate', {
        user: deletedUser,
        type: 'deleted',
      });
      res.status(200).json(deletedUser);
    } catch (error) {
      res.status(500).send(`Error when deleting user by username: ${error}`);
    }
  };

  /**
   * Resets a user's password.
   * @param req The request containing the username and new password in the body.
   * @param res The response, either confirming the update or returning an error.
   * @returns A promise resolving to void.
   */
  const resetPassword = async (req: UserRequest, res: Response): Promise<void> => {
    try {
      if (!isUserBodyValid(req)) {
        res.status(400).send('Invalid user body');
        return;
      }

      const updatedUser = await updateUser(req.body.username, { password: req.body.password });

      if ('error' in updatedUser) {
        throw Error(updatedUser.error);
      }

      res.status(200).json(updatedUser);
    } catch (error) {
      res.status(500).send(`Error when updating user password: ${error}`);
    }
  };

  /**
   * Updates a user's biography.
   * @param req The request containing the username and biography in the body.
   * @param res The response, either confirming the update or returning an error.
   * @returns A promise resolving to void.
   */
  const updateBiography = async (req: UpdateBiographyRequest, res: Response): Promise<void> => {
    try {
      if (!isUpdateBiographyBodyValid(req)) {
        res.status(400).send('Invalid user body');
        return;
      }

      // Validate that request has username and biography
      const { username, biography } = req.body;

      // Call the same updateUser(...) service used by resetPassword
      const updatedUser = await updateUser(username, { biography });

      if ('error' in updatedUser) {
        throw new Error(updatedUser.error);
      }

      // Emit socket event for real-time updates
      socket.emit('userUpdate', {
        user: updatedUser,
        type: 'updated',
      });

      res.status(200).json(updatedUser);
    } catch (error) {
      res.status(500).send(`Error when updating user biography: ${error}`);
    }
  };

  /**
   * Updates a user's profile photo.
   * @param req The request containing the username and profile photo path.
   * @param res The response, either confirming the update or returning an error.
   * @returns A promise resolving to void.
   */
  const updateProfilePhoto = async (
    req: UpdateProfilePhotoRequest,
    res: Response,
  ): Promise<void> => {
    try {
      if (!isUpdateProfilePhotoBodyValid(req)) {
        res.status(400).send('Invalid user body');
        return;
      }

      // Validate that request has username and profile photo
      const { username, profilePhoto } = req.body;

      // Call the same updateUser(...) service used by resetPassword
      const updatedUser = await updateUser(username, { profilePhoto });

      if ('error' in updatedUser) {
        throw new Error(updatedUser.error);
      }

      // Emit socket event for real-time updates
      socket.emit('userUpdate', {
        user: updatedUser,
        type: 'updated',
      });

      res.status(200).json(updatedUser);
    } catch (error) {
      res.status(500).send(`Error when updating user profile photo: ${error}`);
    }
  };

  const uploadProfilePhoto = async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const filePath = `/uploads/${req.file.filename}`;
      const username = req.body.username;

      const updatedUser = await updateUser(username, { profilePhoto: filePath });

      res.status(200).json({ imageUrl: filePath, user: updatedUser });
    } catch (error) {
      res.status(500).json({ error: 'Error uploading file' });
    }
  };

  /**
   * Adds a user to another user's followers and vice versa for following.
   * @param req The request containing the two usernames in the body.
   * @param res The response, either confirming the update or returning an error.
   * @returns A promise resolving to void.
   */
  const follow = async (req: ToggleFollowRequest, res: Response): Promise<void> => {
    try {
      const { follower, followee } = req.body;

      if (!follower || !followee) {
        res.status(400).send('Invalid body');
        return;
      }
      if (follower === followee) {
        res.status(400).send('Cannot follow yourself');
        return;
      }

      const followerUser = await getUserByUsername(follower);
      const followeeUser = await getUserByUsername(followee);

      if ('error' in followerUser) {
        throw new Error(followerUser.error);
      }
      if ('error' in followeeUser) {
        throw new Error(followeeUser.error);
      }

      const result1 = await updateUser(follower, {
        following: [...followerUser.following, followee],
      });
      const result2 = await updateUser(followee, {
        followers: [...followeeUser.followers, follower],
      });

      if ('error' in result1) {
        throw new Error(result1.error);
      }
      if ('error' in result2) {
        throw new Error(result2.error);
      }

      // send a notification to the followee
      await saveNotification({
        username: followee,
        text: `${follower} followed you!`,
        seen: false,
        type: 'follow',
      });

      res.status(200).json([result1, result2]);
    } catch (error) {
      res.status(500).send(`Error when following: ${error}`);
    }
  };

  /**
   * Removes a user from another user's followers and vice versa for following.
   * @param req The request containing the two usernames in the body.
   * @param res The response, either confirming the update or returning an error.
   * @returns A promise resolving to void.
   */
  const unfollow = async (req: ToggleFollowRequest, res: Response): Promise<void> => {
    try {
      const { follower, followee } = req.body;

      if (!follower || !followee) {
        res.status(400).send('Invalid body');
        return;
      }

      if (follower === followee) {
        res.status(400).send('Cannot unfollow yourself');
        return;
      }

      const followerUser = await getUserByUsername(follower);
      const followeeUser = await getUserByUsername(followee);

      if ('error' in followerUser) {
        throw new Error(followerUser.error);
      }

      if ('error' in followeeUser) {
        throw new Error(followeeUser.error);
      }

      const result1 = await updateUser(follower, {
        following: followerUser.following.filter(user => user !== followee),
      });

      if ('error' in result1) {
        throw new Error(result1.error);
      }

      const result2 = await updateUser(followee, {
        followers: followeeUser.followers.filter(user => user !== follower),
      });

      if ('error' in result2) {
        throw new Error(result2.error);
      }

      res.status(200).json([result1, result2]);
    } catch (error) {
      res.status(500).send(`Error when unfollowing: ${error}`);
    }
  };

  const storage = multer.diskStorage({
    destination: '../client/public/uploads/',
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname));
    },
  });

  const upload = multer({ storage });

  // Define routes for the user-related operations.
  router.post('/signup', createUser);
  router.post('/login', userLogin);
  router.patch('/resetPassword', resetPassword);
  router.get('/getUser/:username', getUser);
  router.get('/getUsers', getUsers);
  router.delete('/deleteUser/:username', deleteUser);
  router.patch('/updateBiography', updateBiography);
  router.patch('/updateProfilePhoto', updateProfilePhoto);
  router.patch('/follow', follow);
  router.patch('/unfollow', unfollow);
  router.post('/uploadProfilePhoto', upload.single('file'), uploadProfilePhoto);

  return router;
};

export default userController;
