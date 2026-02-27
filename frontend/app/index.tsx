import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Keyboard,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, FontSizes } from '../constants/Theme';
import { SafeAreaView } from 'react-native-safe-area-context';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function LoginScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isTablet = width >= 768;
  const formMaxWidth = isTablet ? 420 : width;
  const topHeight = Math.min(height * 0.32, 280);
  const logoSize = isTablet ? 80 : Math.min(70, width * 0.18);
  const titleSize = isTablet ? 38 : Math.min(36, width * 0.09);

  const handleLogin = async () => {
    Keyboard.dismiss();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Please enter username and password');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password: password.trim() }),
      });

      if (res.ok) {
        router.replace('/(main)/dashboard');
      } else {
        const data = await res.json();
        setError(data.detail || 'Invalid credentials');
      }
    } catch (e) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex1}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          bounces={false}
          showsVerticalScrollIndicator={false}
        >
          {/* Top decorative section */}
          <View style={[styles.topSection, { height: topHeight }]}>
            <View style={styles.circleDecor1} />
            <View style={styles.circleDecor2} />
            <View style={styles.circleDecor3} />
            <View style={styles.logoContainer}>
              <View style={[styles.logoCircle, { width: logoSize, height: logoSize, borderRadius: logoSize / 2 }]}>
                <Ionicons name="school" size={logoSize * 0.5} color={Colors.surface} />
              </View>
              <Text style={[styles.appTitle, { fontSize: titleSize }]}>WHE</Text>
              <Text style={styles.appSubtitle}>Win Help Education</Text>
            </View>
          </View>

          {/* Login form */}
          <View style={styles.formCard}>
            <View style={[styles.formInner, { maxWidth: formMaxWidth }]}>
              <Text style={styles.welcomeText}>Welcome Back!</Text>
              <Text style={styles.loginSubtext}>Sign in to continue learning</Text>

              {error ? (
                <View style={styles.errorBox} testID="login-error">
                  <Ionicons name="alert-circle" size={18} color={Colors.error} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <View style={styles.inputContainer}>
                <View style={styles.inputIconBox}>
                  <Ionicons name="person-outline" size={20} color={Colors.primaryLight} />
                </View>
                <TextInput
                  testID="username-input"
                  style={styles.input}
                  placeholder="Username"
                  placeholderTextColor={Colors.textLight}
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.inputContainer}>
                <View style={styles.inputIconBox}>
                  <Ionicons name="lock-closed-outline" size={20} color={Colors.primaryLight} />
                </View>
                <TextInput
                  testID="password-input"
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor={Colors.textLight}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  testID="toggle-password-btn"
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeBtn}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={22}
                    color={Colors.textLight}
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                testID="login-btn"
                style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color={Colors.surface} size="small" />
                ) : (
                  <Text style={styles.loginBtnText}>Login</Text>
                )}
              </TouchableOpacity>

              <View style={styles.footerInfo}>
                <Ionicons name="information-circle-outline" size={16} color={Colors.textLight} />
                <Text style={styles.footerText}>
                  Exam preparation for JVN, CET, PSE, NMMS, GSSE, TST
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  flex1: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  topSection: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  circleDecor1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.08)',
    top: -40,
    right: -40,
  },
  circleDecor2: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.06)',
    bottom: 20,
    left: -50,
  },
  circleDecor3: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.04)',
    top: 40,
    left: 60,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoCircle: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.m,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  appTitle: {
    fontWeight: '800',
    color: Colors.surface,
    letterSpacing: 4,
  },
  appSubtitle: {
    fontSize: FontSizes.s,
    color: 'rgba(255,255,255,0.8)',
    marginTop: Spacing.xs,
    letterSpacing: 1,
  },
  formCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xxl,
    alignItems: 'center',
  },
  formInner: {
    width: '100%',
  },
  welcomeText: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  loginSubtext: {
    fontSize: FontSizes.m,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: BorderRadius.m,
    padding: Spacing.m,
    marginBottom: Spacing.l,
    borderLeftWidth: 3,
    borderLeftColor: Colors.error,
  },
  errorText: {
    color: Colors.error,
    fontSize: FontSizes.s,
    marginLeft: Spacing.s,
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.l,
    paddingHorizontal: Spacing.m,
    height: 56,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.m,
  },
  input: {
    flex: 1,
    fontSize: FontSizes.m,
    color: Colors.textPrimary,
    height: '100%',
  },
  eyeBtn: {
    padding: Spacing.s,
  },
  loginBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.xl,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.s,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  loginBtnDisabled: {
    opacity: 0.7,
  },
  loginBtnText: {
    color: Colors.surface,
    fontSize: FontSizes.l,
    fontWeight: '700',
    letterSpacing: 1,
  },
  footerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xxl,
  },
  footerText: {
    fontSize: FontSizes.xs,
    color: Colors.textLight,
    marginLeft: Spacing.xs,
    textAlign: 'center',
  },
});
