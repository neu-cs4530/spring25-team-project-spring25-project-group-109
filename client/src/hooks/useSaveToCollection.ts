import { useEffect, useState } from 'react';
import { DatabaseCollection, CollectionUpdatePayload } from '../types/types';
import {
  createCollection,
  getCollectionsByUsername,
  addQuestionToCollection,
} from '../services/collectionService';
import useUserContext from './useUserContext';

const useSaveToCollection = () => {
  const { user, socket } = useUserContext();
  const [collections, setCollections] = useState<DatabaseCollection[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    /**
     * Fetch collections for the current user and update state.
     */
    const fetchCollections = async () => {
      try {
        const data = await getCollectionsByUsername(user.username);
        setCollections(data);
      } catch {
        setError('Failed to load collections');
      }
    };

    /**
     * Handle collection updates from the socket.
     * @param update - the update payload containing the collection information.
     * @returns updated collections based on the type of update.
     */
    const handleCollectionUpdate = (update: CollectionUpdatePayload) => {
      setCollections(prevCollections => {
        switch (update.type) {
          case 'deleted':
            return prevCollections.filter(collection => collection._id !== update.collection._id);
          case 'created':
          case 'updated': {
            const existingIndex = prevCollections.findIndex(c => c._id === update.collection._id);
            if (existingIndex !== -1) {
              return prevCollections.map(c =>
                c._id === update.collection._id ? update.collection : c,
              );
            }
            return [update.collection, ...prevCollections];
          }
          default:
            return prevCollections;
        }
      });
    };

    fetchCollections();

    socket.on('collectionUpdate', handleCollectionUpdate);

    return () => {
      socket.off('collectionUpdate', handleCollectionUpdate);
    };
  }, [socket, user.username]);

  /**
   * Helper function to show success message for 3 seconds.
   * @param message - the message to display.
   */
  const showMessage = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  /**
   * Helper function to show error message for 3 seconds.
   * @param message - the message to display.
   */
  const showErrorMessage = (message: string) => {
    setError(message);
    setTimeout(() => setError(null), 3000);
  };

  /**
   * Function to create a new collection and save the question to it.
   * @param name name of the new collection
   * @param questionId id of the question to save
   */
  const handleCreateAndSave = async (name: string, questionId: string) => {
    if (!name.trim()) return;

    try {
      const newCollection = await createCollection({
        name,
        username: user.username,
        questions: [],
        visibility: 'public',
      });

      if (newCollection) {
        await addQuestionToCollection(newCollection._id.toString(), questionId);
        showMessage(`Created and saved to "${name}"`);
      }
    } catch {
      showErrorMessage(`A collection named "${name}" already exists.`);
    }
  };

  /**
   * Function to save a question to an existing collection.
   * @param collectionId ID of the collection to save the question to
   * @param collectionName name of the collection
   * @param questionId ID of the question to save
   */
  const handleSaveToExisting = async (
    collectionId: string,
    collectionName: string,
    questionId: string,
  ) => {
    try {
      await addQuestionToCollection(collectionId, questionId);
      showMessage(`Added to "${collectionName}"`);
    } catch {
      setError('Failed to add question to collection');
    }
  };

  return {
    collections,
    error,
    successMessage,
    handleCreateAndSave,
    handleSaveToExisting,
  };
};

export default useSaveToCollection;
