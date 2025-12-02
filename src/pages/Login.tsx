import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useAuthAPI } from '../services/hooks';
// navigation props handled generically by navigator
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Login(props: any) {
  const { navigation } = props;
  const [email, setEmail] = useState('rohan@gmail.com');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);

  const { login, loading, error } = useAuthAPI();

  const handleLogin = useCallback(async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }

    if (!password.trim()) {
      Alert.alert('Error', 'Please enter your password');
      return;
    }

    try {
      await login(email.trim(), password);
      // Navigate to Main app after successful login
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    } catch (err) {
      // Error is already handled by useAuthAPI hook
      console.warn('Login error:', err);
    }
  }, [email, password, login, navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.headerSection}>
            <Text style={styles.appTitle}>Hing Market Partner</Text>
            <Text style={styles.subtitle}>Login to your account</Text>
          </View>

          {/* Form */}
          <View style={styles.formSection}>
            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor="#b7a79f"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                editable={!loading}
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Enter your password"
                  placeholderTextColor="#b7a79f"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  editable={!loading}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  <Text style={styles.eyeIcon}>
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Error Message */}
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>❌ {error}</Text>
              </View>
            )}

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.loginBtnText}>Login</Text>
              )}
            </TouchableOpacity>

            {/* Register Link */}
            <View style={styles.registerSection}>
              <Text style={styles.registerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')} disabled={loading}>
                <Text style={[styles.registerLink, loading && styles.disabledLink]}>
                  Register here
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Demo Text */}
          <View style={styles.demoSection}>
            <Text style={styles.demoText}>Demo Credentials:</Text>
            <Text style={styles.demoValue}>📧 rohan@gmail.com</Text>
            <Text style={styles.demoValue}>🔐 123456</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4efe9',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
    justifyContent: 'space-between',
  },
  headerSection: {
    marginBottom: 40,
    marginTop: 20,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#3a241f',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#7a6258',
  },
  formSection: {
    marginBottom: 30,
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3a241f',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#3a241f',
    borderWidth: 1,
    borderColor: '#efe6e2',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#efe6e2',
    paddingHorizontal: 14,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: '#3a241f',
  },
  eyeIcon: {
    fontSize: 18,
    marginLeft: 8,
  },
  errorContainer: {
    backgroundColor: '#fadbd8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 18,
    borderLeftWidth: 4,
    borderLeftColor: '#e74c3c',
  },
  errorText: {
    fontSize: 13,
    color: '#c0392b',
    fontWeight: '500',
  },
  loginBtn: {
    backgroundColor: '#6e4337',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#6e4337',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  loginBtnDisabled: {
    opacity: 0.6,
  },
  loginBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  registerSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  registerText: {
    color: '#7a6258',
    fontSize: 13,
  },
  registerLink: {
    color: '#6e4337',
    fontSize: 13,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  disabledLink: {
    opacity: 0.5,
  },
  demoSection: {
    backgroundColor: '#fff3e0',
    borderRadius: 10,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#ff9800',
    marginTop: 20,
  },
  demoText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#e65100',
    marginBottom: 6,
  },
  demoValue: {
    fontSize: 12,
    color: '#bf360c',
    marginBottom: 4,
  },
});
