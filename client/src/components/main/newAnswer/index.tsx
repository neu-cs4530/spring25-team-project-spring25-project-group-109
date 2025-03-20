import React from 'react';
import { TextField, Button, Box, Stack, Typography } from '@mui/material';
import useAnswerForm from '../../../hooks/useAnswerForm';

/**
 * NewAnswerPage component allows users to submit an answer to a specific question.
 */
const NewAnswerPage = () => {
  const { text, textErr, setText, postAnswer } = useAnswerForm();

  return (
    <Box sx={{ maxWidth: 600, margin: '0 auto', padding: 4 }}>
      <Stack spacing={3}>
        <Typography variant='h4' gutterBottom>
          Submit Your Answer
        </Typography>

        <TextField
          fullWidth
          label='Answer Text'
          placeholder='Write your answer here...'
          id='answerTextInput'
          value={text}
          onChange={e => setText(e.target.value)}
          error={Boolean(textErr)}
          helperText={textErr}
          multiline
          rows={4}
        />

        <Button variant='contained' fullWidth onClick={postAnswer}>
          Post Answer
        </Button>

        <Typography variant='body2' color='textSecondary' textAlign='center'>
          <strong>*</strong> indicates mandatory fields
        </Typography>
      </Stack>
    </Box>
  );
};

export default NewAnswerPage;
