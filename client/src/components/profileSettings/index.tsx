import React from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogContent,
  IconButton,
  Input,
  InputAdornment,
  Modal,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import EditIcon from '@mui/icons-material/Edit';
import useProfileSettings from '../../hooks/useProfileSettings';
import modalStyle from './styles';

const ProfileSettings: React.FC = () => {
  const {
    userData,
    profilePhoto,
    availableAvatars,
    editProfilePhotoMode,
    loading,
    editBioMode,
    newBio,
    newPassword,
    confirmNewPassword,
    successMessage,
    errorMessage,
    showConfirmation,
    pendingAction,
    canEditProfile,
    showPassword,
    togglePasswordVisibility,
    allBadges,
    isFollowing,
    showFollowers,
    setShowFollowers,
    showFollowing,
    setShowFollowing,

    setEditBioMode,
    setEditProfilePhotoMode,
    setNewBio,
    setNewPassword,
    setConfirmNewPassword,
    setShowConfirmation,

    handleResetPassword,
    handleUpdateBiography,
    handleDeleteUser,
    handleUpdateProfilePhoto,
    handleFollowUser,
    handleUnfollowUser,
  } = useProfileSettings();

  const numEarnedBadges = userData?.badgesEarned ? userData.badgesEarned.length : 0;

  const handleButtonClick = () => {
    setEditProfilePhotoMode(!editProfilePhotoMode);
  };

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '80vh',
          width: '80vw',
        }}>
        <CircularProgress />
      </div>
    );
  }

  return (
    <Box sx={{ padding: 4, maxWidth: 800, margin: 'auto' }}>
      <Typography variant='h2'>Profile</Typography>
      {(successMessage || errorMessage) && (
        <Alert sx={{ mb: 2 }} severity={successMessage ? 'success' : 'error'}>
          {successMessage}
        </Alert>
      )}
      <Stack spacing={4}>
        {userData ? (
          <>
            {/* ---- Profile ---- */}
            <Box>
              {/* ---- Profile Photo ---- */}
              <Stack
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  direction: 'column',
                }}>
                <Avatar
                  sx={{ width: 120, height: 120 }}
                  src={profilePhoto || '/images/avatars/default-avatar.png'}
                />
                {canEditProfile && (
                  <Button
                    variant='contained'
                    color='primary'
                    onClick={handleButtonClick}
                    sx={{ mt: 2 }}>
                    {editProfilePhotoMode ? 'Cancel' : 'Change Photo'}
                  </Button>
                )}
              </Stack>

              {/* ---- Avatar Selection ---- */}
              {editProfilePhotoMode && canEditProfile && (
                <Container
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    flexWrap: 'wrap',
                    gap: 1,
                    mt: 2,
                  }}>
                  {availableAvatars.map(avatar => (
                    <Avatar
                      key={avatar}
                      src={avatar}
                      className={`avatar-option ${profilePhoto === avatar ? 'selected' : ''}`}
                      onClick={() => {
                        handleUpdateProfilePhoto(avatar);
                      }}
                    />
                  ))}
                </Container>
              )}

              {/* ---- Follower/Following Section ---- */}

              <Box display={'flex'} flexDirection={'column'} mt={2} alignItems='center'>
                <Box display='flex' justifyContent='center'>
                  <Button
                    className='follow-count'
                    variant='text'
                    onClick={() => setShowFollowers(true)}
                    sx={{ textAlign: 'center' }}>
                    <Typography variant='subtitle1'>
                      <span style={{ fontWeight: 'bold' }}>{userData.followers.length}</span>{' '}
                      Followers
                    </Typography>
                  </Button>
                  <Button
                    className='follow-count'
                    variant='text'
                    onClick={() => setShowFollowing(true)}
                    sx={{ textAlign: 'center' }}>
                    <Typography variant='subtitle1'>
                      <span style={{ fontWeight: 'bold' }}>{userData.following.length}</span>{' '}
                      Following
                    </Typography>
                  </Button>
                </Box>

                {!canEditProfile && (
                  <Button
                    variant='contained'
                    color={isFollowing ? 'error' : 'primary'}
                    onClick={isFollowing ? handleUnfollowUser : handleFollowUser}
                    sx={{ maxWidth: 200, mt: 1 }}>
                    {isFollowing ? 'Unfollow' : 'Follow'}
                  </Button>
                )}
              </Box>

              <Modal open={showFollowers} onClose={() => setShowFollowers(false)}>
                <Box sx={modalStyle}>
                  <Typography variant='h4'>Followers</Typography>
                  {userData.followers.length > 0 ? (
                    <ul>
                      {userData.followers.map(follower => (
                        <li key={follower}>{follower}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>No followers yet.</p>
                  )}
                  <Button
                    variant='contained'
                    onClick={() => setShowFollowers(false)}
                    sx={{ marginTop: 2 }}>
                    Close
                  </Button>
                </Box>
              </Modal>

              <Modal open={showFollowing} onClose={() => setShowFollowing(false)}>
                <Box sx={modalStyle}>
                  <Typography variant='h4'>Following</Typography>
                  {userData.following.length > 0 ? (
                    <ul>
                      {userData.following.map(following => (
                        <li key={following}>{following}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>Not following anyone yet.</p>
                  )}
                  <Button
                    variant='contained'
                    onClick={() => setShowFollowing(false)}
                    sx={{ marginTop: 2 }}>
                    Close
                  </Button>
                </Box>
              </Modal>
            </Box>

            {/* ---- General Information ---- */}
            <Box>
              <Paper variant='outlined' sx={{ padding: 2, borderRadius: 4 }}>
                <Typography variant='h4'>General Information</Typography>
                <Stack spacing={2} mt={1}>
                  <Typography variant='subtitle1'>
                    <span style={{ fontWeight: 'bold' }}>Username:</span> {userData.username}
                  </Typography>

                  {/* ---- Biography Section ---- */}
                  {!editBioMode && (
                    <Box display={'flex'} flexDirection={'row'}>
                      <Typography variant='subtitle1'>
                        <span style={{ fontWeight: 'bold' }}>Biography:</span>{' '}
                        {userData.biography || 'No biography yet'}
                      </Typography>
                      {canEditProfile && (
                        <Button
                          onClick={() => {
                            setEditBioMode(true);
                            setNewBio(userData.biography || '');
                          }}
                          sx={{
                            padding: 0,
                            minWidth: 'auto',
                          }}>
                          <EditIcon sx={{ fontSize: 20, marginLeft: 1 }} />{' '}
                        </Button>
                      )}
                    </Box>
                  )}

                  {editBioMode && canEditProfile && (
                    <Box display='flex' alignItems='center' gap={2}>
                      <Input type='text' value={newBio} onChange={e => setNewBio(e.target.value)} />
                      <Button variant='contained' onClick={handleUpdateBiography}>
                        Save
                      </Button>
                      <Button variant='outlined' onClick={() => setEditBioMode(false)}>
                        Cancel
                      </Button>
                    </Box>
                  )}
                  <Typography variant='subtitle1'>
                    <span style={{ fontWeight: 'bold' }}>Date Joined:</span>{' '}
                    {userData.dateJoined
                      ? new Date(userData.dateJoined).toLocaleDateString()
                      : 'N/A'}
                  </Typography>
                </Stack>
              </Paper>
            </Box>

            {/* ---- Badges Section ---- */}
            {/* Future work will render only earned badges in color. Can be accessed from useData.earnedBadges */}
            <Box>
              <Paper variant='outlined' sx={{ padding: 2, borderRadius: 4 }}>
                <Box mb={2} gap={1} display='flex' alignItems='center'>
                  <Typography variant='h4'>Badges </Typography>
                  {canEditProfile && numEarnedBadges > 0 && (
                    <Chip
                      color='success'
                      sx={{ color: 'white', fontWeight: 'bold' }}
                      label={`You have earned ${numEarnedBadges} badge${numEarnedBadges > 1 ? 's' : ''}!`}></Chip>
                  )}
                </Box>
                <Box display='flex' flexWrap='wrap' gap={3} justifyContent={'center'}>
                  {allBadges && allBadges.length > 0 ? (
                    allBadges.map(badge => (
                      <Box
                        key={String(badge._id)}
                        display='flex'
                        flexDirection='column'
                        alignItems='center'
                        textAlign='center'
                        sx={{ filter: 'grayscale(100%)', opacity: 0.3 }}>
                        <Box
                          component='img'
                          src={badge.imagePath}
                          alt={badge.name}
                          sx={{ width: 95, height: 95, borderRadius: '50%' }}
                        />
                        <Typography width={90} mt={1} variant='body2'>
                          {badge.description}
                        </Typography>
                      </Box>
                    ))
                  ) : (
                    <Typography>No badges available yet.</Typography>
                  )}
                </Box>
              </Paper>
            </Box>

            {/* ---- Reset Password Section ---- */}
            <Box>
              {canEditProfile && (
                <Paper variant='outlined' sx={{ padding: 2, borderRadius: 4 }}>
                  <Typography variant='h4'>Reset Password</Typography>
                  <Stack gap={2} mt={1}>
                    <TextField
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={event => setNewPassword(event.target.value)}
                      required
                      label='New Password'
                      fullWidth
                      slotProps={{
                        input: {
                          endAdornment: (
                            <InputAdornment position='end'>
                              <IconButton
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                                onClick={togglePasswordVisibility}
                                edge='end'>
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        },
                      }}
                    />
                    <TextField
                      type={showPassword ? 'text' : 'password'}
                      value={confirmNewPassword}
                      onChange={event => setConfirmNewPassword(event.target.value)}
                      required
                      label='Confirm New Password'
                      fullWidth
                      slotProps={{
                        input: {
                          endAdornment: (
                            <InputAdornment position='end'>
                              <IconButton
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                                onClick={togglePasswordVisibility}
                                edge='end'>
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        },
                      }}
                    />
                    <Button variant='contained' onClick={handleResetPassword}>
                      Reset
                    </Button>
                  </Stack>
                </Paper>
              )}
            </Box>

            {/* ---- Danger Zone (Delete User) ---- */}
            <Box>
              {canEditProfile && (
                <Paper variant='outlined' sx={{ padding: 2, borderRadius: 4 }}>
                  <Typography variant='h4'>Danger Zone</Typography>
                  <Button
                    sx={{ mt: 1 }}
                    variant='contained'
                    color='error'
                    onClick={handleDeleteUser}>
                    Delete This User
                  </Button>
                </Paper>
              )}
            </Box>
          </>
        ) : (
          <Typography>No user data found. Make sure the username parameter is correct.</Typography>
        )}

        {/* ---- Confirmation Modal for Delete ---- */}
        <Dialog open={showConfirmation} onClose={() => setShowConfirmation(false)}>
          <DialogContent>
            <Typography>
              Are you sure you want to delete user <strong>{userData?.username}</strong>? This
              action cannot be undone.
            </Typography>
            <Box mt={2} display='flex' justifyContent='right' gap={2}>
              <Button variant='outlined' onClick={() => pendingAction && pendingAction()}>
                Confirm
              </Button>
              <Button variant='contained' onClick={() => setShowConfirmation(false)}>
                Cancel
              </Button>
            </Box>
          </DialogContent>
        </Dialog>
      </Stack>
    </Box>
  );
};

export default ProfileSettings;
