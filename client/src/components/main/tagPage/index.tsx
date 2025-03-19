import React from 'react';
import './index.css';
import { Box, Stack, Typography } from '@mui/material';
import TagView from './tag';
import useTagPage from '../../../hooks/useTagPage';
import AskQuestionButton from '../askQuestionButton';

/**
 * Represents the TagPage component which displays a list of tags
 * and provides functionality to handle tag clicks and ask a new question.
 */
const TagPage = () => {
  const { tlist, clickTag } = useTagPage();

  return (
    <>
      <Box sx={{ p: 4 }}>
        <Stack direction='row' justifyContent='space-between' alignItems='center'>
          <Typography variant='h4' fontWeight='bold'>
            All Tags ({tlist.length})
          </Typography>
          <AskQuestionButton />
        </Stack>
      </Box>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 2,
          padding: 4,
          paddingTop: 0,
        }}>
        {tlist.map(t => (
          <TagView key={t.name} t={t} clickTag={clickTag} />
        ))}
      </Box>
    </>
  );
};

export default TagPage;
