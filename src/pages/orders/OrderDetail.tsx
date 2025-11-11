import React from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { generatePDF } from 'react-native-html-to-pdf';
import { useSelector, useDispatch } from 'react-redux';
import { RouteProp, useRoute } from '@react-navigation/native';
import { selectOrders, toggleStatus, Order } from '../../store/orderSlice';
import Share from 'react-native-share';
import RNFS from 'react-native-fs';


type Props = {
  route: RouteProp<any, any>;
};

export default function OrderDetail() {
  const route: any = useRoute();
  const { orderId } = route.params || {};
  const orders = useSelector(selectOrders);
  const dispatch = useDispatch();

  const order = orders.find((o: Order) => o.id === orderId);
  if (!order) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Order not found</Text>
      </View>
    );
  }

  async function onShareInvoice() {
    // Simple textual invoice
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

  async function onSharePDF() {
    // Generate HTML for invoice
    const html = `
      <h2>Invoice</h2>
      <p><b>Customer:</b> ${order.customerName}<br/>
      <b>Phone:</b> ${order.phone || ''}<br/>
      <b>Address:</b> ${order.address || ''}</p>
      <table border="1" cellspacing="0" cellpadding="4" style="width:100%;border-collapse:collapse;">
        <tr><th>Item</th><th>Qty</th><th>Rate</th><th>Total</th></tr>
        ${order.items
          .map(
            it =>
              `<tr><td>${it.name}</td><td>${it.quantity}</td><td>${it.rate}</td><td>${it.total}</td></tr>`,
          )
          .join('')}
      </table>
      <p>Taxes: ₹${order.taxes}<br/>Discount: ₹${
      order.discount
    }<br/><b>Total: ₹${order.totalAmount}</b></p>
      <p>Notes: ${order.notes || ''}</p>
    `;
    try {
      const file = await generatePDF({
        html,
        fileName: `Invoice_${order.customerName}_${order.id}`,
        base64: false,
      });
      const path = file.filePath; // e.g. /data/user/0/.../cache/Invoice_...pdf
      console.log('pdf path:', path);

      // sanity check: file exists
      const exists = await RNFS.exists(path);
      if (!exists) throw new Error('PDF file not found at: ' + path);

      // react-native-share works with file:// URIs on Android and direct path on iOS
      const url = Platform.OS === 'android' ? `file://${path}` : path;

      const shareOptions = {
        url,
        type: 'application/pdf',
        filename: `Invoice_${order.customerName}_${order.id}`, // optional
        subject: `Invoice for ${order.customerName}`, // for email
        message: `Invoice for ${order.customerName}`, // some apps use message
      };

      await Share.open(shareOptions);
    } catch (err) {
      console.warn('PDF share error', err);
      // show user friendly message if needed
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
        <Text>Taxes: {order.taxes} % </Text>
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
        <Button title="Share Text Invoice" onPress={onShareInvoice} />
        <View style={{ height: 8 }} />
        <Button title="Generate & Share PDF" onPress={onSharePDF} />
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
