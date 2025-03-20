import { useEffect, useState } from 'react';
import { Typography, CircularProgress, Alert, Box, Avatar, Stack, Chip } from '@mui/material';
import useUserContext from '../../../hooks/useUserContext';
import getUserStore from '../../../services/storeService';
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

      <Chip
        avatar={<Avatar alt='Coin' src='/images/icons/coin.png' />}
        label={`${store?.coinCount || 0} ${store?.coinCount === 1 ? 'Coin' : 'Coins'}`}
        variant='outlined'
        sx={{ fontSize: '1rem', padding: '10px', height: '40px', mt: 2 }}
      />

      <Stack mt={4} gap={2}>
        {features.map(feature => (
          <FeatureCard
            key={feature._id}
            feature={feature}
            // todo remove next line comment
            // eslint-disable-next-line no-console
            onPurchase={() => console.log('purchased - not really')}
            purchased={store?.unlockedFeatures.some(name => name === feature.name) || false}
            outOfBudget={(store?.coinCount || 0) < feature.price}
          />
        ))}
      </Stack>
    </Box>
  );
};

export default StorePage;
