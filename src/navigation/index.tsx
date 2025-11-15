import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { OrdersStackScreen } from './OrdersStack';
import { ProfileStackScreen } from './ProfileStack';
import { screenOptions } from '../utils/navigationFun';
import Home from '../pages/Home';

const Tab = createBottomTabNavigator();

export default function AppNavigation() {
  return (
    <NavigationContainer>
      <Tab.Navigator screenOptions={screenOptions}>
        <Tab.Screen name="Home" component={Home} />
        <Tab.Screen
          name="Orders"
          component={OrdersStackScreen}
          options={{ headerShown: false }}
        />
        <Tab.Screen name="Profile" component={ProfileStackScreen} options={{ headerShown: false }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
