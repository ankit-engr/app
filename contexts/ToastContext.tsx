import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { CircleAlert, CircleCheck, Info, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ToastType = 'success' | 'error' | 'info';

interface ToastInput {
  title: string;
  message?: string;
  type?: ToastType;
  durationMs?: number;
}

interface ToastData {
  title: string;
  message?: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (input: ToastInput) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const DURATION = 2200;

function getTypeColor(type: ToastType) {
  if (type === 'success') return '#16A34A';
  if (type === 'error') return '#DC2626';
  return '#2563EB';
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<ToastData | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  const scale = useRef(new Animated.Value(0.96)).current;
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const hideToast = useCallback(() => {
    clearTimer();
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 180,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 16,
        duration: 180,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 0.98,
        duration: 180,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(() => setToast(null));
  }, [clearTimer, opacity, scale, translateY]);

  const showToast = useCallback(
    ({ title, message, type = 'success', durationMs = DURATION }: ToastInput) => {
      clearTimer();
      setToast({ title, message, type });

      opacity.setValue(0);
      translateY.setValue(20);
      scale.setValue(0.96);

      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 240,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          damping: 14,
          stiffness: 180,
          mass: 0.8,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          damping: 14,
          stiffness: 200,
          mass: 0.8,
          useNativeDriver: true,
        }),
      ]).start();

      timeoutRef.current = setTimeout(hideToast, durationMs);
    },
    [clearTimer, hideToast, opacity, scale, translateY]
  );

  const value = useMemo(() => ({ showToast }), [showToast]);
  const toastColor = toast ? getTypeColor(toast.type) : '#16A34A';

  return (
    <ToastContext.Provider value={value}>
      {children}
      <View pointerEvents="box-none" style={styles.overlay}>
        {toast ? (
          <Animated.View
            style={[
              styles.toastWrap,
              {
                marginBottom: Math.max(insets.bottom + 78, 88),
                opacity,
                transform: [{ translateY }, { scale }],
              },
            ]}>
            <Pressable
              onPress={hideToast}
              style={[styles.toast, { borderLeftColor: toastColor }]}
              android_ripple={{ color: 'rgba(255,255,255,0.08)' }}>
              <View style={[styles.iconWrap, { backgroundColor: `${toastColor}20` }]}>
                {toast.type === 'success' ? (
                  <CircleCheck size={18} color={toastColor} strokeWidth={2.3} />
                ) : toast.type === 'error' ? (
                  <CircleAlert size={18} color={toastColor} strokeWidth={2.3} />
                ) : (
                  <Info size={18} color={toastColor} strokeWidth={2.3} />
                )}
              </View>
              <View style={styles.textWrap}>
                <Text style={styles.title}>{toast.title}</Text>
                {toast.message ? <Text style={styles.message}>{toast.message}</Text> : null}
              </View>
              <X size={16} color="#9CA3AF" strokeWidth={2.2} />
            </Pressable>
          </Animated.View>
        ) : null}
      </View>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 14,
    pointerEvents: 'box-none',
  },
  toastWrap: {
    width: '100%',
    maxWidth: 640,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderLeftWidth: 4,
    backgroundColor: '#111827',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 18,
      },
      android: { elevation: 8 },
    }),
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textWrap: {
    flex: 1,
  },
  title: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  message: {
    marginTop: 2,
    color: '#D1D5DB',
    fontSize: 12,
    fontWeight: '500',
  },
});
