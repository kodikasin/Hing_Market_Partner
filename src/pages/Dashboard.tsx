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
      contentContainerStyle={[styles.content, styles.listContent]}
      ListHeaderComponent={
        <DashboardHeader
          company={company}
          totalOrders={totalOrders}
          totalEarnings={totalEarnings}
          todayEarnings={todayEarnings}
          unpaidCount={unpaidCount}
          navigation={navigation}
        />
      }
      style={styles.container}
    />
  );
};

function OrderRow({ order, onPress }: { order: Order; onPress: () => void }) {
  const status = order.status.delivered ? 'Delivered' : order.status.paid ? 'Paid' : 'Pending'
  return (
    <TouchableOpacity style={styles.orderCard} onPress={onPress}>
      <View>
        <View style={styles.rowCenter}>
          <Text style={styles.name}>{order.customerName}</Text>
          <View style={[styles.statusPill, status === 'Pending' ? styles.pendingPill : styles.paidPill]}>
            <Text style={styles.pillText}>{status}</Text>
          </View>
        </View>
        <Text style={styles.small}>{order.phone || ''}</Text>
      </View>
      <View style={styles.endView}>
        <Text style={styles.total}>₹{order.totalAmount.toFixed(2)}</Text>
        <Text style={styles.chev}>{'>'}</Text>
      </View>
    </TouchableOpacity>
  );
}

function DashboardHeader({
  company,
  totalOrders,
  totalEarnings,
  todayEarnings,
  unpaidCount,
  navigation,
}: any) {
  return (
    <View>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{company?.companyName || 'Rs Hing'}</Text>
      </View>

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

      <View style={styles.unpaidCard}>
        <View style={styles.unpaidLeft}>
          <View style={styles.countCircle}>
            <Text style={styles.countText}>{unpaidCount}</Text>
          </View>
          <View style={styles.marginLeft12}>
            <Text style={styles.unpaidTitle}>Unpaid / Pending</Text>
            <Text style={styles.unpaidSubtitle}>{unpaidCount} orders pending</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.openBtn} onPress={() => navigation.navigate('Orders' as any)}>
          <Text style={styles.openBtnText}>Open</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.listHeader}>
        <Text style={styles.sectionTitle}>Recent Orders</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Orders' as any)}>
          <Text style={styles.seeAll}>See all</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default Dashboard;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4efe9' },
  content: { padding: 16 },
  listContent: { paddingBottom: 80 },
  marginLeft12: { marginLeft: 12 },
  rowCenter: { flexDirection: 'row', alignItems: 'center' },
  header: { paddingTop: 10, paddingBottom: 18 },
  headerSmall: { color: '#7a4f42', fontSize: 14 },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#3a241f', marginTop: 4 },
  cardsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 18,
    paddingHorizontal: 10,
    marginHorizontal: 6,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    elevation: 2,
    alignItems: 'center',
  },
  cardLabel: { fontSize: 12, color: '#8b6b60' },
  cardValue: { fontSize: 18, fontWeight: '700', marginTop: 6, color: '#3a241f' },
  unpaidCard: {
    backgroundColor: '#f7f1ed',
    marginTop: 8,
    padding: 14,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  unpaidLeft: { flexDirection: 'row', alignItems: 'center' },
  countCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#6e4337',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: { color: '#fff', fontWeight: '700' },
  unpaidTitle: { fontSize: 16, fontWeight: '700', color: '#3a241f' },
  unpaidSubtitle: { fontSize: 12, color: '#7a6258', marginTop: 4 },
  openBtn: {
    backgroundColor: '#6e4337',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  openBtnText: { color: '#fff', fontWeight: '700' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#3a241f' },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  seeAll: { color: '#7a6258' },

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
  name: { fontSize: 16, fontWeight: '700', color: '#3a241f' },
  small: { fontSize: 12, color: '#7a6258', marginTop: 6 },
  total: { fontWeight: '700', color: '#3a241f', fontSize: 14 },
  endView: { alignItems: 'flex-end', justifyContent: 'center' },
  chev: { color: '#b7a79f', fontSize: 18, marginTop: 6 },
  statusPill: { marginLeft: 8, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  pendingPill: { backgroundColor: '#eadfd9' },
  paidPill: { backgroundColor: '#dfe8df' },
  pillText: { fontSize: 12, color: '#5b4037', fontWeight: '700' },
});
