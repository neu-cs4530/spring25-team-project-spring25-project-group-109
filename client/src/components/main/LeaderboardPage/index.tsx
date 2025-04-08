import { useContext, useState } from 'react';
import { Box, Stack, Typography, CircularProgress, Avatar } from '@mui/material';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import LeaderboardRoundedIcon from '@mui/icons-material/LeaderboardRounded';
import Paper from '@mui/material/Paper';
import * as React from 'react';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import dayjs, { Dayjs } from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import UserContext from '../../../contexts/UserContext';
import useLeaderboard from '../../../hooks/useLeaderboard';

/**
 * Represents the Leaderboard component which displays a list of RankedUsers
 * fetched based on their ranking in the system.
 */
const LeaderboardPage = () => {
  const context = useContext(UserContext);
  const username = context?.user.username;
  const [dateFilter, setDateFilter] = useState('all time');
  const [startDate, setStartDate] = useState<Dayjs | null>(dayjs());
  const [endDate, setEndDate] = useState<Dayjs | null>(dayjs());
  const { users, loading, error } = useLeaderboard(username || '', dateFilter, startDate, endDate);

  let rank = 0;

  let previousPoints: number | null = null;

  const rankedUsers = users.map((user, index) => {
    if (user.count !== previousPoints) {
      rank = index + 1;
    }
    previousPoints = user.count;

    return { ...user, rank };
  });

  let topTen = rankedUsers;
  const userScore = rankedUsers.find(user => user.username === username);

  if (topTen.length > 10) {
    topTen = topTen.slice(0, 10);
  }

  return (
    <>
      <Box sx={{ p: 4 }}>
        <Stack direction='row' justifyContent='space-between' alignItems='center'>
          <Typography
            variant='h4'
            fontWeight='bold'
            sx={{ display: 'inline-flex', alignItems: 'center' }}>
            <LeaderboardRoundedIcon sx={{ marginRight: '4px' }} />
            Leaderboard
          </Typography>
        </Stack>
        <Typography variant='body1' color='text.secondary'>
          Answer questions to rise to the top of the Threadscape Leaderboard!
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(650px, 1fr))',
          gap: 2,
          padding: 4,
          paddingTop: 0,
        }}>
        {loading && <CircularProgress />}
        {!loading && error && <Typography color='error'>{error}</Typography>}
        <ButtonGroup variant='contained' aria-label='Basic button group' sx={{ boxShadow: 'none' }}>
          <Button
            onClick={() => setDateFilter('week')}
            color={dateFilter === 'week' ? 'primary' : 'secondary'}>
            Week
          </Button>
          <Button
            onClick={() => setDateFilter('month')}
            color={dateFilter === 'month' ? 'primary' : 'secondary'}>
            Month
          </Button>
          <Button
            onClick={() => setDateFilter('all time')}
            color={dateFilter === 'all time' ? 'primary' : 'secondary'}>
            All Time
          </Button>
          <Button
            onClick={() => setDateFilter('custom')}
            color={dateFilter === 'custom' ? 'primary' : 'secondary'}>
            Custom Date
          </Button>
        </ButtonGroup>
        {dateFilter === 'custom' && (
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label='start'
              value={startDate}
              onChange={newValue => setStartDate(newValue)}
            />
            <DatePicker label='end' value={endDate} onChange={newValue => setEndDate(newValue)} />
          </LocalizationProvider>
        )}
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label='simple table'>
            <TableHead>
              <TableRow>
                <TableCell>Ranking</TableCell>
                <TableCell align='left'>Username</TableCell>
                <TableCell align='right'>Total Answers</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {topTen.map(user => (
                <TableRow
                  key={user.username}
                  selected={user.username === username}
                  sx={{
                    '&:last-child td, &:last-child th': { border: 0 },
                    'backgroundColor':
                      user.username === username ? 'rgba(25, 118, 210, 0.1)' : 'inherit',
                  }}>
                  <TableCell component='th' scope='row'>
                    {user.rank}
                  </TableCell>
                  <TableCell align='left'>
                    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Avatar alt='Photo' src={user.profilePhoto} sx={{ marginRight: '4px' }} />
                      {user.username}
                    </Box>
                  </TableCell>
                  <TableCell align='right'>{user.count}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </>
  );
};

export default LeaderboardPage;
