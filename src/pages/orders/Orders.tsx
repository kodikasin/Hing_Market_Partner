import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useSelector } from 'react-redux';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { selectOrders, Order } from '../../store/orderSlice';

type RootStackParamList = {
  OrderDetail: { orderId: string };
}


const filters = ['All', 'Pending', 'Delivered', 'Unpaid'] as const;

export default function Orders() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const orders = useSelector(selectOrders);
  const [filter, setFilter] = useState<(typeof filters)[number]>('All');

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
    <View style={styles.container}>
      <View style={styles.filtersRow}>
        {filters.map(f => (
          <TouchableOpacity
            key={f}
            onPress={() => setFilter(f)}
            style={[styles.filterBtn, filter === f && styles.filterActive]}
          >
            <Text style={styles.filterText}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <OrderRow
            order={item}
            onPress={() =>
              navigation.navigate('OrderDetail' as  any, { orderId: item.id })
            }
          />
        )}
        ListEmptyComponent={() => (
          <Text style={{ textAlign: 'center', marginTop: 20 }}>
            No orders yet
          </Text>
        )}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddEditOrder' as any)}
      >
        <Text style={{ color: 'white', fontSize: 24 }}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

function OrderRow({ order, onPress }: { order: Order; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress}>
      <View>
        <Text style={styles.name}>{order.customerName}</Text>
        <Text style={styles.small}>{order.phone || ''}</Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
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

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12 },
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
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 24,
    backgroundColor: '#007AFF',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filtersRow: { flexDirection: 'row', marginBottom: 8 },
  filterBtn: {
    padding: 8,
    marginRight: 8,
    borderRadius: 6,
    backgroundColor: '#f2f2f2',
  },
  filterActive: { backgroundColor: '#007AFF' },
  filterText: { color: '#000' },
});
