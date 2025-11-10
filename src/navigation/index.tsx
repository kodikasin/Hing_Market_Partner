import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from '../pages/Home';
import AddEditOrder from '../pages/AddEditOrder';
import OrderDetail from '../pages/OrderDetail';

export type RootStackParamList = {
  Home: undefined;
  AddEditOrder: { orderId?: string } | undefined;
  OrderDetail: { orderId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen
          name="AddEditOrder"
          component={AddEditOrder}
          options={{ title: 'Add / Edit Order' }}
        />
        <Stack.Screen
          name="OrderDetail"
          component={OrderDetail}
          options={{ title: 'Order Detail' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
