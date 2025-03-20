import { useState } from 'react';
import './index.css';
import useSaveToCollection from '../../../hooks/useSaveToCollection';

const SaveToCollection = ({ questionId, onClose }: { questionId: string; onClose: () => void }) => {
  const { collections, error, successMessage, handleCreateAndSave, handleSaveToExisting } =
    useSaveToCollection();

  const [newCollectionName, setNewCollectionName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  return (
    <div className='save-to-collection-modal'>
      <h2>Save to Collection</h2>

      {successMessage && <p className='success-message'>{successMessage}</p>}

      {error && <p className='error-message'>{error}</p>}

      {isCreating ? (
        <form
          onSubmit={e => {
            e.preventDefault();
            handleCreateAndSave(newCollectionName, questionId);
            setNewCollectionName('');
            setIsCreating(false);
          }}>
          <input
            type='text'
            value={newCollectionName}
            onChange={e => setNewCollectionName(e.target.value)}
            placeholder='Enter collection name'
            required
          />
          <button type='submit'>Create & Save</button>
          <button type='button' onClick={() => setIsCreating(false)}>
            Cancel
          </button>
        </form>
      ) : (
        <button onClick={() => setIsCreating(true)}>Create New Collection</button>
      )}

      <h3>Or save to an existing collection:</h3>
      {collections.length > 0 ? (
        <ul className='collection-list'>
          {collections.map(collection => (
            <li key={collection._id.toString()} className='collection-item'>
              {collection.name}
              <button
                onClick={() =>
                  handleSaveToExisting(collection._id.toString(), collection.name, questionId)
                }>
                Save
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No collections available.</p>
      )}

      <button onClick={onClose}>Close</button>
    </div>
  );
};

export default SaveToCollection;
