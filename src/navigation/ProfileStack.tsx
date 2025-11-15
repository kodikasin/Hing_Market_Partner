import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Profile from '../pages/profile/Profile';
import EditProfile from '../pages/profile/EditProfile';

const ProfileStack = createNativeStackNavigator();

export function ProfileStackScreen() {
  return (
    <ProfileStack.Navigator>
      <ProfileStack.Screen name="ProfileScreen" component={Profile} options={{ title: 'Profile' }} />
      <ProfileStack.Screen name="EditProfile" component={EditProfile} options={{ title: 'Edit Profile' }} />
    </ProfileStack.Navigator>
  );
}

export default ProfileStackScreen;
