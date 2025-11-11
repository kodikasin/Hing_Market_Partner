import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Home from "../pages/Home";
import OrderDetail from "../pages/OrderDetail";
import AddEditOrder from "../pages/AddEditOrder";

const OrdersStack = createNativeStackNavigator();
export function OrdersStackScreen() {
  return (
    <OrdersStack.Navigator>
      <OrdersStack.Screen name="Orders" component={Home} options={{ title: 'Orders' }} />
      <OrdersStack.Screen name="OrderDetail" component={OrderDetail} options={{ title: 'Order Detail' }} />
      <OrdersStack.Screen name="AddEditOrder" component={AddEditOrder} options={{ title: 'Add / Edit Order' }} />
    </OrdersStack.Navigator>
  );
}