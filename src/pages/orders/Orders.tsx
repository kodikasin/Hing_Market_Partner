import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import OrderList from './OrderList';
import { useRealmStore } from '../../store/useRealmStore';
import { ordersAPI } from '../../services/api';

type RootStackParamList = {
  OrderDetail: { orderId: string };
}

const filters = ['All', 'Pending', 'Delivered', 'Unpaid'] as const;

export default function Orders() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  
  const [filter, setFilter] = useState<(typeof filters)[number]>('All');
  const { setOrders } = useRealmStore();

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await ordersAPI.getUserOrders({ page: 1, limit: 200 });
        const serverOrders = res?.data?.data || [];
        if (mounted) setOrders(Array.isArray(serverOrders) ? serverOrders : []);
      } catch (e) {
        console.warn('Failed to fetch user orders', e);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [setOrders]);

  return (
    <View style={styles.container}>
      {/* <View style={styles.header}>
        <Text style={styles.headerTitle}>Orders</Text>
      </View> */}

      <View style={styles.filtersRow}>
        {filters.map(f => (
          <TouchableOpacity
            key={f}
            onPress={() => setFilter(f)}
            style={[styles.filterBtn, filter === f && styles.filterActive]}
          >
            <Text style={[styles.filterText,filter===f && styles.activeFilterText]}>{f}</Text>
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
  container: { flex: 1, padding: 12, backgroundColor: '#f4efe9' },
  header: { paddingTop: 8, paddingBottom: 6 },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#3a241f' },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 24,
    backgroundColor: '#6e4337',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    elevation: 4,
  },
  filtersRow: { flexDirection: 'row', marginBottom: 12 },
  filterBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 10,
    borderRadius: 12,
    backgroundColor: '#ffffff',
  },
  filterActive: { backgroundColor: '#6e4337',

   },
  filterText: { color: '#7a6258', fontWeight: '600' },
  activeFilterText: { color: '#FFFFFF', fontWeight: '600' },
  filterTextActive: { color: '#fff' },
  floatingBtnText: { color: 'white', fontSize: 28 },
});
