import {
  Dialog,
  Box,
  DialogTitle,
  DialogContent,
  Typography,
  DialogActions,
  Button,
  Paper,
  useTheme,
  Stack,
  Input,
  IconButton,
  Alert,
  FormControlLabel,
  Switch,
  Chip,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CancelIcon from '@mui/icons-material/Close';
import { PopulatedDatabaseCollection } from '../../../types/types';

interface CollectionDialogProps {
  open: boolean;
  handleClose: () => void;
  collection: PopulatedDatabaseCollection;
  canEditProfile: boolean;
  clickQuestion: (questionID: string) => void;
  handleUpdateCollection: (
    collectionId: string,
    name: string,
    setErrorMessage: (message: string) => void,
  ) => void;
  handleDeleteCollection: (
    collectionId: string,
    setErrorMessage: (message: string) => void,
  ) => void;
  handleTogglePrivacy: (
    collectionId: string,
    isPrivate: boolean,
    setErrorMessage: (message: string) => void,
  ) => void;
  handleRemoveQuestion: (
    collectionId: string,
    questionId: string,
    setErrorMessage: (message: string) => void,
  ) => void;
}

const CollectionDialog = ({
  open,
  handleClose,
  collection,
  canEditProfile,
  clickQuestion,
  handleUpdateCollection,
  handleDeleteCollection,
  handleTogglePrivacy,
  handleRemoveQuestion,
}: CollectionDialogProps) => {
  const theme = useTheme();
  const [editNameMode, setEditNameMode] = useState(false);
  const [newName, setNewName] = useState(collection.name);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmDeleteQuestionId, setConfirmDeleteQuestionId] = useState<string | null>(null);
  const isPrivate = collection.visibility === 'private';

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth='sm'>
      <Box sx={{ p: 1 }}>
        <DialogTitle>
          <Box display='flex' alignItems='center' justifyContent='space-between'>
            {!editNameMode ? (
              <Box display='flex' alignItems='center' gap={1}>
                <Typography variant='h5' fontWeight={'bold'}>
                  {collection.name}
                </Typography>
                {canEditProfile && (
                  <IconButton
                    color='primary'
                    onClick={() => {
                      setEditNameMode(true);
                      setNewName(collection.name || '');
                    }}>
                    <EditIcon sx={{ fontSize: 20 }} />
                  </IconButton>
                )}
              </Box>
            ) : (
              <Box display='flex' alignItems='center' gap={2}>
                <Input type='text' value={newName} onChange={e => setNewName(e.target.value)} />
                <Button
                  variant='contained'
                  onClick={() => {
                    handleUpdateCollection(String(collection._id), newName, setErrorMessage);
                    setEditNameMode(false);
                  }}>
                  Save
                </Button>
                <Button variant='outlined' onClick={() => setEditNameMode(false)}>
                  Cancel
                </Button>
              </Box>
            )}
            {canEditProfile && (
              <FormControlLabel
                control={
                  <Switch
                    checked={isPrivate}
                    onChange={() =>
                      handleTogglePrivacy(String(collection._id), !isPrivate, setErrorMessage)
                    }
                    color='primary'
                  />
                }
                label={isPrivate ? 'Private' : 'Public'}
                labelPlacement='start'
              />
            )}
          </Box>
          {errorMessage && (
            <Alert sx={{ mt: 2 }} severity={'error'}>
              {errorMessage}
            </Alert>
          )}
        </DialogTitle>
        <DialogContent sx={{ maxHeight: '400px', overflowY: 'auto' }}>
          <Box display='flex' flexDirection='column' gap={1}>
            {collection.questions.length > 0 ? (
              collection.questions.map(question => (
                <Paper
                  key={String(question._id)}
                  variant='outlined'
                  sx={{
                    padding: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                  <Stack sx={{ width: '100%' }}>
                    <Box
                      sx={{
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                      onClick={() => clickQuestion(String(question._id))}>
                      <Box>
                        <Typography variant='h6' fontWeight={'bold'}>
                          {question.title}
                        </Typography>
                        <Stack direction='row' spacing={1} mt={1} flexWrap='wrap'>
                          {question.tags.map(tag => (
                            <Chip
                              key={String(tag._id)}
                              label={tag.name}
                              color='primary'
                              variant='outlined'
                            />
                          ))}
                        </Stack>
                      </Box>
                      {canEditProfile && (
                        <Box>
                          {!confirmDeleteQuestionId ||
                          confirmDeleteQuestionId !== String(question._id) ? (
                            <IconButton
                              color='error'
                              onClick={event => {
                                event.stopPropagation();
                                setConfirmDeleteQuestionId(String(question._id));
                              }}>
                              <DeleteOutlineIcon />
                            </IconButton>
                          ) : (
                            <>
                              <IconButton
                                color='default'
                                onClick={event => {
                                  event.stopPropagation();
                                  setConfirmDeleteQuestionId(null);
                                }}>
                                <CancelIcon />
                              </IconButton>
                              <IconButton
                                color='error'
                                onClick={event => {
                                  event.stopPropagation();
                                  handleRemoveQuestion(
                                    String(collection._id),
                                    String(question._id),
                                    setErrorMessage,
                                  );
                                  setConfirmDeleteQuestionId(null);
                                }}>
                                <DeleteOutlineIcon />
                              </IconButton>
                            </>
                          )}
                        </Box>
                      )}
                    </Box>
                    {confirmDeleteQuestionId === String(question._id) && (
                      <Alert severity='warning' sx={{ mt: 2 }}>
                        Are you sure you want to remove this question from the collection? This
                        action cannot be undone.
                      </Alert>
                    )}
                  </Stack>
                </Paper>
              ))
            ) : (
              <Typography variant='body1' sx={{ color: theme.palette.text.secondary }}>
                This collection is empty,{' '}
                {canEditProfile ? 'questions can be added from ' : 'all questions can be viewed '}{' '}
                <Link to={'/home'}>here</Link>
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ padding: 2 }}>
          {!confirmDelete ? (
            <Box display='flex' flexDirection='row' gap={2}>
              {canEditProfile && (
                <Button
                  onClick={() => setConfirmDelete(true)}
                  variant='outlined'
                  color='error'
                  sx={{ color: theme.palette.error.main }}>
                  Delete
                </Button>
              )}
              <Button onClick={handleClose} variant='outlined'>
                Close
              </Button>
            </Box>
          ) : (
            <Stack display='flex' gap={2}>
              <Alert severity='warning'>
                Are you sure you want to delete this collection? This action cannot be undone.
              </Alert>
              <Box display='flex' gap={1} justifyContent='flex-end'>
                <Button onClick={() => setConfirmDelete(false)} variant='outlined'>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    handleDeleteCollection(String(collection._id), setErrorMessage);
                    handleClose();
                  }}
                  variant='contained'
                  color='error'>
                  Confirm
                </Button>
              </Box>
            </Stack>
          )}
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default CollectionDialog;
