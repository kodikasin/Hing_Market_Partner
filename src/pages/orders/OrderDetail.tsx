import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';

import { useRealmStore } from '../../store/useRealmStore';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Order } from '../../store/realmSchemas';

import Menu from './Menu';

export default function OrderDetail() {
  const route: any = useRoute();
  const { orderId } = route.params || {};
  const { orders, toggleOrderStatus } = useRealmStore();
  const navigation: any = useNavigation();

  const order = orders.find((o: Order) => o._id === orderId);
  if (!order) {
    return (
      <View style={styles.emptyContainer}>
        <Text>Order not found</Text>
      </View>
    );
  }

  function toggle(key: keyof Order['status']) {
    toggleOrderStatus(order?._id || '', key);
  }

  return (
    <FlatList
      data={order.items}
      keyExtractor={it => it.id}
      renderItem={({ item }) => (
        <View style={styles.itemCard}>
          <View style={styles.itemRow}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemQuantity}>{item.quantity}g</Text>
          </View>
          <Text style={styles.itemPrice}>
            {item.total != null ? `₹${item.total.toFixed(2)}` : ''}
          </Text>
        </View>
      )}
      ListHeaderComponent={
        <OrderDetailHeader order={order} navigation={navigation} />
      }
      ListFooterComponent={
        <OrderDetailFooter order={order} toggle={toggle} />
      }
      contentContainerStyle={styles.content}
      style={styles.container}
    />
  );
}

function OrderDetailHeader({ order, navigation }: any) {
  return (
    <View>
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
    </View>
  );
}

function OrderDetailFooter({ order, toggle }: any) {
  // helper to determine allowed transitions
  function canToggle(key: keyof typeof order.status) {
    if (key === 'received') return true;
    if (key === 'couriered') return !!order.status.received;
    if (key === 'delivered') return !!order.status.couriered;
    if (key === 'paid') return !!order.status.delivered; // require delivered first
    return false;
  }

  function handleToggle(key: keyof typeof order.status) {
    if (!canToggle(key) && !order.status[key]) {
      Alert.alert('Hold on', 'Please mark previous status first.');
      return;
    }
    toggle(key);
  }

  function timeAgo(ts: string | number) {
    const diff = Date.now() - new Date(ts).getTime();
    const s = Math.floor(diff / 1000);
    if (s < 60) return `${s}s ago`;
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return new Date(ts).toLocaleString();
  }

  const statuses: Array<{ key: keyof typeof order.status; label: string; emoji: string }> = [
    { key: 'received', label: 'Received', emoji: '✅' },
    { key: 'couriered', label: 'Couriered', emoji: '📦' },
    { key: 'delivered', label: 'Delivered', emoji: '🚚' },
    { key: 'paid', label: 'Paid', emoji: '💰' },
  ];

  // render most recent first
  const timeline = Array.isArray(order.timeline) ? [...order.timeline].reverse() : [];

  return (
    <View>
      <View style={styles.totalsCard}>
        <View style={styles.totalsRow}>
          <Text style={styles.totalsLabel}>Discount:</Text>
          <Text style={styles.totalsValue}>- ₹{order.discount}</Text>
        </View>
        <View style={styles.totalsDivider} />
        <View style={styles.totalsRowMarginTop}>
          <Text style={[styles.totalsLabel, styles.finalLabel]}>Total:</Text>
          <Text style={[styles.totalsValue, styles.finalLabel]}>₹{order.totalAmount}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitleMargin6}>Status</Text>
      <View style={styles.statusRow}>
        {statuses.map(s => {
          const active = !!order.status[s.key];
          const allowed = canToggle(s.key);
          return (
            <TouchableOpacity
              key={String(s.key)}
              activeOpacity={0.8}
              onPress={() => handleToggle(s.key)}
              disabled={!allowed && !active}
              style={[
                styles.statusBtnModern,
                active ? styles.statusActiveModern : null,
                !allowed && !active ? styles.statusBtnDisabled : null,
              ]}
            >
              <Text style={active ? styles.statusEmojiActive : styles.statusEmoji}>{s.emoji}</Text>
              <Text style={[styles.statusTextModern, active ? styles.statusTextActive : styles.statusTextInactive]}>{s.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.sectionTitleMargin12}>Timeline</Text>
      <View style={styles.timelineContainer}>
        {timeline.map((t: any, i: number) => (
          <View key={i} style={styles.timelineRow}>
            <Text style={styles.timelineStatus}>{t.status}</Text>
            <Text style={styles.timelineTime}>{timeAgo(t.timestamp)}</Text>
          </View>
        ))}
      </View>
    </View>
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
  itemRow: { flexDirection: 'row', alignItems: 'center' },
  itemQuantity: { marginLeft: 8, color: '#7a6258' },
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
  statusTextActive: { color: '#FFF' },
  statusTextInactive: { color: '#5b4037' },
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
  statusBtnModern: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    marginRight: 10,
    marginBottom: 8,
    backgroundColor: '#eadfd9',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 78,
  },
  statusBtnDisabled: { opacity: 0.5, backgroundColor: '#f5f5f5' },
  statusActiveModern: { backgroundColor: '#2e86de' },
  statusEmoji: { fontSize: 18, marginBottom: 4 },
  statusEmojiActive: { fontSize: 18, marginBottom: 4, color: '#fff' },
  statusTextModern: { fontWeight: '700', fontSize: 13 },
});
