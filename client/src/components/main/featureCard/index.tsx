import React from 'react';
import './index.css';
import { Feature } from '../../../types/types';

interface FeatureProps {
  feature: Feature;
  purchased: boolean;
  outOfBudget: boolean;
  onPurchase: () => void;
}

const FeatureCard: React.FC<FeatureProps> = ({ feature, purchased, outOfBudget, onPurchase }) => (
  <div className='feature'>
    <h3 className='feature-name'>{feature.name}</h3>
    <p className='feature-description'>{feature.description}</p>
    <div className='feature-footer'>
      <div className='feature-cost'>
        <img src='/images/icons/coin.png' alt='Coin icon' className='coin-icon' />
        <span>{feature.price} Coins</span>
      </div>
      {purchased ? (
        <span className='purchased-text'>Purchased!</span>
      ) : (
        <button className='purchase-btn' onClick={onPurchase} disabled={outOfBudget}>
          {outOfBudget ? 'Not Enough Coins' : 'Purchase'}
        </button>
      )}
    </div>
  </div>
);

export default FeatureCard;
