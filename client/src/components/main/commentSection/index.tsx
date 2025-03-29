import { useState } from 'react';
import { Box, Button, Collapse, Paper, TextField, Typography, Avatar, Stack } from '@mui/material';
import { getMetaData } from '../../../tool';
import { Comment, DatabaseComment, DatabaseUser } from '../../../types/types';
import './index.css';
import useUserContext from '../../../hooks/useUserContext';

type EnhancedComment = DatabaseComment & { commentBy: DatabaseUser };

/**
 * Interface representing the props for the Comment Section component.
 *
 * - comments - list of the comment components
 * - handleAddComment - a function that handles adding a new comment, taking a Comment object as an argument
 */
interface CommentSectionProps {
  comments: EnhancedComment[];
  handleAddComment: (comment: Comment) => void;
}

/**
 * CommentSection component shows the users all the comments and allows the users add more comments.
 *
 * @param comments: an array of Comment objects
 * @param handleAddComment: function to handle the addition of a new comment
 */
const CommentSection = ({ comments, handleAddComment }: CommentSectionProps) => {
  const { user } = useUserContext();
  const [text, setText] = useState<string>('');
  const [textErr, setTextErr] = useState<string>('');
  const [showComments, setShowComments] = useState<boolean>(false);

  /**
   * Function to handle the addition of a new comment.
   */
  const handleAddCommentClick = () => {
    if (text.trim() === '' || user.username.trim() === '') {
      setTextErr(text.trim() === '' ? 'Comment text cannot be empty' : '');
      return;
    }

    const newComment: Comment = {
      text,
      commentBy: user.username,
      commentDateTime: new Date(),
    };

    handleAddComment(newComment);
    setText('');
    setTextErr('');
  };

  return (
    <Box>
      <Button variant='outlined' size='small' onClick={() => setShowComments(!showComments)}>
        {showComments ? 'Hide Comments' : 'Show Comments'}
      </Button>
      <Collapse in={showComments} timeout='auto'>
        <Paper sx={{ p: 3, mt: 2 }} elevation={3}>
          {comments.length > 0 ? (
            comments.map(comment => (
              <Box key={String(comment._id)} sx={{ mb: 1 }}>
                <Typography variant='body1'>{comment.text}</Typography>
                <Stack direction='row' justifyContent='space-between' alignItems='center'>
                  <Stack
                    spacing={1}
                    direction='row'
                    justifyContent='space-between'
                    alignItems='center'>
                    <Avatar alt='No Photo' src={comment.commentBy.profilePhoto} />
                    <Typography variant='subtitle2' color='primary'>
                      {comment.commentBy.username}
                    </Typography>
                  </Stack>
                  <Typography variant='caption' color='text.secondary'>
                    {getMetaData(new Date(comment.commentDateTime))}
                  </Typography>
                </Stack>
              </Box>
            ))
          ) : (
            <Typography variant='body2' color='textSecondary'>
              No comments yet.
            </Typography>
          )}
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label='Add a comment'
              multiline
              minRows={2}
              value={text}
              onChange={e => setText(e.target.value)}
              error={!!textErr}
              helperText={textErr}
              fullWidth
            />
            <Button variant='contained' onClick={handleAddCommentClick}>
              Add Comment
            </Button>
          </Box>
        </Paper>
      </Collapse>
    </Box>
  );
};

export default CommentSection;
