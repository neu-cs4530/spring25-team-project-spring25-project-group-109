import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getUserByUsername,
  deleteUser,
  resetPassword,
  updateBiography,
  updateProfilePhoto,
  follow,
  unfollow,
  uploadProfilePhoto,
} from '../services/userService';
import { getBadges } from '../services/badgeService';
import { DatabaseBadge, SafeDatabaseUser } from '../types/types';
import useUserContext from './useUserContext';
import { getUserStore } from '../services/storeService';

const AVAILABLE_AVATARS = [
  '/images/avatars/default-avatar.png',
  '/images/avatars/avatar1.png',
  '/images/avatars/avatar2.png',
  '/images/avatars/avatar3.png',
  '/images/avatars/avatar4.png',
];

/**
 * A custom hook to encapsulate all logic/state for the ProfileSettings component.
 */
const useProfileSettings = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useUserContext();

  // Local state
  const [userData, setUserData] = useState<SafeDatabaseUser | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [editBioMode, setEditBioMode] = useState(false);
  const [newBio, setNewBio] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [editProfilePhotoMode, setEditProfilePhotoMode] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string>('/images/avatars/default-avatar.png');
  const [allBadges, setAllBadges] = useState<DatabaseBadge[] | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [permissions, setPermissions] = useState<{ customPhoto: boolean }>({ customPhoto: false });

  // For delete-user confirmation modal
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const canEditProfile =
    currentUser.username && userData?.username ? currentUser.username === userData.username : false;

  const followsCurrentUser = userData?.following.includes(currentUser.username);

  useEffect(() => {
    if (!username) return;

    const fetchUserData = async () => {
      try {
        setLoading(true);
        const data = await getUserByUsername(username);
        setUserData(data);
        setProfilePhoto(String(data.profilePhoto) || '/images/avatars/default-avatar.png');
        const userStore = await getUserStore(currentUser.username);
        setPermissions({
          customPhoto: userStore.unlockedFeatures.includes('Custom Profile Photo'),
        });
      } catch (error) {
        setErrorMessage('Error fetching user profile');
        setUserData(null);
      } finally {
        setLoading(false);
      }
    };

    const fetchBadges = async () => {
      try {
        const badgesData = await getBadges();
        setAllBadges(badgesData);
      } catch (error) {
        setErrorMessage('Error fetching badges');
        setAllBadges(null);
      }
    };

    fetchUserData();
    fetchBadges();
  }, [username, currentUser.username]);

  useEffect(() => {
    if (userData) {
      setIsFollowing(userData.followers.includes(currentUser.username));
    }
  }, [userData, currentUser.username]);

  /**
   * Toggles the visibility of the password fields.
   */
  const togglePasswordVisibility = () => {
    setShowPassword(prevState => !prevState);
  };

  /**
   * Validate the password fields before attempting to reset.
   */
  const validatePasswords = () => {
    if (newPassword.trim() === '' || confirmNewPassword.trim() === '') {
      setErrorMessage('Please enter and confirm your new password.');
      return false;
    }
    if (newPassword !== confirmNewPassword) {
      setErrorMessage('Passwords do not match.');
      return false;
    }
    return true;
  };

  /**
   * Handler for resetting the password
   */
  const handleResetPassword = async () => {
    if (!username) return;
    if (!validatePasswords()) {
      return;
    }
    try {
      await resetPassword(username, newPassword);
      setSuccessMessage('Password reset successful!');
      setErrorMessage(null);
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (error) {
      setErrorMessage('Failed to reset password.');
      setSuccessMessage(null);
    }
  };

  const handleUpdateBiography = async () => {
    if (!username) return;
    try {
      // Await the async call to update the biography
      const updatedUser = await updateBiography(username, newBio);

      // Ensure state updates occur sequentially after the API call completes
      await new Promise(resolve => {
        setUserData(updatedUser); // Update the user data
        setEditBioMode(false); // Exit edit mode
        resolve(null); // Resolve the promise
      });

      setSuccessMessage('Biography updated!');
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage('Failed to update biography.');
      setSuccessMessage(null);
    }
  };

  const handleUpdateProfilePhoto = async (avatar: string) => {
    if (!username || !avatar) return;
    try {
      const updatedUser = await updateProfilePhoto(username, avatar);
      await new Promise(resolve => {
        setUserData(updatedUser);
        setProfilePhoto(avatar);
        setEditProfilePhotoMode(false);
        resolve(null);
      });
      setSuccessMessage('Profile photo updated!');
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage('Failed to update profile photo.');
      setSuccessMessage(null);
    }
  };

  const handleUploadProfilePhoto = async (file: File) => {
    if (!username || !file) return;
    try {
      const newPhotoUrl = await uploadProfilePhoto(username, file);
      setUserData(prev => (prev ? { ...prev, profilePhoto: newPhotoUrl } : null));
      setProfilePhoto(newPhotoUrl);
      setEditProfilePhotoMode(false);
      setSuccessMessage('Profile photo uploaded successfully!');
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage('Failed to upload profile photo.');
      setSuccessMessage(null);
    }
  };

  const handleFollowUser = async () => {
    if (!username || !currentUser.username) return;
    try {
      await follow(currentUser.username, username);
      setIsFollowing(true);
      setUserData(prevUserData => {
        if (!prevUserData) return null;
        return {
          ...prevUserData,
          followers: [...prevUserData.followers, currentUser.username],
        };
      });
      setSuccessMessage('User followed!');
    } catch (error) {
      setErrorMessage('Failed to follow user.');
    }
  };

  const handleUnfollowUser = async () => {
    if (!username || !currentUser.username) return;
    try {
      await unfollow(currentUser.username, username);
      setIsFollowing(false);
      setUserData(prevUserData => {
        if (!prevUserData) return null;
        return {
          ...prevUserData,
          followers: prevUserData.followers.filter(follower => follower !== currentUser.username),
        };
      });
      setSuccessMessage('User unfollowed!');
    } catch (error) {
      setErrorMessage('Failed to unfollow user.');
    }
  };

  /**
   * Handler for deleting the user (triggers confirmation modal)
   */
  const handleDeleteUser = () => {
    if (!username) return;
    setShowConfirmation(true);
    setPendingAction(() => async () => {
      try {
        await deleteUser(username);
        setSuccessMessage(`User "${username}" deleted successfully.`);
        setErrorMessage(null);
        navigate('/');
      } catch (error) {
        setErrorMessage('Failed to delete user.');
        setSuccessMessage(null);
      } finally {
        setShowConfirmation(false);
      }
    });
  };

  return {
    userData,
    profilePhoto,
    handleUpdateProfilePhoto,
    availableAvatars: AVAILABLE_AVATARS,
    editProfilePhotoMode,
    setEditProfilePhotoMode,
    isFollowing,
    showFollowers,
    setShowFollowers,
    showFollowing,
    setShowFollowing,
    newPassword,
    confirmNewPassword,
    setNewPassword,
    setConfirmNewPassword,
    loading,
    editBioMode,
    allBadges,
    setEditBioMode,
    newBio,
    setNewBio,
    successMessage,
    errorMessage,
    showConfirmation,
    setShowConfirmation,
    pendingAction,
    setPendingAction,
    canEditProfile,
    followsCurrentUser,
    showPassword,
    togglePasswordVisibility,
    handleResetPassword,
    handleUpdateBiography,
    handleDeleteUser,
    handleFollowUser,
    handleUnfollowUser,
    handleUploadProfilePhoto,
    permissions,
  };
};

export default useProfileSettings;
