import React from 'react';
import { Box, Button, List, ListItemText, Paper, Stack, Typography } from '@mui/material';
import { GameInstance, NimGameState } from '../../../../types/types';
import useNimGamePage from '../../../../hooks/useNimGamePage';

/**
 * Component to display the "Nim" game page, including the rules, game details, and functionality to make a move.
 * @param gameInstance The current instance of the Nim game, including player details, game status, and remaining objects.
 * @returns A React component that shows:
 * - The rules of the Nim game.
 * - The current game details, such as players, current turn, remaining objects, and winner (if the game is over).
 * - An input field for making a move (if the game is in progress) and a submit button to finalize the move.
 */
const NimGamePage = ({ gameInstance }: { gameInstance: GameInstance<NimGameState> }) => {
  const { user, move, handleMakeMove, handleInputChange } = useNimGamePage(gameInstance);

  return (
    <>
      <Stack>
        <Typography variant={'h4'}>Rules of Nim</Typography>
        <Typography variant={'body1'}>The game of Nim is played as follows:</Typography>
        <List sx={{ pl: 2 }}>
          <ListItemText primary='1. The game starts with a pile of objects.' />
          <ListItemText primary='2. Players take turns removing objects from the pile.' />
          <ListItemText primary='3. On their turn, a player must remove 1, 2, or 3 objects from the pile.' />
          <ListItemText primary='4. The player who removes the last object loses the game' />
        </List>
        <Typography variant={'body1'}>
          Think strategically and try to force your opponent into a losing position!
        </Typography>
        <Paper variant='outlined' sx={{ p: 2, mt: 2 }}>
          <Stack spacing={2}>
            <Typography variant={'h4'}>Current Game</Typography>
            <Typography variant={'body1'}>
              <strong>Player 1:</strong> {gameInstance.state.player1 || 'Waiting...'}
            </Typography>
            <Typography variant={'body1'}>
              <strong>Player 2:</strong> {gameInstance.state.player2 || 'Waiting...'}
            </Typography>
            <Typography variant={'body1'}>
              <strong>Current Player to Move:</strong>{' '}
              {gameInstance.players[gameInstance.state.moves.length % 2]}
            </Typography>
            <Typography variant={'body1'}>
              <strong>Remaining Objects:</strong> {gameInstance.state.remainingObjects}
            </Typography>
            {gameInstance.state.status === 'OVER' && (
              <Typography variant={'body1'}>
                <strong>Winner:</strong>{' '}
                {gameInstance.state.winners?.join(', ') || 'No winner'}{' '}
              </Typography>
            )}
          </Stack>
          {gameInstance.state.status !== 'IN_PROGRESS' && (
            <Stack spacing={1} mt={2}>
              <Typography variant='body1'>
                <strong>Make Your Move</strong>
              </Typography>
              <Box display='flex' flexDirection='row' gap={2}>
                <input
                  type='number'
                  value={move}
                  onChange={handleInputChange}
                  min='1'
                  max='3'
                  placeholder='Enter 1-3'
                  style={{ width: '30%', padding: '8px' }}
                />
                <Button
                  variant='contained'
                  onClick={handleMakeMove}
                  disabled={
                    gameInstance.players[gameInstance.state.moves.length % 2] !== user.username
                  }>
                  Submit Move
                </Button>
              </Box>
            </Stack>
          )}
        </Paper>
      </Stack>
    </>
  );
};

export default NimGamePage;
