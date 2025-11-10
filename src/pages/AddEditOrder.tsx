import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  FlatList,
  Alert,
  ScrollView,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
  addOrder,
  updateOrder,
  Order,
  OrderItem,
  selectOrders,
} from '../store/orderSlice';
import { useNavigation, useRoute } from '@react-navigation/native';

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

  function addItem() {
    setItems(prev => [
      ...prev,
      { id: String(Math.random()), name: '', quantity: 1, rate: 0, total: 0 },
    ]);
  }

  function updateItem(idx: number, key: keyof OrderItem, value: any) {
    setItems(prev => {
      const copy = [...prev];
      (copy[idx] as any)[key] = value;
      copy[idx].total = copy[idx].quantity * copy[idx].rate;
      return copy;
    });
  }

  function computeTotal() {
    const subtotal = items.reduce((s, it) => s + (it.total || 0), 0);
    const tax = parseFloat(taxes || '0');
    const disc = parseFloat(discount || '0');
    return Math.max(0, subtotal + tax - disc);
  }

  function onSave() {
    if (!customerName.trim()) return Alert.alert('Please enter customer name');
    const payload: Omit<Order, 'id' | 'createdAt'> = {
      customerName: customerName.trim(),
      phone,
      address,
      items: items.map(i => ({ ...i, total: i.quantity * i.rate })),
      taxes: parseFloat(taxes || '0'),
      discount: parseFloat(discount || '0'),
      totalAmount: computeTotal(),
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

  return (
    <ScrollView style={{ flex: 1, padding: 12 }}>
      <Text style={styles.label}>Customer name</Text>
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

      <Text style={styles.label}>Items</Text>
      <FlatList
        data={items}
        keyExtractor={it => it.id}
        renderItem={({ item, index }) => (
          <View style={styles.itemRow}>
            <TextInput
              placeholder="Name"
              style={styles.itemInput}
              value={item.name}
              onChangeText={v => updateItem(index, 'name', v)}
            />
            <TextInput
              placeholder="Qty"
              style={styles.smallInput}
              value={String(item.quantity)}
              keyboardType="numeric"
              onChangeText={v => updateItem(index, 'quantity', Number(v) || 0)}
            />
            <TextInput
              placeholder="Rate"
              style={styles.smallInput}
              value={String(item.rate)}
              keyboardType="numeric"
              onChangeText={v => updateItem(index, 'rate', Number(v) || 0)}
            />
            <Text style={{ width: 64, textAlign: 'right' }}>
              ₹{(item.total || 0).toFixed(2)}
            </Text>
          </View>
        )}
        ListEmptyComponent={() => <Text>No items</Text>}
      />
      <Button title="Add item" onPress={addItem} />

      <Text style={styles.label}>Taxes</Text>
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
        <Text style={{ fontWeight: '700' }}>
          Total: ₹{computeTotal().toFixed(2)}
        </Text>
      </View>

      <Button title="Save" onPress={onSave} />
    </ScrollView>
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
