import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Box, List, ListItem, Button, Collapse, Typography, useTheme } from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';

const SideBarNav = () => {
  const [showOptions, setShowOptions] = useState<boolean>(false);
  const location = useLocation(); // get current URL path
  const theme = useTheme();

  const isGlobalActive = location.pathname === '/messaging';
  const isDirectActive = location.pathname === '/messaging/direct-message';
  const isMessagingActive = isGlobalActive || isDirectActive; // messaging should highlight if any sub-tab is active

  const toggleOptions = () => {
    setShowOptions(!showOptions);
  };

  return (
    <Box
      sx={{
        width: 250,
        backgroundColor: theme.palette.background.default,
        padding: 2,
        boxShadow: 2,
      }}>
      <List>
        <ListItem disablePadding>
          <NavLink
            to='/home'
            style={({ isActive }) => ({
              textDecoration: 'none',
              backgroundColor: isActive ? theme.palette.secondary.main : 'transparent',
              padding: '8px 16px',
              borderRadius: '4px',
            })}>
            <Button fullWidth>
              <Typography variant='body1'>Questions</Typography>
            </Button>
          </NavLink>
        </ListItem>
        <ListItem disablePadding>
          <NavLink
            to='/tags'
            style={({ isActive }) => ({
              textDecoration: 'none',
              backgroundColor: isActive ? theme.palette.secondary.main : 'transparent',
              padding: '8px 16px',
              borderRadius: '4px',
            })}>
            <Button fullWidth>
              <Typography variant='body1'>Tags</Typography>
            </Button>
          </NavLink>
        </ListItem>
        <ListItem disablePadding>
          <Button
            onClick={toggleOptions}
            sx={{
              backgroundColor: isMessagingActive ? theme.palette.secondary.main : 'transparent',
              textAlign: 'left',
              padding: '12px 30px',
              borderRadius: '4px',
            }}>
            <Typography variant='body1'>Messaging</Typography>
            {showOptions ? <ExpandLess /> : <ExpandMore />}
          </Button>
        </ListItem>
        <Collapse in={showOptions} timeout='auto' unmountOnExit>
          <List component='div' disablePadding>
            <ListItem disablePadding>
              <NavLink
                to='/messaging'
                style={{
                  textDecoration: 'none',
                  backgroundColor: isGlobalActive ? theme.palette.secondary.main : 'transparent',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  display: 'block',
                  width: '100%',
                  paddingLeft: '24px',
                }}>
                <Button fullWidth>
                  <Typography variant='body2'>Global Messages</Typography>
                </Button>
              </NavLink>
            </ListItem>
            <ListItem disablePadding>
              <NavLink
                to='/messaging/direct-message'
                style={{
                  textDecoration: 'none',
                  backgroundColor: isDirectActive ? theme.palette.secondary.main : 'transparent',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  display: 'block',
                  width: '100%',
                  paddingLeft: '24px',
                }}>
                <Button fullWidth>
                  <Typography variant='body2'>Direct Messages</Typography>
                </Button>
              </NavLink>
            </ListItem>
          </List>
        </Collapse>
        <ListItem disablePadding>
          <NavLink
            to='/users'
            style={({ isActive }) => ({
              textDecoration: 'none',
              backgroundColor: isActive ? theme.palette.secondary.main : 'transparent',
              padding: '8px 16px',
              borderRadius: '4px',
            })}>
            <Button fullWidth>
              <Typography variant='body1'>Users</Typography>
            </Button>
          </NavLink>
        </ListItem>
        <ListItem disablePadding>
          <NavLink
            to='/games'
            style={({ isActive }) => ({
              textDecoration: 'none',
              color: isActive ? '#1976d2' : '#333',
              backgroundColor: isActive ? theme.palette.secondary.main : 'transparent',
              padding: '8px 16px',
              borderRadius: '4px',
            })}>
            <Button fullWidth>
              <Typography variant='body1'>Games</Typography>
            </Button>
          </NavLink>
        </ListItem>
        <ListItem disablePadding>
          <NavLink
            to='/store'
            style={({ isActive }) => ({
              textDecoration: 'none',
              color: isActive ? '#1976d2' : '#333',
              backgroundColor: isActive ? theme.palette.secondary.main : 'transparent',
              padding: '8px 16px',
              borderRadius: '4px',
            })}>
            <Button fullWidth>
              <Typography variant='body1'>Store</Typography>
            </Button>
          </NavLink>
        </ListItem>
      </List>
    </Box>
  );
};

export default SideBarNav;
