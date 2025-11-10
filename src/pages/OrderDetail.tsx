import React from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Share,
  ScrollView,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RouteProp, useRoute } from '@react-navigation/native';
import { selectOrders, toggleStatus, Order } from '../store/orderSlice';

type Props = {
  route: RouteProp<any, any>;
};

export default function OrderDetail() {
  const route: any = useRoute();
  const { orderId } = route.params || {};
  const orders = useSelector(selectOrders);
  const dispatch = useDispatch();

  const order = orders.find((o: Order) => o.id === orderId) as
    | Order
    | undefined;
  if (!order)
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Order not found</Text>
      </View>
    );

  async function onShareInvoice() {
    // Simple textual invoice; for real PDF generation use a library (react-native-pdf, react-native-html-to-pdf, etc.)
    const lines = [] as string[];
    lines.push(`Invoice for ${order.customerName}`);
    lines.push(`Phone: ${order.phone || ''}`);
    lines.push('');
    order.items.forEach(it =>
      lines.push(`${it.name} x${it.quantity} @${it.rate} = ${it.total}`),
    );
    lines.push('');
    lines.push(`Taxes: ${order.taxes}`);
    lines.push(`Discount: ${order.discount}`);
    lines.push(`Total: ${order.totalAmount}`);

    try {
      await Share.share({ message: lines.join('\n') });
    } catch (e) {
      console.warn(e);
    }
  }

  function toggle(key: keyof Order['status']) {
    dispatch(toggleStatus({ id: order.id, statusKey: key } as any));
  }

  return (
    <ScrollView style={{ flex: 1, padding: 12 }}>
      <Text style={styles.title}>{order.customerName}</Text>
      <Text style={styles.small}>{order.phone}</Text>
      <Text style={styles.small}>{order.address}</Text>

      <Text style={{ marginTop: 12, fontWeight: '700' }}>Items</Text>
      <FlatList
        data={order.items}
        keyExtractor={it => it.id}
        renderItem={({ item }) => (
          <View style={styles.itemRow}>
            <Text>{item.name}</Text>
            <Text>₹{item.total.toFixed(2)}</Text>
          </View>
        )}
      />

      <View style={{ marginTop: 12 }}>
        <Text>Taxes: ₹{order.taxes}</Text>
        <Text>Discount: ₹{order.discount}</Text>
        <Text style={{ fontWeight: '700' }}>Total: ₹{order.totalAmount}</Text>
      </View>

      <View style={{ marginTop: 16 }}>
        <Text style={{ fontWeight: '700' }}>Status</Text>
        <View style={{ flexDirection: 'row', marginTop: 8 }}>
          <TouchableOpacity
            style={[
              styles.statusBtn,
              order.status.received && styles.statusActive,
            ]}
            onPress={() => toggle('received')}
          >
            <Text>✅ Received</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.statusBtn,
              order.status.couriered && styles.statusActive,
            ]}
            onPress={() => toggle('couriered')}
          >
            <Text>📦 Couriered</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.statusBtn,
              order.status.delivered && styles.statusActive,
            ]}
            onPress={() => toggle('delivered')}
          >
            <Text>🚚 Delivered</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.statusBtn, order.status.paid && styles.statusActive]}
            onPress={() => toggle('paid')}
          >
            <Text>💰 Paid</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ marginTop: 16 }}>
        <Text style={{ fontWeight: '700' }}>Timeline</Text>
        {order.timeline.map((t, i) => (
          <View
            key={i}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingVertical: 6,
            }}
          >
            <Text>{t.status}</Text>
            <Text style={{ color: '#666' }}>
              {new Date(t.timestamp).toLocaleString()}
            </Text>
          </View>
        ))}
      </View>

      <View style={{ marginTop: 16 }}>
        <Button title="Generate & Share Invoice" onPress={onShareInvoice} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 20, fontWeight: '700' },
  small: { color: '#666' },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  statusBtn: {
    padding: 8,
    borderRadius: 6,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  statusActive: { backgroundColor: '#dff0d8', borderColor: '#b2d8a7' },
});
