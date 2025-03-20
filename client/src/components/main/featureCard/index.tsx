import React from 'react';
import './index.css';
import { Box, Button, Paper, Stack, Typography, useTheme } from '@mui/material';
import { Feature } from '../../../types/types';

interface FeatureProps {
  feature: Feature;
  purchased: boolean;
  outOfBudget: boolean;
  onPurchase: () => void;
}

const FeatureCard: React.FC<FeatureProps> = ({ feature, purchased, outOfBudget, onPurchase }) => {
  const theme = useTheme();

  return (
    <Paper variant={'outlined'} sx={{ padding: 2, borderRadius: 2 }}>
      <Typography variant='h6' fontWeight='bold'>
        {feature.name}
      </Typography>
      <Typography variant='body2' color='text.secondary'>
        {feature.description}
      </Typography>

      <Stack direction='row' justifyContent='space-between' alignItems='center' mt={2}>
        <Stack direction='row' alignItems='center' spacing={1}>
          <Box component='img' src='/images/icons/coin.png' alt='Coin' width={24} height={24} />
          <Typography>{feature.price} Coins</Typography>
        </Stack>

        {purchased ? (
          <Typography fontWeight='bold' color={theme.palette.success.main}>
            Purchased!
          </Typography>
        ) : (
          <Button variant='contained' onClick={onPurchase} disabled={outOfBudget}>
            {outOfBudget ? 'Not Enough Coins' : 'Purchase'}
          </Button>
        )}
      </Stack>
    </Paper>
  );
};

export default FeatureCard;
