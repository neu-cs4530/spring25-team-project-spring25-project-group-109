import { Card, Typography } from '@mui/material';
import { useState } from 'react';
import CollectionDialog from '../collectionDialog';
import { PopulatedDatabaseCollection } from '../../../types/types';

type UpdateCollectionHandler = (
  collectionId: string,
  name: string,
  setErrorMessage: (message: string) => void,
) => void;

type DeleteCollectionHandler = (
  collectionId: string,
  setErrorMessage: (message: string) => void,
) => void;

type TogglePrivacyHandler = (
  collectionId: string,
  isPrivate: boolean,
  setErrorMessage: (message: string) => void,
) => void;

type RemoveQuestionHandler = (
  collectionId: string,
  questionId: string,
  setErrorMessage: (message: string) => void,
) => void;

interface CollectionViewProps {
  collection: PopulatedDatabaseCollection;
  canEditProfile: boolean;
  clickQuestion: (questionID: string) => void;
  handleUpdateCollection: UpdateCollectionHandler;
  handleDeleteCollection: DeleteCollectionHandler;
  handleTogglePrivacy: TogglePrivacyHandler;
  handleRemoveQuestion: RemoveQuestionHandler;
}

const CollectionView = ({
  collection,
  canEditProfile,
  clickQuestion,
  handleUpdateCollection,
  handleDeleteCollection,
  handleTogglePrivacy,
  handleRemoveQuestion,
}: CollectionViewProps) => {
  const { name, questions } = collection;
  const [open, setOpen] = useState(false);

  return (
    <>
      <Card
        variant='outlined'
        sx={{ padding: 2, borderRadius: 4, cursor: 'pointer' }}
        onClick={() => setOpen(true)}>
        <Typography variant='h6'>{name}</Typography>
        <Typography variant='body2'>{questions.length} Questions</Typography>
      </Card>

      <CollectionDialog
        open={open}
        handleClose={() => setOpen(false)}
        collection={collection}
        canEditProfile={canEditProfile}
        clickQuestion={clickQuestion}
        handleUpdateCollection={handleUpdateCollection}
        handleDeleteCollection={handleDeleteCollection}
        handleRemoveQuestion={handleRemoveQuestion}
        handleTogglePrivacy={handleTogglePrivacy}
      />
    </>
  );
};

export default CollectionView;
