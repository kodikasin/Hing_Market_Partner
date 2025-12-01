import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {
  Order,
  OrderItem,
} from '../../store/realmSchemas';
import Clipboard from '@react-native-clipboard/clipboard';
import { parseWhatsappOrder } from '../parseWhatsappOrder';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useRealmStore } from '../../store/useRealmStore';
import { ordersAPI } from '../../services/api';
import Items from './Items';

export default function AddEditOrder() {
  const { orders, setOrders } = useRealmStore();
  const navigation = useNavigation();
  const route = useRoute();
  const params: any = route.params;
  const [editing, setEditing] = useState<Order | null>(() =>
    params?.orderId ? (orders.find((o: Order) => o._id === params.orderId) || null) : null
  );

  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<OrderItem[]>([]);
  const [taxes, setTaxes] = useState('0');
  const [discount, setDiscount] = useState('0');

  useEffect(() => {
    let mounted = true;
    async function loadOrder() {
      if (params?.orderId && !editing) {
        try {
          const res = await ordersAPI.getOrderById(params.orderId);
          const serverOrder = res?.data?.order || res?.data;
          if (serverOrder && mounted) {
            setEditing(serverOrder as any);
          }
        } catch (e) {
          console.warn('Failed to fetch order by id', e);
        }
      }
    }
    loadOrder();
    return () => {
      mounted = false;
    };
  }, [params?.orderId, editing]);

  

  useEffect(() => {
    if (editing) {
      setCustomerName(editing.customerName ?? '');
      setPhone(editing.phone ?? '');
      setAddress(editing.address ?? '');
      setNotes(editing.notes ?? '');
      setItems(editing.items ?? []);
      setTaxes(String(editing.taxes ?? 0));
      setDiscount(String(editing.discount ?? 0));
    }
  }, [editing]);

  function computeTotals() {
    const subtotal = items.reduce((s, it) => s + (it.total || 0), 0);
    const taxPercent = parseFloat(taxes || '0');
    const taxAmount = subtotal * (taxPercent / 100);
    const disc = parseFloat(discount || '0');
    const finalTotal = Math.max(0, subtotal - disc);
    return { subtotal, taxAmount, finalTotal };
  }

  async function onPasteWhatsapp() {
    const text = await Clipboard.getString();
    if (!text) return Alert.alert('Clipboard is empty');
    const parsed = parseWhatsappOrder(text);
    setCustomerName(parsed.customerName);
    setPhone(parsed.phone);
    setAddress(parsed.address);
    setNotes(parsed.notes);
    setTaxes(String(parsed.taxes));
    setDiscount(String(parsed.discount));
    setItems(parsed.items);
  }

  function onSave() {
    if (!customerName.trim()) return Alert.alert('Please enter customer name');
    const payload: any = {
      customerName: customerName.trim(),
      phone,
      address,
      items: items.filter(i => (i.total || 0) > 0).map(i => ({
        id: i.id || '',
        name: i.name,
        quantity: i.quantity,
        unit: i.unit,
        rate: i.rate,
        total: i.total,
      })),
      taxes: parseFloat(taxes || '0'),
      discount: parseFloat(discount || '0'),
      totalAmount: computeTotals().finalTotal,
      notes,
      status: editing?.status ?? {
        received: true,
        couriered: false,
        delivered: false,
        paid: false,
      },
      timeline: editing?.timeline ?? [],
    };

    (async () => {
      try {
        if (editing && (editing as any)._id) {
          await ordersAPI.updateOrder((editing as any)._id, payload);
        } else {
          await ordersAPI.createOrder(payload);
        }
        // refresh from server and sync to realm
        const res = await ordersAPI.getUserOrders({ page: 1, limit: 200 });
        const serverOrders = res?.data?.data || [];
        setOrders(Array.isArray(serverOrders) ? serverOrders : []);
        navigation.goBack();
      } catch (e) {
        console.warn('Failed to save order', e);
        Alert.alert('Failed to save order');
      }
    })();
  }

  // precompute totals for rendering
  const {
    // subtotal, taxAmount,
    finalTotal,
  } = computeTotals();
  // const taxPercent = parseFloat(taxes || '0');

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.rowBetween}>
          <Text style={styles.label}>Customer name</Text>
          <TouchableOpacity onPress={onPasteWhatsapp} style={styles.pasteBtn}>
            <Text style={styles.pasteBtnText}>Paste from WhatsApp</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.input}
          value={customerName}
          onChangeText={setCustomerName}
          placeholder="Name"
        />

        <Text style={styles.label}>Phone</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          placeholder="Mobile number"
        />

        <Text style={styles.label}>Address</Text>
        <TextInput
          style={styles.input}
          value={address}
          onChangeText={setAddress}
          placeholder="Address"
        />

        <Items items={items} setItems={setItems} styles={styles} />

        {/* <Text style={styles.label}>Tax (%)</Text>
        <TextInput
          style={styles.input}
          value={taxes}
          onChangeText={setTaxes}
          keyboardType="numeric"
        /> */}

        <Text style={styles.label}>Discount</Text>
        <TextInput
          style={styles.input}
          value={discount}
          onChangeText={setDiscount}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Notes</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={4}
          placeholder="Notes"
        />

        <View style={styles.totalsCard}>
          {/* <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Items total:</Text>
            <Text style={styles.totalsValue}>₹{subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Tax ({taxPercent.toFixed(2)}%):</Text>
            <Text style={styles.totalsValue}>₹{taxAmount.toFixed(2)}</Text>
          </View> */}
          <View style={[styles.totalsRow, styles.totalsDivider]}>
            <Text style={[styles.totalsLabel, styles.finalLabel]}>
              Final total:
            </Text>
            <Text style={[styles.totalsValue, styles.finalLabel]}>
              ₹{finalTotal.toFixed(2)}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.saveBtn}
          onPress={onSave}
          activeOpacity={0.9}
        >
          <Text style={styles.saveBtnText}>SAVE</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4efe9' },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 80 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  label: { marginTop: 8, fontWeight: '600', color: '#3a241f' },
  pasteBtn: {
    marginLeft: 'auto',
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  pasteBtnText: { color: '#5b4037', fontWeight: '700' },
  input: {
    backgroundColor: '#f2f0ee',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#eee',
  },
  multiline: { minHeight: 100, textAlignVertical: 'top' },
  itemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  itemInput: {
    flex: 1,
    backgroundColor: '#f7f5f4',
    borderWidth: 1,
    borderColor: '#eee',
    padding: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  smallInput: {
    width: 64,
    backgroundColor: '#f7f5f4',
    borderWidth: 1,
    borderColor: '#eee',
    padding: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  addItemBtn: {
    backgroundColor: '#6e4337',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
    alignItems: 'center',
  },
  addItemBtnText: { color: '#fff', fontWeight: '700' },
  totalsCard: {
    backgroundColor: '#fff6f4',
    padding: 12,
    borderRadius: 10,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  totalsLabel: { color: '#5b4037' },
  totalsValue: { color: '#3a241f', fontWeight: '700' },
  totalsDivider: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    marginTop: 6,
    paddingTop: 8,
  },
  finalLabel: { fontSize: 16 },
  saveBtn: {
    backgroundColor: '#6e4337',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  saveBtnText: { color: '#fff', fontWeight: '700' },
});
