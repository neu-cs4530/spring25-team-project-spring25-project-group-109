import { Box, Chip } from '@mui/material';
import QuestionView from '../../questionPage/question';
import { PopulatedDatabaseQuestion } from '../../../../types/types';

type FeedReason = 'askedByFollowed' | 'upvotedByFollowed';

interface FeedQuestionProps {
  question: PopulatedDatabaseQuestion & {
    feedReasons: FeedReason[];
    followedUpvoters: string[];
  };
}

const FeedQuestionView = ({ question }: FeedQuestionProps) => (
  <Box>
    <Box px={2} pt={1} pb={0}>
      {question.feedReasons.includes('askedByFollowed') && (
        <Chip label={`Asked by someone you follow`} size='small' color='secondary' sx={{ mb: 1 }} />
      )}
      {question.feedReasons.includes('upvotedByFollowed') &&
        question.followedUpvoters.length > 0 && (
          <Chip
            label={`Upvoted by ${
              question.followedUpvoters.length === 1 ? 'someone you follow' : 'people you follow'
            }: ${question.followedUpvoters.join(', ')}`}
            size='small'
            color='secondary'
            sx={{ mb: 1 }}
          />
        )}
    </Box>

    <QuestionView question={question} />
  </Box>
);

export default FeedQuestionView;
