import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import { syncGuestCartToDatabase } from '@/lib/api';

type DealType = 'hourly' | 'daily' | null;

export interface CartItem {
  id: string; // Product UUID
  cloudId?: string | null; // Backend record UUID
  name: string;
  image: string;
  price: number;
  originalPrice: number;
  quantity: number;
  dealType: DealType;
}

interface SessionData {
  email: string;
  token: string;
  loggedInAt: string;
}

interface AddToCartInput {
  id: string;
  cloudId?: string | null;
  name: string;
  image: string;
  price: number;
  originalPrice?: number;
  quantity?: number;
  dealType?: DealType;
}

interface AppStateContextValue {
  isHydrated: boolean;
  session: SessionData | null;
  isLoggedIn: boolean;
  cartItems: CartItem[];
  login: (email: string, token: string) => Promise<void>;
  logout: () => Promise<void>;
  addToCart: (item: AddToCartInput) => void;
  updateCartItemQuantity: (id: string, quantity: number) => void;
  removeCartItem: (id: string) => void;
  setCartItems: React.Dispatch<React.SetStateAction<CartItem[]>>;
  clearCart: () => void;
}

const STORAGE_KEY = 'dealrush.appstate.v1';
const STORAGE_FILE_URI = `${FileSystem.documentDirectory ?? ''}dealrush-app-state-v1.json`;

interface PersistedState {
  session: SessionData | null;
  cartItems: CartItem[];
}

function toServerProductId(id: string): string | null {
  if (id.startsWith('daily-pick-') || id.startsWith('wishlist-')) return null;
  return id;
}

function isLocalStorageAvailable() {
  return Platform.OS === 'web' && typeof globalThis.localStorage !== 'undefined';
}

async function readPersistedState(): Promise<PersistedState | null> {
  try {
    if (isLocalStorageAvailable()) {
      const raw = globalThis.localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as PersistedState) : null;
    }

    if (!STORAGE_FILE_URI) return null;
    const info = await FileSystem.getInfoAsync(STORAGE_FILE_URI);
    if (!info.exists) return null;
    const raw = await FileSystem.readAsStringAsync(STORAGE_FILE_URI);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedState;
  } catch (error) {
    console.error('Failed to read persisted app state:', error);
    return null;
  }
}

async function writePersistedState(state: PersistedState): Promise<void> {
  try {
    const payload = JSON.stringify(state);
    if (isLocalStorageAvailable()) {
      globalThis.localStorage.setItem(STORAGE_KEY, payload);
      return;
    }
    if (!STORAGE_FILE_URI) return;
    await FileSystem.writeAsStringAsync(STORAGE_FILE_URI, payload);
  } catch (error) {
    console.error('Failed to write persisted app state:', error);
  }
}

const AppStateContext = createContext<AppStateContextValue | undefined>(undefined);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [session, setSession] = useState<SessionData | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    let mounted = true;

    const hydrate = async () => {
      try {
        const persisted = await readPersistedState();

        if (!mounted) return;

        if (persisted) {
          setSession(persisted.session ?? null);
          setCartItems(persisted.cartItems ?? []);
        }
      } catch (error) {
        console.error('Failed to hydrate app state:', error);
      } finally {
        if (mounted) setIsHydrated(true);
      }
    };

    hydrate();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    void writePersistedState({ session, cartItems });
  }, [cartItems, isHydrated, session]);

  const login = useCallback(async (email: string, token: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    const nextSession: SessionData = {
      email: normalizedEmail,
      token,
      loggedInAt: new Date().toISOString(),
    };
    setSession(nextSession);

    // Push guest cart to backend once user logs in.
    const syncItems = cartItems
      .map((item) => ({ productId: toServerProductId(item.id), quantity: item.quantity }))
      .filter((item): item is { productId: string; quantity: number } => !!item.productId && item.quantity > 0);

    if (syncItems.length > 0) {
      void syncGuestCartToDatabase(syncItems, token);
    }
  }, [cartItems]);

  const logout = useCallback(async () => {
    setSession(null);
    setCartItems([]);
  }, []);

  const addToCart = useCallback((item: AddToCartInput) => {
    const qty = Math.max(1, Math.floor(item.quantity ?? 1));
    setCartItems((prev) => {
      const idx = prev.findIndex((p) => p.id === item.id);
      if (idx === -1) {
        return [
          ...prev,
          {
            id: item.id,
            cloudId: item.cloudId || null,
            name: item.name,
            image: item.image,
            price: item.price,
            originalPrice: item.originalPrice ?? item.price,
            quantity: qty,
            dealType: item.dealType ?? null,
          },
        ];
      }

      return prev.map((p) =>
        p.id === item.id
          ? {
            ...p,
            cloudId: item.cloudId || p.cloudId || null,
            quantity: p.quantity + qty,
            price: item.price,
            originalPrice: item.originalPrice ?? item.price,
          }
          : p
      );
    });
  }, []);

  const updateCartItemQuantity = useCallback((id: string, quantity: number) => {
    const normalized = Math.floor(quantity);
    setCartItems((prev) => {
      if (normalized <= 0) {
        return prev.filter((item) => item.id !== id);
      }
      return prev.map((item) => (item.id === id ? { ...item, quantity: normalized } : item));
    });
  }, []);

  const removeCartItem = useCallback((id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const value = useMemo<AppStateContextValue>(
    () => ({
      isHydrated,
      session,
      isLoggedIn: !!session,
      cartItems,
      login,
      logout,
      addToCart,
      updateCartItemQuantity,
      removeCartItem,
      setCartItems,
      clearCart,
    }),
    [
      addToCart,
      cartItems,
      isHydrated,
      login,
      logout,
      removeCartItem,
      session,
      updateCartItemQuantity,
      clearCart,
    ]
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) {
    throw new Error('useAppState must be used within AppStateProvider');
  }
  return ctx;
}
