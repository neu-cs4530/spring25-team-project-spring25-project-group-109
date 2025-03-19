import React from 'react';
import './index.css';
import { Avatar, Box, Button, Container, Input, Stack, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import useProfileSettings from '../../hooks/useProfileSettings';

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
      <div className='page-container'>
        <div className='profile-card'>
          <h2>Loading user data...</h2>
        </div>
      </div>
    );
  }

  return (
    <Box sx={{ padding: 4, maxWidth: 700, margin: 'auto' }}>
      <Typography variant='h2'>Profile</Typography>
      {successMessage && (
        <Typography style={{ fontWeight: 'bold' }} variant='subtitle1' color='success.main'>
          {successMessage}
        </Typography>
      )}
      {errorMessage && (
        <Typography style={{ fontWeight: 'bold' }} variant='subtitle1' color='error.main'>
          {errorMessage}
        </Typography>
      )}
      <Stack spacing={4}>
        {userData ? (
          <>
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
                  src={profilePhoto || '/images/avatars/default-avatar.png'}
                  className='profile-photo'
                />
                {canEditProfile && (
                  <Button variant='contained' color='primary' onClick={handleButtonClick}>
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
                    sx={{ maxWidth: 200 }} // Limiting button width
                  >
                    {isFollowing ? 'Unfollow' : 'Follow'}
                  </Button>
                )}
              </Box>

              {showFollowers && (
                <div className='modal'>
                  <div className='modal-content'>
                    <h3>Followers</h3>
                    {userData.followers.length > 0 ? (
                      <ul>
                        {userData.followers.map(follower => (
                          <li key={follower}>{follower}</li>
                        ))}
                      </ul>
                    ) : (
                      <p>No followers yet.</p>
                    )}
                    <button className='close-button' onClick={() => setShowFollowers(false)}>
                      Close
                    </button>
                  </div>
                </div>
              )}

              {showFollowing && (
                <div className='modal'>
                  <div className='modal-content'>
                    <h3>Following</h3>
                    {userData.following.length > 0 ? (
                      <ul>
                        {userData.following.map(following => (
                          <li key={following}>{following}</li>
                        ))}
                      </ul>
                    ) : (
                      <p>Not following anyone yet.</p>
                    )}
                    <Button variant='contained' onClick={() => setShowFollowing(false)}>
                      Close
                    </Button>
                  </div>
                </div>
              )}
            </Box>

            {/* ---- General Information ---- */}
            <Box>
              <Typography variant='h4' mt={2}>
                General Information
              </Typography>
              <Stack spacing={2} mt={1}>
                <Typography variant='subtitle1'>
                  <span style={{ fontWeight: 'bold' }}>Username:</span> {userData.username}
                </Typography>

                {/* ---- Biography Section ---- */}
                {!editBioMode && (
                  <div className='bio-container'>
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
                  </div>
                )}

                {editBioMode && canEditProfile && (
                  <div style={{ margin: '1rem 0' }}>
                    <Input
                      className='input-text'
                      type='text'
                      value={newBio}
                      onChange={e => setNewBio(e.target.value)}
                    />
                    <Button
                      className='login-button'
                      variant='contained'
                      onClick={handleUpdateBiography}>
                      Save
                    </Button>
                    <Button
                      className='delete-button'
                      style={{ marginLeft: '1rem' }}
                      onClick={() => setEditBioMode(false)}>
                      Cancel
                    </Button>
                  </div>
                )}
                <Typography variant='subtitle1'>
                  <span style={{ fontWeight: 'bold' }}>Date Joined:</span>{' '}
                  {userData.dateJoined ? new Date(userData.dateJoined).toLocaleDateString() : 'N/A'}
                </Typography>
              </Stack>
            </Box>

            {/* ---- Badges Section ---- */}
            {/* Future work will render only earned badges in color. Can be accessed from useData.earnedBadges */}
            <Box>
              <Typography variant='h4'>
                Badges{' '}
                {canEditProfile && numEarnedBadges > 0 && (
                  <span className='badge-count'>
                    You have earned {numEarnedBadges} badge{numEarnedBadges > 1 ? 's' : ''}!
                  </span>
                )}
              </Typography>
              <div className='badges-grid'>
                {allBadges && allBadges.length > 0 ? (
                  allBadges.map(badge => (
                    <div key={String(badge._id)} className='badge'>
                      <img src={badge.imagePath} alt={badge.name} className={`badge-image`} />
                      <div className='badge-description'>{badge.description}</div>
                    </div>
                  ))
                ) : (
                  <p>No badges available yet.</p>
                )}
              </div>
            </Box>

            {/* ---- Reset Password Section ---- */}
            <Box>
              {canEditProfile && (
                <>
                  <h4>Reset Password</h4>
                  <input
                    className='input-text'
                    type={showPassword ? 'text' : 'password'}
                    placeholder='New Password'
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                  />
                  <input
                    className='input-text'
                    type={showPassword ? 'text' : 'password'}
                    placeholder='Confirm New Password'
                    value={confirmNewPassword}
                    onChange={e => setConfirmNewPassword(e.target.value)}
                  />
                  <button className='toggle-password-button' onClick={togglePasswordVisibility}>
                    {showPassword ? 'Hide Passwords' : 'Show Passwords'}
                  </button>
                  <button className='login-button' onClick={handleResetPassword}>
                    Reset
                  </button>
                </>
              )}
            </Box>

            {/* ---- Danger Zone (Delete User) ---- */}
            <Box>
              {canEditProfile && (
                <>
                  <h4>Danger Zone</h4>
                  <button className='delete-button' onClick={handleDeleteUser}>
                    Delete This User
                  </button>
                </>
              )}
            </Box>
          </>
        ) : (
          <p>No user data found. Make sure the username parameter is correct.</p>
        )}

        {/* ---- Confirmation Modal for Delete ---- */}
        {showConfirmation && (
          <div className='modal'>
            <div className='modal-content'>
              <p>
                Are you sure you want to delete user <strong>{userData?.username}</strong>? This
                action cannot be undone.
              </p>
              <button className='delete-button' onClick={() => pendingAction && pendingAction()}>
                Confirm
              </button>
              <button className='cancel-button' onClick={() => setShowConfirmation(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </Stack>
    </Box>
  );
};

export default ProfileSettings;
