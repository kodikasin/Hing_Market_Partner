import React, { useEffect, useState } from 'react';
import { Text, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView, SafeAreaView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { companyDetail, selectCompany, updateCompany } from '../../store/companySlice';
import { useNavigation } from '@react-navigation/native';

export default function EditProfile() {
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const company: companyDetail = useSelector(selectCompany);

  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNo, setMobileNo] = useState('');
  const [address, setAddress] = useState('');
  const [gstNo, setGstNo] = useState('');

  useEffect(() => {
    if (company) {
      setCompanyName(company.companyName || '');
      setEmail(company.email || '');
      setMobileNo(company.mobileNo || '');
      setAddress(company.address || '');
      setGstNo(company.gstNo || '');
    }
  }, [company]);

  function onSave() {
    if (!companyName.trim()) return Alert.alert('Please enter company name');
    if (!mobileNo.trim()) return Alert.alert('Please enter mobile number');

    dispatch(
      updateCompany({
        companyName: companyName.trim(),
        email: email.trim(),
        mobileNo: mobileNo.trim(),
        address: address.trim(),
        gstNo: gstNo.trim(),
      }) as any
    );

    Alert.alert('Saved', 'Company details updated');
    navigation.goBack();
  }

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

        <Text style={styles.label}>Address</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          value={address}
          onChangeText={setAddress}
          placeholder="Address"
          multiline
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
