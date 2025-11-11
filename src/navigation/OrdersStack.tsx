import { createNativeStackNavigator } from "@react-navigation/native-stack";
import OrderDetail from "../pages/orders/OrderDetail";
import AddEditOrder from "../pages/orders/AddEditOrder";
import Orders from "../pages/orders/Orders";

const OrdersStack = createNativeStackNavigator();
export function OrdersStackScreen() {
  return (
    <OrdersStack.Navigator>
      <OrdersStack.Screen name="OrdersScreen" component={Orders} options={{ title: 'Orders' }} />
      <OrdersStack.Screen name="OrderDetail" component={OrderDetail} options={{ title: 'Order Detail' }} />
      <OrdersStack.Screen name="AddEditOrder" component={AddEditOrder} options={{ title: 'Add / Edit Order' }} />
    </OrdersStack.Navigator>
  );
}