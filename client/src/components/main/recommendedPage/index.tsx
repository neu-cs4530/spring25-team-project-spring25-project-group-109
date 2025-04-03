import React, { useState } from 'react';
import { Box, Typography, Stack, Alert, FormControlLabel, Switch } from '@mui/material';
import useUserContext from '../../../hooks/useUserContext';
import useRecommendedFeed from '../../../hooks/useRecommendedFeed';
import FeedQuestionView from './feedQuestionView';
import { PopulatedDatabaseQuestion } from '../../../types/types';

type FeedReason = 'askedByFollowed' | 'upvotedByFollowed';

const RecommendedPostsPage = () => {
  const { user } = useUserContext();
  const { questions, error } = useRecommendedFeed();
  const [showOnlyUnupvoted, setShowOnlyUnupvoted] = useState(false);

  const filteredQuestions = showOnlyUnupvoted
    ? questions.filter(q => !q.upVotes.includes(user.username))
    : questions;

  return (
    <Box p={4}>
      <Box display='flex' justifyContent='space-between' alignItems='center' mb={2}>
        <Typography variant='h4'>Recommended Posts</Typography>
        <FormControlLabel
          control={
            <Switch
              checked={showOnlyUnupvoted}
              onChange={() => setShowOnlyUnupvoted(prev => !prev)}
              color='primary'
              size='medium'
            />
          }
          label={
            <Typography variant='body1' color='text.secondary'>
              Hide questions you&apos;ve upvoted
            </Typography>
          }
          sx={{ ml: 2 }}
        />
      </Box>
      <Typography variant='body1' mb={2} color='text.secondary'>
        {filteredQuestions.length === 0
          ? 'Follow more users to see recommended posts'
          : 'A personalized feed from people you follow'}
      </Typography>

      {error && <Alert severity='error'>{error}</Alert>}

      <Stack gap={2}>
        {filteredQuestions.map(question => (
          <FeedQuestionView
            key={String(question._id)}
            question={
              question as PopulatedDatabaseQuestion & {
                feedReasons: FeedReason[];
                followedUpvoters: string[];
              }
            }
          />
        ))}
      </Stack>
    </Box>
  );
};

export default RecommendedPostsPage;
