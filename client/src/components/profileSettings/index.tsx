import React, { useRef } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
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
import { AddCircle, Visibility, VisibilityOff } from '@mui/icons-material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import { Link } from 'react-router-dom';
import useProfileSettings from '../../hooks/useProfileSettings';
import modalStyle from './styles';
import CollectionView from './collection';
import useUsersListPage from '../../hooks/useUsersListPage';

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
    collectionName,
    followsCurrentUser,
    showPassword,
    togglePasswordVisibility,
    allBadges,
    collections,
    isFollowing,
    showFollowers,
    setShowFollowers,
    showFollowing,
    setShowAddCollection,
    showAddCollection,
    setShowFollowing,
    clickQuestion,
    handleAddCollection,
    permissions,

    setEditBioMode,
    setEditProfilePhotoMode,
    setNewBio,
    setNewPassword,
    setConfirmNewPassword,
    setShowConfirmation,

    handleUpdateCollection,
    handleResetPassword,
    handleUpdateBiography,
    handleDeleteUser,
    handleUpdateProfilePhoto,
    handleUploadProfilePhoto,
    handleFollowUser,
    handleUnfollowUser,
    handleCollectionInputChange,
    handleDeleteCollection,
    handleTogglePrivacy,
    handleRemoveQuestion,
  } = useProfileSettings();
  const { userList } = useUsersListPage();

  const numEarnedBadges = userData?.badgesEarned ? userData.badgesEarned.length : 0;
  const fileInputRef = useRef<HTMLInputElement>(null);

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
                <Avatar sx={{ width: 120, height: 120 }} src={profilePhoto} />
                {canEditProfile && (
                  <>
                    <Button
                      variant='contained'
                      color='primary'
                      onClick={() => setEditProfilePhotoMode(!editProfilePhotoMode)}
                      sx={{ mt: 2 }}>
                      {editProfilePhotoMode ? 'Cancel' : 'Change Photo'}
                    </Button>

                    {editProfilePhotoMode && permissions.customPhoto && (
                      <>
                        <input
                          type='file'
                          accept='image/*'
                          ref={fileInputRef}
                          style={{ display: 'none' }}
                          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                            const file = event.target.files?.[0];
                            if (file) {
                              handleUploadProfilePhoto(file);
                            }
                          }}
                        />
                        <Button
                          variant='outlined'
                          color='secondary'
                          onClick={() => fileInputRef.current?.click()}
                          sx={{ mt: 1 }}>
                          Upload Profile Photo
                        </Button>
                      </>
                    )}
                  </>
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
                      sx={{ cursor: 'pointer' }}
                      key={avatar}
                      src={avatar}
                      onClick={() => {
                        handleUpdateProfilePhoto(avatar);
                      }}
                    />
                  ))}
                  <IconButton
                    onClick={() => handleUpdateProfilePhoto('')}
                    sx={{
                      'width': 40,
                      'height': 40,
                      'display': 'flex',
                      'border': '1px solid gray',
                      'backgroundColor': 'white',
                      '&:hover': { backgroundColor: '#f0f0f0' },
                    }}>
                    <CloseIcon />
                  </IconButton>
                </Container>
              )}

              {/* ---- Follower/Following Section ---- */}
              <Box display={'flex'} flexDirection={'column'} mt={2} alignItems='center'>
                <Box display='flex' justifyContent='center' alignItems='center' gap={2}>
                  <Typography
                    variant='subtitle1'
                    onClick={() => (followsCurrentUser || canEditProfile) && setShowFollowers(true)}
                    sx={{ cursor: followsCurrentUser ? 'pointer' : 'default' }}>
                    <strong>{userData.followers.length}</strong> Followers
                  </Typography>

                  <Typography
                    variant='subtitle1'
                    onClick={() => (followsCurrentUser || canEditProfile) && setShowFollowing(true)}
                    sx={{ cursor: followsCurrentUser ? 'pointer' : 'default' }}>
                    <strong>{userData.following.length}</strong> Following
                  </Typography>
                </Box>

                {/* Show privacy notice if user cannot see the lists */}
                {!followsCurrentUser && !canEditProfile && (
                  <Typography variant='caption' color='text.secondary' sx={{ m: 1 }}>
                    User&apos;s followers and following lists are private unless they follow you.
                  </Typography>
                )}

                {/* Follow/Unfollow Button */}
                {!canEditProfile &&
                  (isFollowing ? (
                    <Button variant='outlined' onClick={handleUnfollowUser} sx={{ mt: 1 }}>
                      Unfollow
                    </Button>
                  ) : (
                    <Button
                      variant='contained'
                      color='primary'
                      onClick={handleFollowUser}
                      sx={{ mt: 1 }}>
                      Follow
                    </Button>
                  ))}
              </Box>

              <Modal
                open={showFollowers && (canEditProfile || followsCurrentUser)}
                onClose={() => setShowFollowers(false)}>
                <Box sx={modalStyle}>
                  <Typography variant='h4'>Followers</Typography>
                  {userData.followers.length > 0 ? (
                    <Box sx={{ alignItems: 'center' }}>
                      {userData.followers.map(follower => (
                        <Link
                          to={`/user/${follower}`}
                          onClick={() => setShowFollowers(false)}
                          style={{ textDecoration: 'none', color: 'inherit' }}
                          key={follower}>
                          <Card
                            sx={{
                              'display': 'flex',
                              'padding': 1,
                              'cursor': 'pointer',
                              'boxShadow': 3,
                              'borderRadius': 2,
                              '&:hover': { boxShadow: 6 },
                              'marginY': 1,
                              'width': '100%',
                              'pr': 20,
                            }}>
                            <Avatar
                              src={
                                userList.find(user => user.username === follower)?.profilePhoto ||
                                ''
                              }
                              alt={`${follower}'s profile`}
                              sx={{ width: 48, height: 48, marginRight: 2 }}
                            />
                            <Box
                              sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                width: '100%',
                              }}>
                              <Typography variant='h6' component='div' sx={{ fontWeight: 'bold' }}>
                                {follower}
                              </Typography>
                            </Box>
                          </Card>
                        </Link>
                      ))}
                    </Box>
                  ) : (
                    <p style={{ textAlign: 'center' }}>No followers yet.</p>
                  )}
                  <Button
                    variant='contained'
                    onClick={() => setShowFollowers(false)}
                    sx={{ marginTop: 2 }}>
                    Close
                  </Button>
                </Box>
              </Modal>

              <Modal
                open={showFollowing && (canEditProfile || followsCurrentUser)}
                onClose={() => setShowFollowing(false)}>
                <Box sx={modalStyle}>
                  <Typography variant='h4'>Following</Typography>
                  {userData.following.length > 0 ? (
                    <Box sx={{ alignItems: 'center' }}>
                      {userData.following.map(following => (
                        <Link
                          to={`/user/${following}`}
                          onClick={() => setShowFollowing(false)}
                          style={{ textDecoration: 'none', color: 'inherit' }}
                          key={following}>
                          <Card
                            sx={{
                              'display': 'flex',
                              'padding': 1,
                              'cursor': 'pointer',
                              'boxShadow': 3,
                              'borderRadius': 2,
                              '&:hover': { boxShadow: 6 },
                              'marginY': 1,
                              'width': '100%',
                              'pr': 20,
                            }}>
                            <Avatar
                              src={
                                userList.find(user => user.username === following)?.profilePhoto ||
                                ''
                              }
                              alt={`${following}'s profile`}
                              sx={{ width: 48, height: 48, marginRight: 2 }}
                            />
                            <Box
                              sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                width: '100%',
                              }}>
                              <Typography variant='h6' component='div' sx={{ fontWeight: 'bold' }}>
                                {following}
                              </Typography>
                            </Box>
                          </Card>
                        </Link>
                      ))}
                    </Box>
                  ) : (
                    <p style={{ textAlign: 'center' }}>Not following anyone yet.</p>
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
                    allBadges.map(badge => {
                      const earnedBadge = userData.badgesEarned?.find(
                        earned => earned.badgeId === badge._id.toString(),
                      );
                      const dateEarned = earnedBadge?.dateEarned
                        ? new Date(earnedBadge.dateEarned).toLocaleDateString()
                        : null;

                      return (
                        <Box
                          key={String(badge._id)}
                          display='flex'
                          flexDirection='column'
                          alignItems='center'
                          textAlign='center'
                          sx={{
                            filter: earnedBadge ? 'none' : 'grayscale(100%)',
                            opacity: earnedBadge ? 1 : 0.2,
                          }}>
                          <Box
                            component='img'
                            src={badge.imagePath}
                            alt={badge.name}
                            sx={{ width: 95, height: 95, borderRadius: '50%' }}
                          />
                          <Typography width={90} mt={1} variant='body2'>
                            {badge.description}
                          </Typography>
                          {earnedBadge && dateEarned && (
                            <Typography width={90} variant='caption' color='text.secondary'>
                              {dateEarned}
                            </Typography>
                          )}
                        </Box>
                      );
                    })
                  ) : (
                    <Typography>No badges available yet.</Typography>
                  )}
                </Box>
              </Paper>
            </Box>

            {/* ---- Collections Section ---- */}
            <Box>
              <Paper variant='outlined' sx={{ padding: 2, borderRadius: 4 }}>
                <Box display='flex' justifyContent='space-between' alignItems='center'>
                  <Typography variant='h4'>Collections</Typography>
                  {canEditProfile && (
                    <IconButton onClick={() => setShowAddCollection(true)}>
                      <AddCircle color='primary' />
                    </IconButton>
                  )}
                </Box>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: 2,
                    mt: 1,
                  }}>
                  {collections.length > 0 ? (
                    collections.map(collection => (
                      <CollectionView
                        key={String(collection._id)}
                        collection={collection}
                        canEditProfile={canEditProfile}
                        clickQuestion={clickQuestion}
                        handleUpdateCollection={handleUpdateCollection}
                        handleDeleteCollection={handleDeleteCollection}
                        handleTogglePrivacy={handleTogglePrivacy}
                        handleRemoveQuestion={handleRemoveQuestion}
                      />
                    ))
                  ) : (
                    <Typography>No collections available.</Typography>
                  )}
                </Box>
              </Paper>
            </Box>

            <Dialog open={showAddCollection} onClose={() => setShowAddCollection(false)}>
              <DialogContent>
                <Box component={'form'} onSubmit={handleAddCollection}>
                  <Typography variant='h4'>Add Collection</Typography>
                  <TextField
                    label='Collection Name'
                    fullWidth
                    type='text'
                    required
                    sx={{ mt: 2 }}
                    variant='outlined'
                    value={collectionName}
                    onChange={handleCollectionInputChange}
                  />
                  <Button type='submit' variant='contained' color='primary' sx={{ mt: 2 }}>
                    Add
                  </Button>
                </Box>
              </DialogContent>
            </Dialog>

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
