import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from '@mui/material';
import { Tag, TagData } from '../../../../types/types';

interface TagDialogProps {
  open: boolean;
  handleClose: () => void;
  tag: Tag;
  tagData: TagData;
  clickTag: (tagName: string) => void;
}

/**
 * TagDialog component displays detailed information about a tag inside a modal.
 *
 * @param open - Controls dialog visibility.
 * @param handleClose - Function to close the dialog.
 * @param tag - The tag object containing details.
 * @param clickTag - Function to navigate to the tag page.
 */
const TagDialog = ({ open, handleClose, tag, tagData, clickTag }: TagDialogProps) => (
  <Dialog open={open} onClose={handleClose} fullWidth maxWidth='sm'>
    <Box sx={{ p: 1 }}>
      <DialogTitle>{tag.name}</DialogTitle>
      <DialogContent>
        <Typography variant='body1'>{tag.description}</Typography>
        <Typography variant='caption' color='textSecondary'>
          {tagData.qcnt} questions
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} variant='outlined'>
          Close
        </Button>
        <Button onClick={() => clickTag(tag.name)} color='primary' variant='contained'>
          View Tag
        </Button>
      </DialogActions>
    </Box>
  </Dialog>
);

export default TagDialog;
