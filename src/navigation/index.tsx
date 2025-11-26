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
import Login from '../pages/Login';
import Register from '../pages/Register';
import { AuthProvider, useAuth } from '../services/AuthProvider';

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
      <Tab.Screen
        name="Profile"
        component={ProfileStackScreen}
        options={{ headerShown: false }}
      />
    </Tab.Navigator>
  );
}

function AppContent() {
  const { loading, isAuthenticated } = useAuth();

  if (loading) return null; // or a splash screen

  return (
    <NavigationContainer>
      <RootStack.Navigator>
        {!isAuthenticated ? (
          <>
            <RootStack.Screen
              name="Login"
              component={Login}
              options={{ headerShown: false }}
            />
            <RootStack.Screen
              name="Register"
              component={Register}
              options={{ headerShown: false }}
            />
          </>
        ) : (
          <>
            <RootStack.Screen
              name="Main"
              component={MainTabs}
              options={{ headerShown: false }}
            />
            <RootStack.Screen
              name="OrderDetailModal"
              component={OrderDetail}
              options={{ title: 'Order Detail' }}
            />
            <RootStack.Screen
              name="PdfViewer"
              component={PdfViewer}
              options={{ title: 'PDF Viewer' }}
            />
          </>
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

export default function AppNavigation() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
