import { createContext, useContext, useState, useCallback } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState({}); // { [accessoryId]: { product, qty } }

  const add = useCallback((product) => {
    setItems((c) => ({
      ...c,
      [product.id]: {
        product,
        qty: (c[product.id]?.qty || 0) + 1,
      },
    }));
  }, []);

  const remove = useCallback((id) => {
    setItems((c) => {
      const next = { ...c };
      delete next[id];
      return next;
    });
  }, []);

  const setQty = useCallback((id, qty) => {
    if (qty <= 0) {
      remove(id);
      return;
    }
    setItems((c) => ({
      ...c,
      [id]: { ...c[id], qty },
    }));
  }, [remove]);

  const clear = useCallback(() => setItems({}), []);

  const list = Object.values(items);
  const count = list.reduce((s, i) => s + i.qty, 0);
  const total = list.reduce((s, i) => s + Number(i.product.price) * i.qty, 0);

  return (
    <CartContext.Provider value={{ items, list, count, total, add, remove, setQty, clear }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
