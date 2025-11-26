import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Linking,
  Alert,
} from 'react-native';
import { useRealmStore } from '../../store/useRealmStore';
import { useAuthAPI } from '../../services/hooks';
import { getUserData } from '../../services/authStorage';
// import { companyDetail } from '../../store/realmSchemas';
import { useNavigation } from '@react-navigation/native';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';

const ListRow: React.FC<{
  title: string;
  subtitle?: string;
  onPress?: () => void;
}> = ({ title, subtitle, onPress }) => {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <View>
        <Text style={styles.rowTitle}>{title}</Text>
        {subtitle ? <Text style={styles.rowSubtitle}>{subtitle}</Text> : null}
      </View>
      <Text style={styles.chev}>{'>'}</Text>
    </TouchableOpacity>
  );
};

export default function Profile() {
  const [termsVisible, setTermsVisible] = useState(false);
  const [aboutVisible, setAboutVisible] = useState(false);
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const { company } = useRealmStore();
  const navigation = useNavigation<any>();
  const { getProfile, logout } = useAuthAPI();

  const openEmail = () => {
    const to = 'ceo@kodikas.in';
    const subject = encodeURIComponent('Help with Hing Market Partner app');
    const body = encodeURIComponent('Describe your issue here');
    const url = `mailto:${to}?subject=${subject}&body=${body}`;
    Linking.canOpenURL(url)
      .then(supported => {
        if (supported) Linking.openURL(url);
        else Alert.alert('No email client configured');
      })
      .catch(() => Alert.alert('Could not open mail app'));
  };

  const handleRate = () => {
    const url = 'https://example.com/rate'; // replace with app store link
    Linking.openURL(url).catch(() => Alert.alert('Unable to open link'));
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // try to fetch latest profile from server
        const user = await getProfile();
        if (mounted) setUserProfile(user);
      } catch {
        // fallback to locally stored user
        const local = await getUserData();
        if (mounted) setUserProfile(local);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [getProfile]);

  

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.userCard, styles.userCardRow]}>
          <View>
            <Text style={styles.userSmall}>Company details</Text>
            <Text style={styles.userEmail}>{company?.companyName}</Text>
            {userProfile?.email ? <Text style={styles.userEmailSub}>{userProfile.email}</Text> : null}
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('EditProfile')}
            style={styles.editBtn}
            accessibilityLabel="Edit company details"
          >
           <MaterialDesignIcons name="square-edit-outline" color={"#6e4337"} size={32} />
          </TouchableOpacity>
        </View>

        {/* Profile is read-only; tap edit icon to open edit screen */}

        <ListRow
          title="Terms & Conditions"
          subtitle="View app terms"
          onPress={() => setTermsVisible(true)}
        />

        <ListRow
          title="App Info"
          subtitle="Version & legal"
          onPress={() => setAboutVisible(true)}
        />

        <ListRow
          title="Contact / Help"
          subtitle="Email support"
          onPress={openEmail}
        />

        <ListRow
          title="Rate this app"
          subtitle="Share feedback"
          onPress={handleRate}
        />

        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={async () => {
            try {
              await logout();
            } catch (e) {
              console.warn('Logout error', e);
            }
            navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
          }}
        >
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={termsVisible}
        animationType="slide"
        onRequestClose={() => setTermsVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Terms & Conditions</Text>
            <TouchableOpacity onPress={() => setTermsVisible(false)}>
              <Text style={styles.closeBtn}>Close</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalBody}>
            <Text style={styles.paragraph}>
              These are the Terms & Conditions. Replace this text with your
              app's actual terms and privacy details. Keep them concise and
              readable.
            </Text>
            <Text style={styles.paragraph}>1. Use of the app...</Text>
            <Text style={styles.paragraph}>2. Liability...</Text>
            <Text style={styles.paragraph}>3. Governing law...</Text>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      <Modal
        visible={aboutVisible}
        animationType="slide"
        onRequestClose={() => setAboutVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>App Info</Text>
            <TouchableOpacity onPress={() => setAboutVisible(false)}>
              <Text style={styles.closeBtn}>Close</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalBody}>
            <Text style={styles.paragraph}>Hing Market Partner</Text>
            <Text style={styles.paragraph}>Version: 1.0.0</Text>
            <Text style={styles.paragraph}>Built by: Kodikas</Text>
            <Text style={styles.paragraph}>
              For more info visit: https://example.com
            </Text>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4efe9' },
  pageHeader: { paddingTop: 10, paddingBottom: 6, paddingHorizontal: 16 },
  pageTitle: { fontSize: 22, fontWeight: '700', color: '#3a241f' },
  content: { padding: 16, paddingBottom: 40 },
  userCard: { backgroundColor: '#f5eee9', borderRadius: 12, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: '#efe6e2' },
  userSmall: { color: '#7a6258', marginBottom: 8 },
  userEmail: { fontSize: 16, fontWeight: '700', color: '#3a241f' },
  row: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f0e7e3',
    marginBottom: 12,
  },
  rowTitle: { fontSize: 16, color: '#3a241f' },
  rowSubtitle: { color: '#7a6258', marginTop: 4, fontSize: 12 },
  chev: { color: '#b7a79f', fontSize: 18 },
  modalContainer: { flex: 1, backgroundColor: '#fff' },
  modalHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: { fontSize: 18, fontWeight: '600' },
  closeBtn: { color: '#007AFF' },
  modalBody: { padding: 16 },
  paragraph: { marginBottom: 12, lineHeight: 20, color: '#333' },
  logoutBtn: { backgroundColor: '#6e4337', paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginTop: 12 },
  logoutText: { color: '#fff', fontWeight: '700' },
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
  spacer12: { height: 12 },
  userCardRow: { flexDirection: 'row', alignItems: 'center' },
  editBtn: {alignSelf:'flex-end',marginLeft:12},
  editIcon: { fontSize: 18, color: '#6e4337' },
  userEmailSub: { color: '#7a6258', marginTop: 4 },
});
