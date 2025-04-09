import React, { useState } from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import { TagData } from '../../../../types/types';
import useTagSelected from '../../../../hooks/useTagSelected';
import TagDialog from '../tagDialog';

/**
 * Props for the Tag component.
 *
 * t - The tag object.
 * clickTag - Function to handle the tag click event.
 */
interface TagProps {
  t: TagData;
  clickTag: (tagName: string) => void;
}

/**
 * Tag component that displays information about a specific tag.
 * The component displays the tag's name, description, and the number of associated questions.
 * It also triggers a click event to handle tag selection.
 *
 * @param t - The tag object .
 * @param clickTag - Function to handle tag clicks.
 */
const TagView = ({ t, clickTag }: TagProps) => {
  const { tag } = useTagSelected(t);
  const [open, setOpen] = useState(false);

  return (
    <>
      <Card
        sx={{
          'cursor': 'pointer',
          'boxShadow': 2,
          'transition': '0.3s',
          '&:hover': { boxShadow: 6 },
          'borderRadius': 2,
        }}
        onClick={() => setOpen(true)}>
        <CardContent>
          <Typography variant='h6' color='primary'>
            {tag.name}
          </Typography>
          <Typography variant='body2' color='textSecondary'>
            {tag.description.length > 50
              ? `${tag.description.substring(0, 50)}...`
              : tag.description}
          </Typography>
          <Typography variant='caption' color='textSecondary'>
            {t.qcnt} questions
          </Typography>
        </CardContent>
      </Card>

      <TagDialog
        open={open}
        handleClose={() => setOpen(false)}
        tag={tag}
        tagData={t}
        clickTag={clickTag}
      />
    </>
  );
};
export default TagView;
