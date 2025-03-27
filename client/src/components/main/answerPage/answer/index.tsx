import React from 'react';
import { Card, CardContent, Paper, Stack, Typography, Avatar } from '@mui/material';
import CommentSection from '../../commentSection';
import './index.css';
import { Comment, DatabaseUser, PopulatedDatabaseComment } from '../../../../types/types';

/**
 * Interface representing the props for the AnswerView component.
 *
 * - text The content of the answer.
 * - ansBy The username of the user who wrote the answer.
 * - meta Additional metadata related to the answer.
 * - comments An array of comments associated with the answer.
 * - handleAddComment Callback function to handle adding a new comment.
 */
interface AnswerProps {
  text: string;
  ansBy: DatabaseUser;
  meta: string;
  comments: PopulatedDatabaseComment[];
  handleAddComment: (comment: Comment) => void;
}

/**
 * AnswerView component that displays the content of an answer with the author's name and metadata.
 * The answer text is processed to handle hyperlinks, and a comment section is included.
 *
 * @param text The content of the answer.
 * @param ansBy The username of the answer's author.
 * @param meta Additional metadata related to the answer.
 * @param comments An array of comments associated with the answer.
 * @param handleAddComment Function to handle adding a new comment.
 */
const AnswerView = ({ text, ansBy, meta, comments, handleAddComment }: AnswerProps) => (
  <Paper elevation={1} sx={{ p: 1, borderRadius: 2 }}>
    <Card sx={{ boxShadow: 'none' }}>
      <CardContent>
        <Stack spacing={2}>
          <Typography variant='body1' sx={{ mb: 2 }}>
            {text}
          </Typography>
          <Stack direction='row' justifyContent='space-between' alignItems='center' sx={{ mt: 1 }}>
            <Stack spacing={1} direction='row' justifyContent='space-between' alignItems='center'>
              <Avatar alt='No Photo' src={ansBy.profilePhoto} />
              <Typography variant='subtitle2' color='primary'>
                {ansBy.username}
              </Typography>
            </Stack>
            <Typography variant='caption' color='text.secondary'>
              {meta}
            </Typography>
          </Stack>
          <CommentSection comments={comments} handleAddComment={handleAddComment} />
        </Stack>
      </CardContent>
    </Card>
  </Paper>
);

export default AnswerView;
