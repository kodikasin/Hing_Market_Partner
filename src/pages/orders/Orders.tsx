import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import OrderList from './OrderList';

type RootStackParamList = {
  OrderDetail: { orderId: string };
}

const filters = ['All', 'Pending', 'Delivered', 'Unpaid'] as const;

export default function Orders() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  
  const [filter, setFilter] = useState<(typeof filters)[number]>('All');

  return (
    <View style={styles.container}>
      <View style={styles.filtersRow}>
        {filters.map(f => (
          <TouchableOpacity
            key={f}
            onPress={() => setFilter(f)}
            style={[styles.filterBtn, filter === f && styles.filterActive]}
          >
            <Text style={styles.filterText}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <OrderList filter={filter} />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddEditOrder' as any)}
      >
        <Text style={styles.floatingBtnText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}



const styles = StyleSheet.create({
  container: { flex: 1, padding: 12 },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 24,
    backgroundColor: '#007AFF',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filtersRow: { flexDirection: 'row', marginBottom: 8 },
  filterBtn: {
    padding: 8,
    marginRight: 8,
    borderRadius: 6,
    backgroundColor: '#f2f2f2',
  },
  filterActive: { backgroundColor: '#007AFF' },
  filterText: { color: '#000' },
  floatingBtnText:{ color: 'white', fontSize: 24 }
  
});
