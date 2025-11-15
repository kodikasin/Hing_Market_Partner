import React from 'react';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import type { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';

export const screenOptions = ({ route }: { route: any }): BottomTabNavigationOptions => ({
  tabBarIcon: ({ color, size }: { color: string; size: number }) => {
    if (route.name === 'Home') {
      return <MaterialDesignIcons name="home" color={color} size={size} />;
    } else if (route.name === 'Orders') {
      return <MaterialDesignIcons name="clipboard-list" color={color} size={size} />;
    } else if (route.name === 'Profile') {
      return <MaterialDesignIcons name="account" color={color} size={size} />;
    }
    return null;
  },
  tabBarActiveTintColor: '#6e4337',
  tabBarInactiveTintColor: '#666',
  tabBarLabelStyle: { fontSize: 12},
});
