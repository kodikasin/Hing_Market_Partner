import React from 'react';
import { View, Text, FlatList, TextInput, Button, StyleSheet } from 'react-native';
import { OrderItem } from '../../store/orderSlice';

type ItemsProps = {
  items: OrderItem[];
  setItems: React.Dispatch<React.SetStateAction<OrderItem[]>>;
  styles: any; // expecting styles object from parent AddEditOrder
};

const EmptyList = () => <Text>No items</Text>;

const Items: React.FC<ItemsProps> = ({ items, setItems, styles }) => {
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
      copy[idx].total = (Number(copy[idx].quantity) || 0) * (Number(copy[idx].rate) || 0);
      return copy;
    });
  }

  return (
    <>
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
            <Text style={localStyles.priceText}>
              ₹{(item.total || 0).toFixed(2)}
            </Text>
          </View>
        )}
        ListEmptyComponent={EmptyList}
      />
      <Button title="Add item" onPress={addItem} />
    </>
  );
};

export default Items;

const localStyles = StyleSheet.create({
  priceText: { width: 64, textAlign: 'right' },
});
