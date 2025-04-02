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
import { DatabaseBadge, DatabaseCollection, SafeDatabaseUser } from '../types/types';
import useUserContext from './useUserContext';
import {
  createCollection,
  deleteCollection,
  getCollectionsByUsername,
  removeQuestionFromCollection,
  renameCollection,
  updateCollectionVisibility,
} from '../services/collectionService';
import useQuestionPage from './useQuestionPage';
import { getUserStore } from '../services/storeService';

const AVAILABLE_AVATARS = [
  '/images/avatars/avatar1.png',
  '/images/avatars/avatar2.png',
  '/images/avatars/avatar3.png',
  '/images/avatars/avatar4.png',
  '/images/avatars/avatar5.png',
];

const ADDITIONAL_AVATARS = [
  '/images/avatars/additional/avatar1.png',
  '/images/avatars/additional/avatar2.png',
  '/images/avatars/additional/avatar3.png',
  '/images/avatars/additional/avatar4.png',
  '/images/avatars/additional/avatar5.png',
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
  const [profilePhoto, setProfilePhoto] = useState<string>('');
  const [allBadges, setAllBadges] = useState<DatabaseBadge[] | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [permissions, setPermissions] = useState<{
    customPhoto: boolean;
    additionalAvatars: boolean;
  }>({ customPhoto: false, additionalAvatars: false });
  const [showAddCollection, setShowAddCollection] = useState(false);
  const [collections, setCollections] = useState<DatabaseCollection[]>([]);
  const [collectionName, setCollectionName] = useState<string>('');
  
  // For delete-user confirmation modal
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const { clickQuestion } = useQuestionPage();

  const canEditProfile =
    currentUser.username && userData?.username ? currentUser.username === userData.username : false;

  const handleCollectionInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const fieldText = event.target.value;
    setCollectionName(fieldText);
  };

  const handleRemoveQuestion = async (
    collectionId: string,
    questionId: string,
    setCollectionErrorMessage: (message: string) => void,
  ) => {
    if (!userData) return;
    try {
      await removeQuestionFromCollection(collectionId, questionId);
      const collectionsData = await getCollectionsByUsername(
        userData.username,
        currentUser.username,
      );
      setCollections(collectionsData);
    } catch (error) {
      setCollectionErrorMessage('Failed to remove question.');
    }
  };

  const handleUpdateCollection = async (
    collectionId: string,
    newName: string,
    setCollectionErrorMessage: (message: string) => void,
  ) => {
    if (!userData) return;
    try {
      await renameCollection(collectionId, newName);
      const collectionsData = await getCollectionsByUsername(
        userData.username,
        currentUser.username,
      );
      setCollections(collectionsData);
    } catch (error) {
      setCollectionErrorMessage('Failed to update collection.');
    }
  };

  const handleTogglePrivacy = async (
    collectionId: string,
    isPrivate: boolean, // new value
    setCollectionErrorMessage: (message: string) => void,
  ) => {
    if (!userData) return;
    try {
      await updateCollectionVisibility(collectionId, isPrivate ? 'private' : 'public');
      const collectionsData = await getCollectionsByUsername(
        userData.username,
        currentUser.username,
      );
      setCollections(collectionsData);
    } catch (error) {
      setCollectionErrorMessage('Failed to update collection.');
    }
  };

  const handleDeleteCollection = async (
    collectionId: string,
    setCollectionErrorMessage: (message: string) => void,
  ) => {
    if (!userData) return;
    try {
      await deleteCollection(collectionId);
      const collectionsData = await getCollectionsByUsername(
        userData.username,
        currentUser.username,
      );
      setCollections(collectionsData);
    } catch (error) {
      setCollectionErrorMessage('Failed to delete collection');
    }
  };

  const handleAddCollection = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!collectionName || !userData) return;
    try {
      const newCollection = await createCollection({
        name: collectionName,
        username: userData.username,
        questions: [],
        visibility: 'public',
      });
      setCollections(prevCollections => [...prevCollections, newCollection]);
      setShowAddCollection(false);
      setCollectionName('');
      setSuccessMessage('Collection added!');
    } catch (error) {
      setErrorMessage('Failed to add collection.');
    }
  };
  const followsCurrentUser = userData?.following.includes(currentUser.username) || false;

  useEffect(() => {
    if (!username) return;

    const fetchUserData = async () => {
      try {
        setLoading(true);
        const data = await getUserByUsername(username);
        setUserData(data);
        setProfilePhoto(String(data.profilePhoto));
        const userStore = await getUserStore(currentUser.username);
        setPermissions({
          customPhoto: userStore.unlockedFeatures.includes('Custom Profile Photo'),
          additionalAvatars: userStore.unlockedFeatures.includes('Additional Avatars'),
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

    const fetchCollections = async () => {
      try {
        const collectionsData = await getCollectionsByUsername(username, currentUser.username);
        setCollections(collectionsData);
      } catch (error) {
        setErrorMessage('Error fetching collections');
        setCollections([]);
      }
    };

    fetchUserData();
    fetchBadges();
    fetchCollections();
  }, [currentUser.username, username]);

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
    if (!username) return;
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
    availableAvatars: permissions.additionalAvatars
      ? AVAILABLE_AVATARS.concat(ADDITIONAL_AVATARS)
      : AVAILABLE_AVATARS,
    collectionName,
    clickQuestion,
    editProfilePhotoMode,
    setEditProfilePhotoMode,
    isFollowing,
    showFollowers,
    setShowFollowers,
    showFollowing,
    setShowFollowing,
    handleCollectionInputChange,
    newPassword,
    confirmNewPassword,
    setNewPassword,
    setConfirmNewPassword,
    loading,
    editBioMode,
    allBadges,
    showAddCollection,
    setShowAddCollection,
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
    collections,
    handleAddCollection,
    handleUpdateCollection,
    togglePasswordVisibility,
    handleResetPassword,
    handleUpdateBiography,
    handleDeleteUser,
    handleFollowUser,
    handleUnfollowUser,
    handleDeleteCollection,
    handleTogglePrivacy,
    handleUploadProfilePhoto,
    handleRemoveQuestion,
    permissions,
  };
};

export default useProfileSettings;
