import { useEffect, useState } from 'react';
import { Typography, CircularProgress, Alert, Box, Avatar, Stack, Chip } from '@mui/material';
import useUserContext from '../../../hooks/useUserContext';
import { getUserStore, purchaseFeature } from '../../../services/storeService';
import { DatabaseFeature, DatabaseStore } from '../../../types/types';
import { getFeatures } from '../../../services/featureService';
import FeatureCard from '../featureCard';

const StorePage = () => {
  const { user } = useUserContext();
  const [store, setStore] = useState<DatabaseStore>();
  const [features, setFeatures] = useState<DatabaseFeature[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserStore = async () => {
      if (!user?.username) return;
      try {
        const userStore = await getUserStore(user.username);
        setStore(userStore);
      } catch (err) {
        setError('Failed to load coin balance.');
      } finally {
        setLoading(false);
      }
    };

    const fetchFeatures = async () => {
      if (!user?.username) return;
      try {
        const featuresList = await getFeatures();
        setFeatures(featuresList);
      } catch (err) {
        setError('Failed to load features.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserStore();
    fetchFeatures();
  }, [user?.username]);

  if (loading) {
    return <CircularProgress></CircularProgress>;
  }

  if (error) {
    return (
      <Stack p={4}>
        <Typography variant='h4' gutterBottom>
          Store
        </Typography>
        <Alert severity='error'>{error}</Alert>
      </Stack>
    );
  }

  const onPurchase = async (username: string, featureName: string): Promise<void> => {
    try {
      const newStore = await purchaseFeature(username, featureName);
      setStore(newStore);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <Box p={4}>
      <Typography variant='h4' gutterBottom>
        {' '}
        Store{' '}
      </Typography>
      {error && <Alert severity='error'>{error}</Alert>}
      <Typography variant='body1'>
        Earn coins by asking and answering questions and messaging fellow users and use them to
        unlock cool features to level up your experience!
      </Typography>

      <Stack direction='row' alignItems='center' spacing={1} mt={2}>
        <Typography variant='body1' fontWeight='bold'>
          Balance:
        </Typography>
        <Chip
          avatar={<Avatar alt='Coin' src='/images/icons/coin.png' />}
          label={`${store?.coinCount || 0} ${store?.coinCount === 1 ? 'Coin' : 'Coins'}`}
          variant='outlined'
          sx={{ fontSize: '1rem', padding: '10px', height: '40px' }}
        />
      </Stack>

      <Stack mt={4} gap={2}>
        {features.map(feature => (
          <FeatureCard
            key={feature._id}
            feature={feature}
            onPurchase={() => onPurchase(user.username, feature.name)}
            purchased={store?.unlockedFeatures.some(name => name === feature.name) || false}
            outOfBudget={(store?.coinCount || 0) < feature.price}
          />
        ))}
      </Stack>
    </Box>
  );
};

export default StorePage;
