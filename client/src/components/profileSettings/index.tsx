import React from 'react';
import './index.css';
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
  } = useProfileSettings();

  const numEarnedBadges = userData?.badgesEarned ? userData.badgesEarned.length : 0;

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
        <h2>Profile</h2>
        {successMessage && <p className='success-message'>{successMessage}</p>}
        {errorMessage && <p className='error-message'>{errorMessage}</p>}
        {userData ? (
          <>
            {/* ---- Profile Photo ---- */}
            <div className='profile-photo-container'>
              <img
                src={profilePhoto || '/images/avatars/default-avatar.png'}
                className='profile-photo'
              />
              {canEditProfile && (
                <button className='edit-button' onClick={() => setEditProfilePhotoMode(true)}>
                  {editProfilePhotoMode ? 'Cancel' : 'Edit'}
                </button>
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

            {/* ---- General Information ---- */}
            <h4>General Information</h4>
            <p>
              <strong>Username:</strong> {userData.username}
            </p>

            {/* ---- Biography Section ---- */}
            {!editBioMode && (
              <p>
                <strong>Biography:</strong> {userData.biography || 'No biography yet.'}
                {canEditProfile && (
                  <button
                    className='login-button'
                    style={{ marginLeft: '1rem' }}
                    onClick={() => {
                      setEditBioMode(true);
                      setNewBio(userData.biography || '');
                    }}>
                    Edit
                  </button>
                )}
              </p>
            )}

            {editBioMode && canEditProfile && (
              <div style={{ margin: '1rem 0' }}>
                <input
                  className='input-text'
                  type='text'
                  value={newBio}
                  onChange={e => setNewBio(e.target.value)}
                />
                <button
                  className='login-button'
                  style={{ marginLeft: '1rem' }}
                  onClick={handleUpdateBiography}>
                  Save
                </button>
                <button
                  className='delete-button'
                  style={{ marginLeft: '1rem' }}
                  onClick={() => setEditBioMode(false)}>
                  Cancel
                </button>
              </div>
            )}

            <p>
              <strong>Date Joined:</strong>{' '}
              {userData.dateJoined ? new Date(userData.dateJoined).toLocaleDateString() : 'N/A'}
            </p>

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
