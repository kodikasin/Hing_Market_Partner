import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OrdersStackScreen } from './OrdersStack';
import { ProfileStackScreen } from './ProfileStack';
import { screenOptions } from '../utils/navigationFun';
import Home from '../pages/Home';
import PdfViewer from '../components/PdfViewer';
import OrderDetail from '../pages/orders/OrderDetail';

const Tab = createBottomTabNavigator();
const RootStack = createNativeStackNavigator();

function MainTabs() {
  return (
    <Tab.Navigator screenOptions={screenOptions}>
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen
        name="Orders"
        component={OrdersStackScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen name="Profile" component={ProfileStackScreen} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
}

export default function AppNavigation() {
  return (
    <NavigationContainer>
      <RootStack.Navigator>
        <RootStack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
        <RootStack.Screen name="OrderDetailModal" component={OrderDetail} options={{ title: 'Order Detail' }} />
        <RootStack.Screen name="PdfViewer" component={PdfViewer} options={{ title: 'PDF Viewer' }} />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
