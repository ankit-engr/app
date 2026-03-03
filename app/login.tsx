import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, ArrowRight, Zap, Mail } from 'lucide-react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import Constants from 'expo-constants';
import { useAppState } from '@/contexts/AppStateContext';
import { useToast } from '@/contexts/ToastContext';
import { googleLogin, sendEmailOTP } from '@/lib/api';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { login } = useAppState();
  const { showToast } = useToast();
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [email, setEmail] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isEmailLoading, setIsEmailLoading] = useState(false);

  const googleWebClientId =
    process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;
  const googleAndroidClientId =
    process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || googleWebClientId;
  const googleIosClientId =
    process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || googleWebClientId;
  const isExpoGo = Constants.executionEnvironment === 'storeClient';
  const toGoogleNativeScheme = (clientId?: string) => {
    if (!clientId) return null;
    return clientId.endsWith('.apps.googleusercontent.com')
      ? `com.googleusercontent.apps.${clientId.replace('.apps.googleusercontent.com', '')}`
      : null;
  };
  const iosGoogleScheme = toGoogleNativeScheme(googleIosClientId);
  const androidGoogleScheme = toGoogleNativeScheme(googleAndroidClientId);
  const nativeRedirect =
    Platform.OS === 'ios'
      ? `${iosGoogleScheme ?? 'myapp'}:/oauthredirect`
      : `${androidGoogleScheme ?? 'myapp'}:/oauthredirect`;

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest(
    {
      webClientId: googleWebClientId,
      androidClientId: googleAndroidClientId,
      iosClientId: googleIosClientId,
    },
    {
      native: nativeRedirect,
    }
  );

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const handleSendOtp = async () => {
    if (!isValidEmail || isEmailLoading) return;

    setIsEmailLoading(true);
    try {
      const data = await sendEmailOTP(email.trim());
      router.push({
        pathname: '/verify-email',
        params: {
          email: email.trim(),
          tempToken: data.tempToken
        }
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send OTP. Please try again.';
      showToast({
        title: 'Error',
        message,
        type: 'error',
      });
    } finally {
      setIsEmailLoading(false);
    }
  };

  useEffect(() => {
    const loginWithGoogleToken = async () => {
      if (!response) return;

      if (response.type !== 'success') {
        if (response.type !== 'dismiss' && response.type !== 'cancel') {
          showToast({
            title: 'Google login failed',
            message: 'Please try again.',
            type: 'error',
          });
        }
        return;
      }

      const idToken = response.params?.id_token;
      if (!idToken) {
        showToast({
          title: 'Google login failed',
          message: 'No token received from Google.',
          type: 'error',
        });
        return;
      }

      setIsGoogleLoading(true);
      try {
        const auth = await googleLogin({ credential: idToken });
        await login(auth.user.email);
        showToast({
          title: 'Logged in',
          message: 'Welcome back to DealRush.',
          type: 'success',
        });
        router.replace('/(tabs)');
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Please try again.';
        showToast({
          title: 'Google login failed',
          message,
          type: 'error',
        });
      } finally {
        setIsGoogleLoading(false);
      }
    };

    void loginWithGoogleToken();
  }, [login, response, router, showToast]);

  const handleGoogleLogin = async () => {
    if (!googleWebClientId) {
      showToast({
        title: 'Google config missing',
        message: 'Set EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID in app environment.',
        type: 'error',
      });
      return;
    }

    if (isExpoGo) {
      showToast({
        title: 'Use dev build for Google login',
        message: 'Google blocks Expo Go redirect URI. Run npm run android or npm run ios.',
        type: 'info',
      });
      return;
    }

    if (Platform.OS === 'ios' && !iosGoogleScheme) {
      showToast({
        title: 'iOS client ID invalid',
        message: 'EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID is missing or malformed.',
        type: 'error',
      });
      return;
    }

    if (!request) return;
    await promptAsync();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 24 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>

        {/* Close */}
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()} activeOpacity={0.8}>
          <X size={22} color="#111827" strokeWidth={2.2} />
        </TouchableOpacity>

        {/* Logo */}
        <View style={styles.logoWrap}>
          <View style={styles.logoBox}>
            <Zap size={30} color="#FFFFFF" strokeWidth={2.5} fill="#FFFFFF" />
          </View>
          <Text style={styles.logoText}>DealRush</Text>
          <Text style={styles.logoSub}>Flash deals, daily offers, and more.</Text>
        </View>

        {/* Illustration */}
        <View style={styles.illustrationWrap}>
          <View style={styles.saleTag}>
            <Text style={styles.saleTagText}>FLASH - SALE</Text>
            <Text style={styles.saleTagSub}>70%</Text>
          </View>
          <Text style={styles.illustrationEmoji}>🛍️</Text>
        </View>

        {/* Heading */}
        <Text style={styles.heading}>Log in to catch the next rush</Text>

        {/* Google button */}
        <TouchableOpacity
          style={[styles.googleBtn, (isGoogleLoading || !request) && styles.googleBtnDisabled]}
          activeOpacity={0.85}
          onPress={handleGoogleLogin}
          disabled={isGoogleLoading || !request}>
          {isGoogleLoading ? (
            <ActivityIndicator size="small" color="#DC2626" />
          ) : (
            <Text style={styles.googleG}>G</Text>
          )}
          <Text style={styles.googleText}>
            {isGoogleLoading ? 'Signing in...' : 'Continue with Google'}
          </Text>
        </TouchableOpacity>

        {/* Email section */}
        {!showEmailInput ? (
          <TouchableOpacity
            style={styles.emailBtn}
            activeOpacity={0.9}
            onPress={() => setShowEmailInput(true)}>
            <Text style={styles.emailBtnText}>Continue with Email</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.emailInputSection}>
            <View style={styles.inputWrap}>
              <Mail size={18} color="#9CA3AF" strokeWidth={2} />
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoFocus
                value={email}
                onChangeText={setEmail}
                onSubmitEditing={handleSendOtp}
                returnKeyType="send"
              />
            </View>
            <TouchableOpacity
              style={[styles.sendOtpBtn, (!isValidEmail || isEmailLoading) && styles.sendOtpBtnDisabled]}
              activeOpacity={0.9}
              onPress={handleSendOtp}
              disabled={!isValidEmail || isEmailLoading}>
              {isEmailLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.sendOtpText}>Send OTP</Text>
                  <ArrowRight size={18} color="#FFFFFF" strokeWidth={2.5} />
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* OR */}
        <View style={styles.orRow}>
          <View style={styles.orLine} />
          <Text style={styles.orText}>OR</Text>
          <View style={styles.orLine} />
        </View>

        {/* Merchant */}
        <TouchableOpacity style={styles.merchantRow} activeOpacity={0.8}>
          <Text style={styles.merchantLabel}>Are you a merchant?  </Text>
          <Text style={styles.merchantLink}>Register your Brand</Text>
          <ArrowRight size={13} color="#DC2626" strokeWidth={2.5} />
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 24,
  },

  closeBtn: {
    width: 38,
    height: 38,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },

  /* Logo */
  logoWrap: { alignItems: 'center', marginTop: 12, marginBottom: 20 },
  logoBox: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  logoText: { fontSize: 28, fontWeight: '900', color: '#DC2626', marginBottom: 6 },
  logoSub: { fontSize: 14, color: '#6B7280', fontWeight: '500' },

  /* Illustration */
  illustrationWrap: {
    backgroundColor: '#FEF3C7',
    borderRadius: 20,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
    overflow: 'hidden',
  },
  saleTag: { position: 'absolute', top: 16, left: 0, right: 0, alignItems: 'center' },
  saleTagText: { fontSize: 16, fontWeight: '900', color: '#DC2626', letterSpacing: 2 },
  saleTagSub: { fontSize: 13, fontWeight: '700', color: '#92400E' },
  illustrationEmoji: { fontSize: 64, marginTop: 20 },

  /* Heading */
  heading: {
    fontSize: 22,
    fontWeight: '900',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 30,
  },

  /* Google button */
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  googleG: { fontSize: 18, fontWeight: '900', color: '#4285F4', fontStyle: 'italic' },
  googleText: { fontSize: 15, fontWeight: '700', color: '#111827' },
  googleBtnDisabled: { opacity: 0.6 },

  /* Email toggle button */
  emailBtn: {
    backgroundColor: '#DC2626',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  emailBtnText: { fontSize: 15, fontWeight: '800', color: '#FFFFFF', letterSpacing: 0.3 },

  /* Email input section */
  emailInputSection: { marginBottom: 20, gap: 12 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: '#DC2626',
  },
  input: { flex: 1, fontSize: 15, color: '#111827', padding: 0 },
  sendOtpBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#DC2626',
    borderRadius: 14,
    paddingVertical: 16,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  sendOtpBtnDisabled: { opacity: 0.45, shadowOpacity: 0 },
  sendOtpText: { fontSize: 15, fontWeight: '800', color: '#FFFFFF' },

  /* OR */
  orRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  orLine: { flex: 1, height: 1, backgroundColor: '#E5E7EB' },
  orText: { fontSize: 12, fontWeight: '700', color: '#9CA3AF', letterSpacing: 1 },

  /* Merchant */
  merchantRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  merchantLabel: { fontSize: 13, color: '#9CA3AF' },
  merchantLink: { fontSize: 13, fontWeight: '800', color: '#DC2626' },
});
