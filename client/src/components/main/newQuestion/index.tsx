import React from 'react';
import { Box, Button, Stack, TextField, Typography, Autocomplete } from '@mui/material';
import useNewQuestion from '../../../hooks/useNewQuestion';
import './index.css';

/**
 * NewQuestionPage component allows users to submit a new question with a title,
 * description, tags, and username.
 */
const NewQuestionPage = () => {
  const {
    title,
    setTitle,
    text,
    setText,
    tagNames,
    setTagNames,
    titleErr,
    textErr,
    tagErr,
    postQuestion,
    existingTags, // List of predefined tags
  } = useNewQuestion();

  return (
    <Box sx={{ maxWidth: 600, margin: '0 auto', padding: 4 }}>
      <Stack spacing={3}>
        <Typography variant='h4' gutterBottom>
          Submit a New Question
        </Typography>
        <Box>
          <TextField
            fullWidth
            label='Question Title'
            id='formTitleInput'
            value={title}
            onChange={e => setTitle(e.target.value)}
            error={Boolean(titleErr)}
            helperText={titleErr}
          />
        </Box>
        <Box>
          <TextField
            fullWidth
            label='Question Text'
            placeholder='Add details'
            id='formTextInput'
            value={text}
            onChange={e => setText(e.target.value)}
            error={Boolean(textErr)}
            helperText={textErr}
            multiline
            rows={4}
          />
        </Box>
        <Box>
          <Autocomplete
            multiple
            id='tags'
            options={existingTags} // Predefined tags
            freeSolo
            value={tagNames} // Array of selected tags
            onChange={(event, newValue) => setTagNames(newValue)} // Update the tags
            renderInput={params => (
              <TextField {...params} label='Tags' error={Boolean(tagErr)} helperText={tagErr} />
            )}
            isOptionEqualToValue={(option, value) => option === value} // Ensures custom input is treated as a valid option
          />
        </Box>
        <Box>
          <Button variant='contained' fullWidth onClick={postQuestion}>
            Post Question
          </Button>
        </Box>
        <Box sx={{ textAlign: 'center', mt: 1 }}>
          <Typography variant='body2' color='textSecondary'>
            <strong>*</strong> indicates mandatory fields
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
};

export default NewQuestionPage;
