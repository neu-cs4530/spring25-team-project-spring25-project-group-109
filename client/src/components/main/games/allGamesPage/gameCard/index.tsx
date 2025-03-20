import React from 'react';
import { Box, Button, List, ListItem, Paper, Typography } from '@mui/material';
import { GameInstance, GameState } from '../../../../../types/types';

/**
 * Component to display a game card with details about a specific game instance.
 * @param game The game instance to display.
 * @param handleJoin Function to handle joining the game. Takes the game ID as an argument.
 * @returns A React component rendering the game details and a join button if the game is waiting to start.
 */
const GameCard = ({
  game,
  handleJoin,
}: {
  game: GameInstance<GameState>;
  handleJoin: (gameID: string) => void;
}) => (
  <Paper variant='outlined' sx={{ borderRadius: 2 }}>
    <Box p={2}>
      <Typography variant='body1'>
        <strong>Game ID:</strong> {game.gameID}
      </Typography>
      <Typography variant='body1'>
        <strong>Status:</strong> {game.state.status}
      </Typography>
      <List>
        {game.players.map((player: string) => (
          <ListItem key={`${game.gameID}-${player}`}>{player}</ListItem>
        ))}
      </List>
      {game.state.status === 'WAITING_TO_START' && (
        <Button variant='contained' onClick={() => handleJoin(game.gameID)}>
          Join Game
        </Button>
      )}
    </Box>
  </Paper>
);

export default GameCard;
