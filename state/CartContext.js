//--------------------------------------------
// CartContext.js
//--------------------------------------------

// Stores cart state across the app.
// Handles add/remove items, quantity updates, subtotal, count, and clear cart.
import React, { createContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const CartContext = createContext();

const CART_STORAGE_KEY = '@brewmate_cart_final';

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const loadCart = async () => {
      try {
        const storedCart = await AsyncStorage.getItem(CART_STORAGE_KEY);
        if (storedCart) {
          setCart(JSON.parse(storedCart));
        }
      } catch (error) {
        console.log('Error loading cart:', error);
      } finally {
        setIsReady(true);
      }
    };

    loadCart();
  }, []);

  useEffect(() => {
    if (!isReady) return;

    const saveCart = async () => {
      try {
        await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
      } catch (error) {
        console.log('Error saving cart:', error);
      }
    };

    saveCart();
  }, [cart, isReady]);

  const addToCart = (item, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);

      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i
        );
      }

      return [...prev, { ...item, quantity }];
    });
  };

  const updateQuantity = (id, quantity) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
      )
    );
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        isReady,
        cartCount,
        subtotal,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}>
      {children}
    </CartContext.Provider>
  );
};
