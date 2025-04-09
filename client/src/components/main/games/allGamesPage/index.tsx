import React from 'react';
import { Alert, Box, Button, Modal, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import useAllGamesPage from '../../../../hooks/useAllGamesPage';
import GameCard from './gameCard';
import modalStyle from '../../../profileSettings/styles';

/**
 * Component to display the "All Games" page, which provides functionality to view, create, and join games.
 * @returns A React component that includes:
 * - A "Create Game" button to open a modal for selecting a game type.
 * - A list of available games, each rendered using the `GameCard` component.
 * - A refresh button to reload the list of available games from the server.
 */
const AllGamesPage = () => {
  const {
    availableGames,
    handleJoin,
    fetchGames,
    isModalOpen,
    handleToggleModal,
    handleSelectGameType,
    error,
    permissions,
  } = useAllGamesPage();
  const navigate = useNavigate();

  const hasUnlockedGames = permissions.nim;

  function handleGoToStore(): void {
    navigate(`/store`);
  }
  // todo fix flash of modal when user does have permissions

  return (
    <Box p={4}>
      <Modal open={!hasUnlockedGames}>
        <Box sx={modalStyle}>
          <Typography sx={{ textAlign: 'center' }} variant='h4'>
            You have not purchased any games yet
          </Typography>
          <Typography sx={{ textAlign: 'center' }} variant='body1'>
            Visit the store to unlock Nim and more!
          </Typography>
          <Button variant={'contained'} onClick={handleGoToStore}>
            Go to Store
          </Button>
        </Box>
      </Modal>

      <Button variant={'contained'} onClick={handleToggleModal}>
        Create Game
      </Button>

      {isModalOpen && hasUnlockedGames && (
        <Stack spacing={1} mt={2}>
          <Typography variant='h5' fontWeight={'bold'}>
            Select Game Type
          </Typography>
          <Box display={'flex'} gap={2}>
            {permissions.nim ? (
              <Button variant='outlined' onClick={() => handleSelectGameType('Nim')}>
                Nim
              </Button>
            ) : null}
            <Button variant='outlined' onClick={handleToggleModal}>
              Cancel
            </Button>
          </Box>
        </Stack>
      )}

      <Stack spacing={2} mt={2}>
        {error && (
          <Alert sx={{ mb: 2 }} severity={'error'}>
            {error}
          </Alert>
        )}
        <Typography variant='h5' fontWeight={'bold'}>
          Available Games
        </Typography>
        <Box>
          <Button variant={'outlined'} onClick={fetchGames}>
            Refresh List
          </Button>
        </Box>
        {availableGames.map(game => (
          <GameCard key={game.gameID} game={game} handleJoin={handleJoin} />
        ))}
      </Stack>
    </Box>
  );
};

export default AllGamesPage;
