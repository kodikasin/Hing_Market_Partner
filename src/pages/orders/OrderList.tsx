import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Order, selectOrders } from '../../store/orderSlice';
import { ListEmpty } from '../../components/ListEmpty';
import { NavigationProp, useNavigation } from '@react-navigation/native';

interface IOrderListProps {
  filter: string;
}

type RootStackParamList = {
  OrderDetail: { orderId: string };
};

const OrderList = ({ filter }: IOrderListProps) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const orders = useSelector(selectOrders);

  const filtered = useMemo(() => {
    switch (filter) {
      case 'Pending':
        return orders.filter(o => !o.status.delivered);
      case 'Delivered':
        return orders.filter(o => o.status.delivered);
      case 'Unpaid':
        return orders.filter(o => !o.status.paid);
      default:
        return orders;
    }
  }, [orders, filter]);

  return (
    <FlatList
      data={filtered}
      keyExtractor={item => item.id}
      renderItem={({ item }) => (
        <OrderRow
          order={item}
          onPress={() =>
            navigation.navigate('OrderDetail' as any, { orderId: item.id })
          }
        />
      )}
      ListEmptyComponent={ListEmpty}
    />
  );
};

function OrderRow({ order, onPress }: { order: Order; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress}>
      <View>
        <Text style={styles.name}>{order.customerName}</Text>
        <Text style={styles.small}>{order.phone || ''}</Text>
      </View>
      <View style={styles.endView}>
        <Text style={styles.total}>₹{order.totalAmount.toFixed(2)}</Text>
        <Text style={styles.small}>
          {order.status.delivered
            ? 'Delivered'
            : order.status.paid
            ? 'Paid'
            : 'Pending'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default OrderList;

const styles = StyleSheet.create({
  row: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  name: { fontSize: 16, fontWeight: '600' },
  small: { fontSize: 12, color: '#555' },
  total: { fontWeight: '700' },
  endView:{ alignItems: 'flex-end' }
});
