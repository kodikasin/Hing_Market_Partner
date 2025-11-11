import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {
  addOrder,
  updateOrder,
  Order,
  OrderItem,
  selectOrders,
} from '../../store/orderSlice';
import Clipboard from '@react-native-clipboard/clipboard';
import { parseWhatsappOrder } from '../parseWhatsappOrder';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import Items from './Items';

export default function AddEditOrder() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const route = useRoute();
  const params: any = route.params;
  const orders = useSelector(selectOrders);

  const editing = params?.orderId
    ? orders.find((o: Order) => o.id === params.orderId)
    : null;

  const [customerName, setCustomerName] = useState(editing?.customerName ?? '');
  const [phone, setPhone] = useState(editing?.phone ?? '');
  const [address, setAddress] = useState(editing?.address ?? '');
  const [notes, setNotes] = useState(editing?.notes ?? '');
  const [items, setItems] = useState<OrderItem[]>(editing?.items ?? []);
  const [taxes, setTaxes] = useState(String(editing?.taxes ?? 0));
  const [discount, setDiscount] = useState(String(editing?.discount ?? 0));

  useEffect(() => {}, []);

  

  function computeTotals() {
    const subtotal = items.reduce((s, it) => s + (it.total || 0), 0);
    const taxPercent = parseFloat(taxes || '0');
    const taxAmount = subtotal * (taxPercent / 100);
    const disc = parseFloat(discount || '0');
    const finalTotal = Math.max(0, subtotal + taxAmount - disc);
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
    const payload: Omit<Order, 'id' | 'createdAt'> = {
      customerName: customerName.trim(),
      phone,
      address,
      // compute totals and remove any items with zero total
      items: items
        .map(i => ({ ...i, total: (Number(i.quantity) || 0) * (Number(i.rate) || 0) }))
        .filter(i => (i.total || 0) > 0),
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

    if (editing) {
      dispatch(updateOrder({ ...(editing as Order), ...payload } as any));
    } else {
      dispatch(addOrder(payload as any));
    }
    navigation.goBack();
  }

  // precompute totals for rendering
  const { subtotal, taxAmount, finalTotal } = computeTotals();
  const taxPercent = parseFloat(taxes || '0');

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1, padding: 12 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 8,
          }}
        >
          <Text style={styles.label}>Customer name</Text>
          <TouchableOpacity
            onPress={onPasteWhatsapp}
            style={{
              marginLeft: 'auto',
              backgroundColor: '#e0e0e0',
              padding: 6,
              borderRadius: 6,
            }}
          >
            <Text>Paste from WhatsApp</Text>
          </TouchableOpacity>
        </View>
        <TextInput
          style={styles.input}
          value={customerName}
          onChangeText={setCustomerName}
        />

        <Text style={styles.label}>Phone</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>Address</Text>
        <TextInput
          style={styles.input}
          value={address}
          onChangeText={setAddress}
        />
        <Items items={items} setItems={setItems} styles={styles} />

  <Text style={styles.label}>Tax (%)</Text>
        <TextInput
          style={styles.input}
          value={taxes}
          onChangeText={setTaxes}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Discount</Text>
        <TextInput
          style={styles.input}
          value={discount}
          onChangeText={setDiscount}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Notes</Text>
        <TextInput style={styles.input} value={notes} onChangeText={setNotes} />

        <View style={{ marginVertical: 12 }}>
          <Text>Items total: ₹{subtotal.toFixed(2)}</Text>
          <Text>Tax ({taxPercent.toFixed(2)}%): ₹{taxAmount.toFixed(2)}</Text>
          <Text style={{ fontWeight: '700' }}>Final total: ₹{finalTotal.toFixed(2)}</Text>
        </View>

        <Button title="Save" onPress={onSave} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { marginTop: 8, fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 8,
    borderRadius: 6,
    marginTop: 6,
  },
  itemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  itemInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#eee',
    padding: 6,
    borderRadius: 6,
    marginRight: 8,
  },
  smallInput: {
    width: 64,
    borderWidth: 1,
    borderColor: '#eee',
    padding: 6,
    borderRadius: 6,
    marginRight: 8,
  },
});
