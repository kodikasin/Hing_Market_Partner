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
  const status = order.status.delivered ? 'Delivered' : order.status.paid ? 'Paid' : 'Pending';
  return (
    <TouchableOpacity style={styles.orderCard} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.left}>
        <Text style={styles.name}>{order.customerName}</Text>
        <Text style={styles.small}>{order.phone || ''}</Text>
        <View style={[styles.statusPill, status === 'Pending' ? styles.pendingPill : styles.paidPill]}>
          <Text style={styles.pillText}>{status}</Text>
        </View>
      </View>
      <View style={styles.right}>
        <Text style={styles.total}>₹{order.totalAmount.toFixed(2)}</Text>
        <Text style={styles.rightStatus}>{status}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default OrderList;

const styles = StyleSheet.create({
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    elevation: 1,
  },
  left: { flex: 1 },
  right: { alignItems: 'flex-end', marginLeft: 12 },
  name: { fontSize: 16, fontWeight: '700', color: '#3a241f' },
  small: { fontSize: 12, color: '#7a6258', marginTop: 6 },
  total: { fontWeight: '700', color: '#3a241f', fontSize: 14 },
  rightStatus: { fontSize: 12, color: '#7a6258', marginTop: 6 },
  statusPill: { marginTop: 10, paddingHorizontal: 8, paddingVertical: 6, borderRadius: 12, alignSelf: 'flex-start' },
  pendingPill: { backgroundColor: '#eadfd9' },
  paidPill: { backgroundColor: '#dfe8df' },
  pillText: { fontSize: 12, color: '#5b4037', fontWeight: '700' },
});
