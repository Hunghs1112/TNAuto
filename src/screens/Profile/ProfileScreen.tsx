// src/screens/Profile/ProfileScreen.tsx — ProfileContainer
import React from 'react';
import { useProfileScreen } from './useProfileScreen';
import ProfileView from './ProfileView';

const ProfileContainer = () => {
  const data = useProfileScreen();

  // Auth guard — render null while redirecting to Login
  if (!data.isLoggedIn) {
    return null;
  }

  return (
    <ProfileView
      userName={data.userName}
      userPhone={data.userPhone}
      userType={data.userType}
      avatarUrl={data.avatarUrl}
      roleLabel={data.roleLabel}
      sections={data.sections}
      handleLogout={data.handleLogout}
      handleDeleteAccount={data.handleDeleteAccount}
      isDeleting={data.isDeleting}
      navigateToAccountInfo={data.navigateToAccountInfo}
      appVersion={data.appVersion}
    />
  );
};

export default React.memo(ProfileContainer);
