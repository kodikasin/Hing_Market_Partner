import React, { useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useSelector } from 'react-redux';
import { selectOrders, Order } from '../store/orderSlice';
import { selectCompany } from '../store/companySlice';
import { ListEmpty } from '../components/ListEmpty';
import { NavigationProp, useNavigation } from '@react-navigation/native';

const Dashboard = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const orders = useSelector(selectOrders);
  const company = useSelector(selectCompany);

  const {
    totalOrders,
    totalEarnings,
    todayEarnings,
    unpaidCount,
    recentOrders,
  } = useMemo(() => {
    const tTotalOrders = orders.length;
    const tTotalEarnings = orders.reduce((s, o) => s + (o.totalAmount || 0), 0);
    const todayKey = new Date().toISOString().slice(0, 10);
    const tTodayEarnings = orders
      .filter(o => (o.createdAt || '').slice(0, 10) === todayKey)
      .reduce((s, o) => s + (o.totalAmount || 0), 0);
    const tUnpaidCount = orders.filter(o => !o.status.paid).length;
    const tRecentOrders = orders.slice(0, 6);
    return {
      totalOrders: tTotalOrders,
      totalEarnings: tTotalEarnings,
      todayEarnings: tTodayEarnings,
      unpaidCount: tUnpaidCount,
      recentOrders: tRecentOrders,
    };
  }, [orders]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{company?.companyName || 'Dashboard'}</Text>

      <View style={styles.cardsRow}>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Total Orders</Text>
          <Text style={styles.cardValue}>{totalOrders}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Earnings</Text>
          <Text style={styles.cardValue}>₹{totalEarnings.toFixed(2)}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Today</Text>
          <Text style={styles.cardValue}>₹{todayEarnings.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.summaryRow}>
        <Text style={styles.summaryText}>Unpaid / Pending: {unpaidCount}</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Orders' as any)}>
          <Text style={styles.link}>Open Orders</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.listHeader}>
        <Text style={styles.sectionTitle}>Recent Orders</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Orders' as any)}>
          <Text style={styles.link}>See all</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={recentOrders}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <OrderRow
            order={item}
            onPress={() =>
              navigation.navigate('Orders' as any, {
                screen: 'OrderDetail',
                params: { orderId: item.id },
              })
            }
          />
        )}
        ListEmptyComponent={ListEmpty}
      />
    </View>
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

export default Dashboard;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  cardsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 12,
    marginHorizontal: 6,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    elevation: 1,
    alignItems: 'center',
  },
  cardLabel: { fontSize: 12, color: '#666' },
  cardValue: { fontSize: 16, fontWeight: '700', marginTop: 6 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  summaryText: { fontSize: 14 },
  link: { color: '#007AFF', fontSize: 14 },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },

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
  endView: { alignItems: 'flex-end' },
});
