import React from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { OrderItem } from '../../store/realmSchemas';

type ItemsProps = {
  items: OrderItem[];
  setItems: React.Dispatch<React.SetStateAction<OrderItem[]>>;
  styles: any; // expecting styles object from parent AddEditOrder
};

const EmptyList = () => <Text>No items</Text>;

const Items = ({ items, setItems, styles }: ItemsProps) => {
  function addItem() {
    setItems(prev => [
      ...prev,
      {
        id: String(Math.random()),
        name: '',
        quantity: 100,
        unit: '',
        rate: 0,
        baseTotal: 0,
        tax: 5,
        total: 0,
      },
    ]);
  }

  function removeItem(idx: number) {
    setItems(prev => prev.filter((_, i) => i !== idx));
  }

  function updateItem(idx: number, key: keyof OrderItem, value: any) {
    console.log(idx, key, value);
    setItems(prev => {
      return prev.map((item, i) => {
        if (i !== idx) return item;

        // clone the item and apply the updated field
        const newItem: OrderItem = { ...(item as any), [key]: value } as OrderItem;

        const unit = Number(newItem.unit) || 0;
        const rate = Number(newItem.rate) || 0;
        const taxPercent = Number(newItem.tax) || 0;
        const base = unit * rate;
        const taxAmount = base * (taxPercent / 100);
        const total = base + taxAmount;

        return { ...newItem, baseTotal: base, total } as OrderItem;
      });
    });
  }

  return (
    <>
      <Text style={styles.label}>Items</Text>
      <FlatList
        data={items}
        keyExtractor={it => it.id}
        renderItem={({ item, index }) => (
          <View style={localStyles.card}>
            <View style={localStyles.fieldFull}>
              <Text style={localStyles.fieldLabel}>Product</Text>
              <TextInput
                placeholder="Product name"
                style={[styles.itemInput, localStyles.nameInput]}
                value={item.name}
                onChangeText={v => updateItem(index, 'name', v)}
                returnKeyType="done"
              />
            </View>

            <View style={localStyles.row}>
              <View style={[localStyles.fieldWrap, localStyles.fieldWrapQty]}>
                <Text style={localStyles.fieldLabel}>Weight (g)</Text>
                <TextInput
                  placeholder="0"
                  style={[styles.smallInput, localStyles.field]}
                  value={String(item.quantity)}
                  keyboardType="numeric"
                  onChangeText={v =>
                    updateItem(index, 'quantity', Number(v) || 0)
                  }
                />
              </View>

              <View style={[localStyles.fieldWrap, localStyles.fieldWrapUnit]}>
                <Text style={localStyles.fieldLabel}>Pcs</Text>
                <TextInput
                  placeholder="pcs"
                  style={[styles.smallInput, localStyles.fieldSmall]}
                  value={String(item.unit || '')}
                  onChangeText={v => updateItem(index, 'unit', v)}
                />
              </View>

              <View style={[localStyles.fieldWrap, localStyles.fieldWrapRate]}>
                <Text style={localStyles.fieldLabel}>Rate(Rs)</Text>
                <TextInput
                  placeholder="0.00"
                  style={[styles.smallInput, localStyles.field]}
                  value={String(item.rate)}
                  keyboardType="numeric"
                  onChangeText={v => updateItem(index, 'rate', Number(v) || 0)}
                />
              </View>
              <View style={{ marginRight: 12, paddingTop: 12 }}>
                <Text style={localStyles.totalText}>=</Text>
              </View>

              <View style={localStyles.totalBox}>
                <Text style={localStyles.totalText}>
                  ₹{(item.baseTotal || 0).toFixed(2)}
                </Text>
              </View>
               <View style={{ marginRight: 12, paddingTop: 12 }}>
              <Text style={localStyles.totalText}>with Tax</Text>
              </View>

              <View style={[localStyles.fieldWrap, localStyles.fieldWrapTax]}>
                <Text style={localStyles.fieldLabel}>Tax %</Text>
                <TextInput
                  placeholder="0"
                  style={[styles.smallInput, localStyles.fieldSmall]}
                  value={String(item.tax || 0)}
                  keyboardType="numeric"
                  onChangeText={v => updateItem(index, 'tax', Number(v) || 0)}
                />
              </View>

                 <View style={{ marginRight: 12, paddingTop: 12 }}>
                <Text style={localStyles.totalText}>=</Text>
              </View>

              <View style={localStyles.totalBox}>
                <Text style={localStyles.totalText}>
                  ₹{(item.total || 0).toFixed(2)}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => removeItem(index)}
                style={localStyles.deleteBtn}
                activeOpacity={0.7}
              >
                <Text style={localStyles.deleteBtnText}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={EmptyList}
      />
      <TouchableOpacity
        onPress={addItem}
        style={styles.addItemBtn}
        activeOpacity={0.9}
      >
        <Text style={styles.addItemBtnText}>ADD ITEM</Text>
      </TouchableOpacity>
    </>
  );
};

export default Items;

const localStyles = StyleSheet.create({
  priceText: { width: 64, textAlign: 'right' },
  card: {
    width: '100%',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  nameInput: { marginBottom: 6, flex: 1, minWidth: 120 },
  row: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  field: { width: 64, marginRight: 8, paddingHorizontal: 6 },
  fieldSmall: { width: 50, marginRight: 8, paddingHorizontal: 6 },
  totalBox: { minWidth: 80, marginRight: 8, paddingTop: 12 },
  totalText: { color: '#3a241f', fontWeight: '700' },
  baseText: { color: '#6b584f', fontSize: 12 },
  deleteBtn: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#f2bdbd',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    position:'absolute',
    right:8,
    bottom:8
  },
  deleteBtnText: { color: '#b00020', fontWeight: '600' },
  fieldFull: { width: '100%' },
  fieldLabel: { fontSize: 11, color: '#6b584f', marginBottom: 4 },
  fieldWrap: { alignItems: 'flex-start', marginRight: 8, marginBottom: 6 },
  fieldWrapQty: { width: 68 },
  fieldWrapUnit: { width: 68 },
  fieldWrapRate: { width: 84 },
  fieldWrapTax: { width: 68 },
});
