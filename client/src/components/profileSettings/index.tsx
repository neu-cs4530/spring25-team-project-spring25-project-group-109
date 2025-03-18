import React from 'react';
import './index.css';
import { Button, Input, Typography } from '@mui/material';
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
    <div className='page-container'>
      <div className='profile-card'>
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
        {userData ? (
          <>
            {/* ---- Profile Photo ---- */}
            <div className='profile-photo-container'>
              <img
                src={profilePhoto || '/images/avatars/default-avatar.png'}
                className='profile-photo'
              />
              {canEditProfile && (
                <Button variant='contained' color='primary' onClick={handleButtonClick}>
                  {editProfilePhotoMode ? 'Cancel' : 'Change Photo'}
                </Button>
              )}
            </div>

            {/* ---- Avatar Selection ---- */}
            {editProfilePhotoMode && canEditProfile && (
              <div className='avatar-selection'>
                <div className='avatar-grid'>
                  {availableAvatars.map(avatar => (
                    <img
                      key={avatar}
                      src={avatar}
                      className={`avatar-option ${profilePhoto === avatar ? 'selected' : ''}`}
                      onClick={() => {
                        handleUpdateProfilePhoto(avatar);
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* ---- Follower/Following Section ---- */}

            <div className='follow-stats-container'>
              <div className='follow-stats'>
                <span className='follow-count' onClick={() => setShowFollowers(true)}>
                  <Typography variant='subtitle1'>
                    <span style={{ fontWeight: 'bold' }}>{userData.followers.length}</span>{' '}
                    Followers
                  </Typography>
                </span>
                <span className='follow-count' onClick={() => setShowFollowing(true)}>
                  <Typography variant='subtitle1'>
                    <span style={{ fontWeight: 'bold' }}>{userData.following.length}</span>{' '}
                    Following
                  </Typography>
                </span>
              </div>

              {!canEditProfile && (
                <button
                  className={isFollowing ? 'unfollow-button' : 'follow-button'}
                  onClick={isFollowing ? handleUnfollowUser : handleFollowUser}>
                  {isFollowing ? 'Unfollow' : 'Follow'}
                </button>
              )}
            </div>

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

            {/* ---- General Information ---- */}
            <Typography variant='h4'>General Information</Typography>
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

            {/* ---- Badges Section ---- */}
            {/* Future work will render only earned badges in color. Can be accessed from useData.earnedBadges */}
            <h4>
              Badges
              {canEditProfile && numEarnedBadges > 0 && (
                <span className='badge-count'>
                  You have earned {numEarnedBadges} badge{numEarnedBadges > 1 ? 's' : ''}!
                </span>
              )}
            </h4>
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

            {/* ---- Reset Password Section ---- */}
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

            {/* ---- Danger Zone (Delete User) ---- */}
            {canEditProfile && (
              <>
                <h4>Danger Zone</h4>
                <button className='delete-button' onClick={handleDeleteUser}>
                  Delete This User
                </button>
              </>
            )}
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
      </div>
    </div>
  );
};

export default ProfileSettings;
