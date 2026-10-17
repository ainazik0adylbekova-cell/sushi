"use client";

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────

export interface CartItem {
  id: string;       // UUID (from DB) or legacy numeric string "1", "2", …
  name: string;
  price: number;
  imageUrl?: string;
  accent?: string;
}

export interface CartLine {
  item: CartItem;
  qty: number;
}

interface CartState {
  lines: CartLine[];
  drawerOpen: boolean;
}

type CartAction =
  | { type: "ADD";    item: CartItem }
  | { type: "REMOVE"; id: string }
  | { type: "INC";    id: string }
  | { type: "DEC";    id: string }
  | { type: "CLEAR" }
  | { type: "OPEN_DRAWER" }
  | { type: "CLOSE_DRAWER" }
  | { type: "HYDRATE"; lines: CartLine[] };

// ─────────────────────────────────────────
// Reducer
// ─────────────────────────────────────────

function reducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "HYDRATE":
      return { ...state, lines: action.lines };

    case "ADD": {
      const exists = state.lines.find((l) => l.item.id === action.item.id);
      if (exists) {
        return {
          ...state,
          lines: state.lines.map((l) =>
            l.item.id === action.item.id ? { ...l, qty: l.qty + 1 } : l
          ),
        };
      }
      return { ...state, lines: [...state.lines, { item: action.item, qty: 1 }] };
    }

    case "INC":
      return {
        ...state,
        lines: state.lines.map((l) =>
          l.item.id === action.id ? { ...l, qty: l.qty + 1 } : l
        ),
      };

    case "DEC":
      return {
        ...state,
        lines: state.lines
          .map((l) => (l.item.id === action.id ? { ...l, qty: l.qty - 1 } : l))
          .filter((l) => l.qty > 0),
      };

    case "REMOVE":
      return { ...state, lines: state.lines.filter((l) => l.item.id !== action.id) };

    case "CLEAR":
      return { ...state, lines: [] };

    case "OPEN_DRAWER":
      return { ...state, drawerOpen: true };

    case "CLOSE_DRAWER":
      return { ...state, drawerOpen: false };

    default:
      return state;
  }
}

// ─────────────────────────────────────────
// Context
// ─────────────────────────────────────────

interface CartContextValue {
  lines: CartLine[];
  totalQty: number;
  totalPrice: number;
  drawerOpen: boolean;
  addToCart:      (item: CartItem)   => void;
  removeFromCart: (id: string)       => void;
  increment:      (id: string)       => void;
  decrement:      (id: string)       => void;
  clearCart:      ()                 => void;
  openDrawer:     ()                 => void;
  closeDrawer:    ()                 => void;
}

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "syshi_cart_v2"; // bumped version to avoid old number-id data

// ─────────────────────────────────────────
// Provider
// ─────────────────────────────────────────

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { lines: [], drawerOpen: false });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: CartLine[] = JSON.parse(raw);
        if (Array.isArray(parsed)) dispatch({ type: "HYDRATE", lines: parsed });
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state.lines)); }
    catch { /* ignore */ }
  }, [state.lines]);

  useEffect(() => {
    document.body.style.overflow = state.drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [state.drawerOpen]);

  const totalQty   = state.lines.reduce((s, l) => s + l.qty, 0);
  const totalPrice = state.lines.reduce((s, l) => s + l.item.price * l.qty, 0);

  const addToCart      = useCallback((item: CartItem) => dispatch({ type: "ADD",          item }), []);
  const removeFromCart = useCallback((id: string)     => dispatch({ type: "REMOVE",        id }), []);
  const increment      = useCallback((id: string)     => dispatch({ type: "INC",           id }), []);
  const decrement      = useCallback((id: string)     => dispatch({ type: "DEC",           id }), []);
  const clearCart      = useCallback(()               => dispatch({ type: "CLEAR"             }), []);
  const openDrawer     = useCallback(()               => dispatch({ type: "OPEN_DRAWER"       }), []);
  const closeDrawer    = useCallback(()               => dispatch({ type: "CLOSE_DRAWER"      }), []);

  return (
    <CartContext.Provider value={{
      lines: state.lines, totalQty, totalPrice,
      drawerOpen: state.drawerOpen,
      addToCart, removeFromCart, increment, decrement,
      clearCart, openDrawer, closeDrawer,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
