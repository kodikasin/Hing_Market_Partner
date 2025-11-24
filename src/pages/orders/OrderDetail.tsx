import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

import { useSelector, useDispatch } from 'react-redux';
import { useRoute, useNavigation } from '@react-navigation/native';
import { selectOrders, toggleStatus, Order } from '../../store/orderSlice';

import Menu from './Menu';

export default function OrderDetail() {
  const route: any = useRoute();
  const { orderId } = route.params || {};
  const orders = useSelector(selectOrders);
  const dispatch = useDispatch();
  const navigation: any = useNavigation();

  const order = orders.find((o: Order) => o.id === orderId);
  if (!order) {
    return (
      <View style={styles.emptyContainer}>
        <Text>Order not found</Text>
      </View>
    );
  }

  function toggle(key: keyof Order['status']) {
    dispatch(toggleStatus({ id: order?.id, statusKey: key } as any));
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{order.customerName}</Text>
        <Menu order={order} navigation={navigation} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardName}>{order.customerName}</Text>
        <Text style={styles.small}>{order.phone}</Text>
        <Text style={styles.smallAddress}>{order.address}</Text>
      </View>

      <Text style={styles.sectionTitle}>Items</Text>
      <View style={styles.itemsContainer}>
        <FlatList
          data={order.items}
          keyExtractor={it => it.id}
          renderItem={({ item }) => (
            <View style={styles.itemCard}>
              <View style={{ flexDirection: 'row', columnGap: 8 }}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.totalsLabel}>{item.quantity}g</Text>
              </View>
              {/* <Text style={styles.itemPrice}>
                ₹{item?.unit || ''} x ₹{item?.rate || ''}
              </Text> */}

              <Text style={styles.itemPrice}>
                {item.total != null ? `₹${item.total.toFixed(2)}` : ''}
              </Text>
            </View>
          )}
        />
      </View>

      <View style={styles.totalsCard}>
        {/* <View style={styles.totalsRow}>
          <Text style={styles.totalsLabel}>Taxes: {order.taxes}%</Text>
          <Text style={styles.totalsValue}>
            ₹{(order.totalAmount * (order.taxes / 100)).toFixed(2)}
          </Text>
        </View> */}
        <View style={styles.totalsRow}>
          <Text style={styles.totalsLabel}>Discount:</Text>
          <Text style={styles.totalsValue}>- ₹{order.discount}</Text>
        </View>
        <View style={styles.totalsDivider} />
        <View style={styles.totalsRowMarginTop}>
          <Text style={[styles.totalsLabel, styles.finalLabel]}>Total:</Text>
          <Text style={[styles.totalsValue, styles.finalLabel]}>
            ₹{order.totalAmount}
          </Text>
        </View>
      </View>

      <Text style={styles.sectionTitleMargin6}>Status</Text>
      <View style={styles.statusRow}>
        <TouchableOpacity
          style={[
            styles.statusBtn,
            order.status.received && styles.statusActive,
          ]}
          onPress={() => toggle('received')}
        >
          <Text
            style={[
              styles.statusText,
              { color: order.status.received ? '#FFF' : '#5b4037' },
            ]}
          >
            ✅ Received
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.statusBtn,
            order.status.couriered && styles.statusActive,
          ]}
          onPress={() => toggle('couriered')}
        >
          <Text
            style={[
              styles.statusText,
              { color: order.status.couriered ? '#FFF' : '#5b4037' },
            ]}
          >
            📦 Couriered
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.statusBtn,
            order.status.delivered && styles.statusActive,
          ]}
          onPress={() => toggle('delivered')}
        >
          <Text
            style={[
              styles.statusText,
              { color: order.status.delivered ? '#FFF' : '#5b4037' },
            ]}
          >
            🚚 Delivered
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.statusBtn, order.status.paid && styles.statusActive]}
          onPress={() => toggle('paid')}
        >
          <Text
            style={[
              styles.statusText,
              { color: order.status.paid ? '#FFF' : '#5b4037' },
            ]}
          >
            💰 Paid
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitleMargin12}>Timeline</Text>
      <View style={styles.timelineContainer}>
        {order.timeline.map((t, i) => (
          <View key={i} style={styles.timelineRow}>
            <Text style={styles.timelineStatus}>{t.status}</Text>
            <Text style={styles.timelineTime}>
              {new Date(t.timestamp).toLocaleString()}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4efe9' },
  content: { padding: 16, paddingBottom: 80 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: { fontSize: 20, fontWeight: '700', color: '#3a241f' },
  small: { color: '#7a6258' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f0e7e3',
  },
  cardName: { fontSize: 16, fontWeight: '700', color: '#3a241f' },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3a241f',
    marginBottom: 8,
  },
  itemsContainer: { marginBottom: 8 },
  itemCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#f0e7e3',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemName: { color: '#3a241f', fontWeight: '600' },
  itemPrice: { color: '#3a241f', fontWeight: '700' },
  totalsCard: {
    backgroundColor: '#fff6f4',
    padding: 12,
    borderRadius: 10,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  totalsLabel: { color: '#7a6258' },
  totalsValue: { color: '#3a241f', fontWeight: '700' },
  totalsDivider: { height: 1, backgroundColor: '#eee', marginVertical: 8 },
  finalLabel: { fontSize: 16 },
  statusRow: { flexDirection: 'row', marginTop: 8, flexWrap: 'wrap' },
  statusBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#eadfd9',
  },
  statusActive: { backgroundColor: '#6e4337' },
  statusText: { fontWeight: '700' },
  timelineContainer: { marginTop: 8, marginBottom: 20 },
  timelineRow: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#f0e7e3',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timelineStatus: { color: '#3a241f', fontWeight: '600' },
  timelineTime: { color: '#7a6258', fontSize: 12 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  smallAddress: { color: '#7a6258', marginTop: 8 },
  totalsRowMarginTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    marginTop: 8,
  },
  sectionTitleMargin6: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3a241f',
    marginBottom: 8,
    marginTop: 6,
  },
  sectionTitleMargin12: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3a241f',
    marginBottom: 8,
    marginTop: 12,
  },
});
