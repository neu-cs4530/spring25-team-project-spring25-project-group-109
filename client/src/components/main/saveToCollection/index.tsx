import { useState } from 'react';
import {
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import useSaveToCollection from '../../../hooks/useSaveToCollection';

interface SaveToCollectionProps {
  questionId: string;
  onClose: () => void;
}

const SaveToCollection = ({ questionId, onClose }: SaveToCollectionProps) => {
  const { collections, error, successMessage, handleCreateAndSave, handleSaveToExisting } =
    useSaveToCollection();
  const [newCollectionName, setNewCollectionName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleCreateAndSave(newCollectionName, questionId);
    setNewCollectionName('');
    setIsCreating(false);
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth='sm'>
      <DialogTitle>Save to Collection</DialogTitle>
      <DialogContent>
        {successMessage && <Alert severity='success'>{successMessage}</Alert>}
        {error && <Alert severity='error'>{error}</Alert>}

        {isCreating ? (
          <form
            onSubmit={handleCreateSubmit}
            style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
            <TextField
              fullWidth
              variant='outlined'
              label='Enter collection name'
              value={newCollectionName}
              onChange={e => setNewCollectionName(e.target.value)}
              required
            />
            <Button type='submit' variant='contained' color='primary' startIcon={<SaveIcon />}>
              Create & Save
            </Button>
            <Button variant='outlined' onClick={() => setIsCreating(false)}>
              Cancel
            </Button>
          </form>
        ) : (
          <Button
            variant='contained'
            startIcon={<AddIcon />}
            onClick={() => setIsCreating(true)}
            fullWidth
            sx={{ marginTop: 2 }}>
            Create New Collection
          </Button>
        )}

        <Typography variant='h6' sx={{ marginTop: 3 }}>
          Or save to an existing collection:
        </Typography>
        {collections.length > 0 ? (
          <List>
            {collections.map(collection => (
              <ListItem key={collection._id.toString()} divider>
                <ListItemText primary={collection.name} />
                <ListItemSecondaryAction>
                  <IconButton
                    edge='end'
                    color='primary'
                    onClick={() =>
                      handleSaveToExisting(collection._id.toString(), collection.name, questionId)
                    }>
                    <SaveIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography color='textSecondary'>No collections available.</Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} startIcon={<CloseIcon />}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SaveToCollection;
