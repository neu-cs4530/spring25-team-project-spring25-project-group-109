import { useEffect, useState } from 'react';
import './index.css';
import useUserContext from '../../../hooks/useUserContext';
import getUserStore from '../../../services/storeService';
import { DatabaseFeature, DatabaseStore } from '../../../types/types';
import { getFeatures } from '../../../services/featureService';
import FeatureCard from '../featureCard';

/**
 * StorePage component fetches and displays the user's coin balance.
 */
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

  // Handle loading state
  if (loading) {
    return (
      <div className='store-page'>
        <header className='store-header'>
          <h1>Store</h1>
        </header>
        <div className='store-content'>
          <p>Loading coins...</p>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className='store-page'>
        <header className='store-header'>
          <h1>Store</h1>
        </header>
        <div className='store-content'>
          <p className='error-message'>{error}</p>
        </div>
      </div>
    );
  }

  // Render the store content when data is available
  return (
    <div className='store-page'>
      <header className='store-header'>
        <h1>Store</h1>
        <p className='store-description'>
          Earn coins by asking and answering questions and messaging fellow users and use them to
          unlock cool features to level up your experience!
        </p>
      </header>

      <div className='store-content'>
        <div className='coin-box'>
          <img src='/images/icons/coin.png' alt='Coin icon' className='coin-icon' />
          <span className='coin-count'>{store?.coinCount || 0}</span>
        </div>
      </div>

      {features.map(feature => (
        <FeatureCard
          key={feature._id}
          feature={feature}
          // todo remove eslint disable on next line
          // eslint-disable-next-line no-console
          onPurchase={() => console.log('purchased - not really')} // Todo: Handle purchase on button click
          purchased={store?.unlockedFeatures.some(name => name === feature.name) || false}
          outOfBudget={(store?.coinCount || 0) < feature.price}
        />
      ))}
    </div>
  );
};

export default StorePage;
