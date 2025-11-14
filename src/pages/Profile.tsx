import React, { useState } from 'react';
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
import { useNavigation } from '@react-navigation/native';

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
  const navigation = useNavigation<any>();
  const [termsVisible, setTermsVisible] = useState(false);
  const [aboutVisible, setAboutVisible] = useState(false);

  const openEmail = () => {
    const to = 'ceo@kodikas.in';
    const subject = encodeURIComponent('Help with Hing Market Partner app');
    const body = encodeURIComponent('Describe your issue here');
    const url = `mailto:${to}?subject=${subject}&body=${body}`;
    Linking.canOpenURL(url)
      .then(supported => {
        console.log('supported', supported);
        if (supported) Linking.openURL(url);
        else Alert.alert('No email client configured');
      })
      .catch(() => Alert.alert('Could not open mail app'));
  };

  const handleRate = () => {
    const url = 'https://example.com/rate'; // replace with app store link
    Linking.openURL(url).catch(() => Alert.alert('Unable to open link'));
  };

  // const handleLogout = () => {
  //   Alert.alert('Logout', 'Are you sure you want to logout?', [
  //     { text: 'Cancel', style: 'cancel' },
  //     {
  //       text: 'Logout',
  //       style: 'destructive',
  //       onPress: () => {
  //         // If your app has auth state, clear it here. For now just navigate home.
  //         navigation.navigate('Home')
  //       },
  //     },
  //   ])
  // }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.name}>Partner Name</Text>
        <Text style={styles.sub}>partner@example.com</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
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

        {/* <ListRow title="Logout" subtitle="Sign out of your account" onPress={handleLogout} /> */}
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
  container: { flex: 1, backgroundColor: '#fff' },
  header: { padding: 20, borderBottomWidth: 1, borderColor: '#eee' },
  name: { fontSize: 20, fontWeight: '600' },
  sub: { color: '#666', marginTop: 4 },
  content: { paddingVertical: 10 },
  row: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#f1f1f1',
    backgroundColor: '#fff',
  },
  rowTitle: { fontSize: 16 },
  rowSubtitle: { color: '#888', marginTop: 4, fontSize: 12 },
  chev: { color: '#bbb', fontSize: 18 },
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
});
