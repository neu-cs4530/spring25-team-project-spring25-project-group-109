import { useEffect, useState } from 'react';
import { PopulatedDatabaseQuestion } from '../types/types';
import { getPersonalizedFeed } from '../services/feedService';
import useUserContext from './useUserContext';

const useRecommendedFeed = () => {
  const { user }: { user: { username?: string } } = useUserContext();
  const [questions, setQuestions] = useState<PopulatedDatabaseQuestion[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeed = async () => {
      if (!user?.username) return;
      try {
        const data = await getPersonalizedFeed(user.username);
        setQuestions(data);
      } catch (err) {
        setError('Failed to load recommended questions.');
      }
    };

    fetchFeed();
  }, [user?.username]);

  return { questions, error };
};

export default useRecommendedFeed;
