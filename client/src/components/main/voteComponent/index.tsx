import './index.css';
import { IconButton, Stack, Typography } from '@mui/material';
import { ThumbDown, ThumbUp } from '@mui/icons-material';
import { downvoteQuestion, upvoteQuestion } from '../../../services/questionService';
import useUserContext from '../../../hooks/useUserContext';
import { PopulatedDatabaseQuestion } from '../../../types/types';
import useVoteStatus from '../../../hooks/useVoteStatus';

/**
 * Interface represents the props for the VoteComponent.
 *
 * question - The question object containing voting information.
 */
interface VoteComponentProps {
  question: PopulatedDatabaseQuestion;
}

/**
 * A Vote component that allows users to upvote or downvote a question.
 *
 * @param question - The question object containing voting information.
 */
const VoteComponent = ({ question }: VoteComponentProps) => {
  const { user } = useUserContext();
  const { count, voted } = useVoteStatus({ question });

  /**
   * Function to handle upvoting or downvoting a question.
   *
   * @param type - The type of vote, either 'upvote' or 'downvote'.
   */
  const handleVote = async (type: string) => {
    try {
      if (question._id) {
        if (type === 'upvote') {
          await upvoteQuestion(question._id, user.username);
        } else if (type === 'downvote') {
          await downvoteQuestion(question._id, user.username);
        }
      }
    } catch (error) {
      // Handle error
    }
  };

  return (
    <Stack direction='row' alignItems='center' spacing={1}>
      <IconButton
        onClick={() => handleVote('upvote')}
        color={voted === 1 ? 'primary' : 'default'}
        aria-label='Upvote'>
        <ThumbUp />
      </IconButton>
      <Typography variant='h6' fontWeight='bold'>
        {count}
      </Typography>
      <IconButton
        onClick={() => handleVote('downvote')}
        color={voted === -1 ? 'error' : 'default'}
        aria-label='Downvote'>
        <ThumbDown />
      </IconButton>
    </Stack>
  );
};

export default VoteComponent;
