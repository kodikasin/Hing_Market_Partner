import React, { useEffect, useState } from 'react';
import { Text, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView, SafeAreaView } from 'react-native';
import { useRealmStore } from '../../store/useRealmStore';
import { useNavigation } from '@react-navigation/native';

type AddressType = {
  street?: string;
  city?: string;
  pincode?: number;
  state?: string;
  country?: string;
};

export default function EditProfile() {
  const { company, updateCompany } = useRealmStore();
  const navigation = useNavigation<any>();

  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNo, setMobileNo] = useState('');
  const [address, setAddress] = useState<AddressType>({});
  const [gstNo, setGstNo] = useState('');

  useEffect(() => {
    if (company) {
      setCompanyName(company.companyName || '');
      setEmail(company.email || '');
      setMobileNo(company.mobileNo || '');
      
      // Parse address if it's a string (JSON), otherwise use as object
      try {
        const addr = typeof company.address === 'string' 
          ? JSON.parse(company.address)
          : (company.address || {});
        setAddress(addr);
      } catch {
        setAddress({});
      }
      
      setGstNo(company.gstNo || '');
    }
  }, [company]);

  function onSave() {
    if (!companyName.trim()) return Alert.alert('Please enter company name');
    if (!mobileNo.trim()) return Alert.alert('Please enter mobile number');

    updateCompany({
      companyName: companyName.trim(),
      email: email.trim(),
      mobileNo: mobileNo.trim(),
      address: JSON.stringify(address) as any,
      gstNo: gstNo.trim(),
    });

    Alert.alert('Saved', 'Company details updated');
    navigation.goBack();
  }

  const handleAddressChange = (field: keyof AddressType, value: any) => {
    setAddress(prev => ({
      ...prev,
      [field]: field === 'pincode' ? Number(value) : value,
    }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>Company name</Text>
        <TextInput
          style={styles.input}
          value={companyName}
          onChangeText={setCompanyName}
          placeholder="Company name"
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          keyboardType="email-address"
        />

        <Text style={styles.label}>Mobile number</Text>
        <TextInput
          style={styles.input}
          value={mobileNo}
          onChangeText={setMobileNo}
          placeholder="Mobile number"
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>Address - Street</Text>
        <TextInput
          style={styles.input}
          value={address.street || ''}
          onChangeText={(value) => handleAddressChange('street', value)}
          placeholder="Street"
        />

        <Text style={styles.label}>Address - City</Text>
        <TextInput
          style={styles.input}
          value={address.city || ''}
          onChangeText={(value) => handleAddressChange('city', value)}
          placeholder="City"
        />

        <Text style={styles.label}>Address - State</Text>
        <TextInput
          style={styles.input}
          value={address.state || ''}
          onChangeText={(value) => handleAddressChange('state', value)}
          placeholder="State"
        />

        <Text style={styles.label}>Address - Pincode</Text>
        <TextInput
          style={styles.input}
          value={String(address.pincode || '')}
          onChangeText={(value) => handleAddressChange('pincode', value)}
          placeholder="Pincode"
          keyboardType="numeric"
        />

        <Text style={styles.label}>GSTIN</Text>
        <TextInput
          style={styles.input}
          value={gstNo}
          onChangeText={setGstNo}
          placeholder="GST number"
        />

        <TouchableOpacity style={styles.saveBtn} onPress={onSave} activeOpacity={0.9}>
          <Text style={styles.saveBtnText}>SAVE</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4efe9' },
  content: { padding: 16, paddingBottom: 40 },
  label: { marginTop: 8, fontWeight: '600', color: '#3a241f' },
  input: {
    backgroundColor: '#f2f0ee',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#eee',
  },
  multiline: { minHeight: 80, textAlignVertical: 'top' },
  saveBtn: { backgroundColor: '#6e4337', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 12 },
  saveBtnText: { color: '#fff', fontWeight: '700' },
});
