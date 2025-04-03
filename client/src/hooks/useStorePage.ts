import { DatabaseStore, StoreUpdatePayload } from '@fake-stack-overflow/shared';
import { useEffect, useState } from 'react';
import useUserContext from './useUserContext';
import { getUserStore } from '../services/storeService';

const useStore = (username: string) => {
  const [store, setStore] = useState<DatabaseStore>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user, socket } = useUserContext();

  useEffect(() => {
    const fetchStore = async () => {
      try {
        setLoading(true);
        const data = await getUserStore(username);
        setStore(data);
      } catch (err) {
        setError('Error fetching store');
      } finally {
        setLoading(false);
      }
    };

    const handleStoreUpdate = (update: StoreUpdatePayload) => {
      setStore(prevStore => {
        if (update.type === 'newCount' && update.username === user.username) {
          if (prevStore) {
            return {
              ...prevStore,
              coinCount: update.count,
            };
          }
        } else if (update.type === 'addition' && update.username === user.username) {
          if (prevStore) {
            return {
              ...prevStore,
              coinCount: prevStore.coinCount + update.count,
            };
          }
        }
        return prevStore;
      });
    };

    fetchStore();

    socket.on('storeUpdate', handleStoreUpdate);

    return () => {
      socket.off('storeUpdate', handleStoreUpdate);
    };
  }, [username, socket, user.username]);

  return {
    store,
    loading,
    error,
  };
};

export default useStore;
