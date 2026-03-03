import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Mail, Delete, Zap } from 'lucide-react-native';
import { useAppState } from '@/contexts/AppStateContext';
import { verifyEmailOTP, sendEmailOTP } from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';

const CODE_LENGTH = 6;
const RESEND_SECONDS = 45;

const KEYS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['*', '0', 'del'],
];

export default function VerifyEmailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { login } = useAppState();
  const { showToast } = useToast();
  const { email, tempToken: initialTempToken } = useLocalSearchParams<{ email: string; tempToken: string }>();
  const displayEmail = email || 'user@example.com';

  const [code, setCode] = useState<string[]>([]);
  const [countdown, setCountdown] = useState(RESEND_SECONDS);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [tempToken, setTempToken] = useState(initialTempToken || '');

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [countdown]);

  const handleKey = (key: string) => {
    if (key === 'del') {
      setCode((prev) => prev.slice(0, -1));
    } else if (key !== '*' && code.length < CODE_LENGTH) {
      setCode((prev) => [...prev, key]);
    }
  };

  const handleVerify = useCallback(async () => {
    if (code.length < CODE_LENGTH || isVerifying) return;

    setIsVerifying(true);
    try {
      const otp = code.join('');
      const response = await verifyEmailOTP({
        tempToken,
        otp,
      });

      await login(response.user.email, response.token);
      showToast({
        title: 'Success',
        message: 'Email verified successfully!',
        type: 'success',
      });

      router.replace('/(tabs)');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Verification failed.';
      showToast({
        title: 'Error',
        message,
        type: 'error',
      });
      setCode([]); // Clear code on failure
    } finally {
      setIsVerifying(false);
    }
  }, [code, tempToken, isVerifying, login, router, showToast]);

  useEffect(() => {
    if (code.length === CODE_LENGTH) {
      handleVerify();
    }
  }, [code, handleVerify]);

  const handleResend = async () => {
    if (countdown > 0 || isResending) return;

    setIsResending(true);
    try {
      const data = await sendEmailOTP(displayEmail);
      setTempToken(data.tempToken);
      setCode([]);
      setCountdown(RESEND_SECONDS);
      showToast({
        title: 'Success',
        message: 'OTP resent successfully.',
        type: 'success',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to resend OTP.';
      showToast({
        title: 'Error',
        message,
        type: 'error',
      });
    } finally {
      setIsResending(false);
    }
  };

  const timerLabel = `${String(Math.floor(countdown / 60)).padStart(2, '0')}:${String(countdown % 60).padStart(2, '0')}`;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
          <ArrowLeft size={22} color="#111827" strokeWidth={2.2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Verify Email</Text>
        <BoxPlaceholder width={36} />
      </View>

      {/* Body */}
      <View style={styles.body}>
        {/* Icon */}
        <View style={styles.iconCircle}>
          <Mail size={28} color="#DC2626" strokeWidth={2} />
        </View>

        <Text style={styles.title}>Verify Your Email</Text>
        <Text style={styles.subtitle}>Enter the 6-digit code sent to</Text>
        <Text style={styles.email}>{displayEmail}</Text>

        {/* OTP boxes */}
        <View style={styles.otpRow}>
          {Array.from({ length: CODE_LENGTH }).map((_, i) => {
            const isActive = i === code.length;
            const filled = code[i] !== undefined;
            return (
              <View key={i} style={[styles.otpBox, isActive && styles.otpBoxActive]}>
                {isActive ? (
                  <View style={styles.cursor} />
                ) : (
                  <Text style={styles.otpDigit}>{filled ? code[i] : ''}</Text>
                )}
                <View style={[styles.otpUnderline, isActive && styles.otpUnderlineActive]} />
              </View>
            );
          })}
        </View>

        {/* Verify button */}
        <TouchableOpacity
          style={[styles.verifyBtn, (code.length < CODE_LENGTH || isVerifying) && styles.verifyBtnDisabled]}
          onPress={handleVerify}
          disabled={code.length < CODE_LENGTH || isVerifying}
          activeOpacity={0.9}>
          {isVerifying ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.verifyText}>Verify & Login</Text>
          )}
        </TouchableOpacity>

        {/* Resend */}
        <Text style={styles.resendLabel}>Didn't receive the code?</Text>
        {countdown > 0 ? (
          <Text style={styles.resendTimer}>
            Resend in <Text style={styles.timerRed}>{timerLabel}</Text>
          </Text>
        ) : null}
        <TouchableOpacity onPress={handleResend} disabled={countdown > 0 || isResending} activeOpacity={0.8}>
          {isResending ? (
            <ActivityIndicator size="small" color="#DC2626" style={{ marginTop: 5 }} />
          ) : (
            <Text style={[styles.resendBtn, (countdown > 0 || isResending) && styles.resendBtnDisabled]}>
              Resend Code
            </Text>
          )}
        </TouchableOpacity>

        {/* Watermark */}
        <View style={styles.watermark}>
          <Zap size={13} color="#DC262650" strokeWidth={2} fill="#DC262640" />
          <Text style={styles.watermarkText}>DEALRUSH</Text>
        </View>
      </View>

      {/* Custom keyboard */}
      <View style={[styles.keyboard, { paddingBottom: insets.bottom + 8 }]}>
        {KEYS.map((row, ri) => (
          <View key={ri} style={styles.keyRow}>
            {row.map((key) => (
              <TouchableOpacity
                key={key}
                style={styles.key}
                onPress={() => handleKey(key)}
                activeOpacity={0.7}>
                {key === 'del' ? (
                  <Delete size={20} color="#111827" strokeWidth={2} />
                ) : key === '*' ? (
                  <Text style={styles.keyText}> </Text>
                ) : (
                  <Text style={styles.keyText}>{key}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

function BoxPlaceholder({ width }: { width: number }) {
  return <View style={{ width }} />;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backBtn: { width: 36, height: 36, justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#111827' },

  /* Body */
  body: { flex: 1, alignItems: 'center', paddingHorizontal: 28, paddingTop: 20 },

  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },

  title: { fontSize: 24, fontWeight: '900', color: '#111827', marginBottom: 10 },
  subtitle: { fontSize: 14, color: '#6B7280', marginBottom: 4 },
  email: { fontSize: 14, fontWeight: '800', color: '#111827', marginBottom: 32 },

  /* OTP */
  otpRow: { flexDirection: 'row', gap: 10, marginBottom: 32 },
  otpBox: {
    width: 44,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  otpBoxActive: {},
  otpDigit: { fontSize: 26, fontWeight: '700', color: '#111827' },
  cursor: {
    width: 2,
    height: 28,
    backgroundColor: '#111827',
  },
  otpUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
  },
  otpUnderlineActive: { backgroundColor: '#DC2626', height: 2.5 },

  /* Verify button */
  verifyBtn: {
    width: '100%',
    backgroundColor: '#DC2626',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  verifyBtnDisabled: { opacity: 0.5, shadowOpacity: 0 },
  verifyText: { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },

  /* Resend */
  resendLabel: { fontSize: 13, color: '#6B7280', marginBottom: 4 },
  resendTimer: { fontSize: 13, color: '#6B7280', marginBottom: 8 },
  timerRed: { color: '#DC2626', fontWeight: '800' },
  resendBtn: { fontSize: 13, fontWeight: '700', color: '#6B7280', marginBottom: 20 },
  resendBtnDisabled: { opacity: 0.4 },

  /* Watermark */
  watermark: { flexDirection: 'row', alignItems: 'center', gap: 5, opacity: 0.35, marginTop: 4 },
  watermarkText: { fontSize: 11, fontWeight: '900', color: '#DC2626', letterSpacing: 2 },

  /* Keyboard */
  keyboard: {
    backgroundColor: '#F3F4F6',
    paddingTop: 8,
  },
  keyRow: { flexDirection: 'row' },
  key: {
    flex: 1,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  keyText: { fontSize: 22, fontWeight: '500', color: '#111827' },
});
