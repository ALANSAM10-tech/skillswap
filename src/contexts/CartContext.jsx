/* eslint-disable react-refresh/only-export-components */
import { createContext } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useLocalStorage('food_cart', []);

  const addToCart = (product, quantity = 1) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id);
      if (existing) {
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [
          ...prevCart,
          {
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: quantity,
            image: product.imageUrl // maps imageUrl to image as per PRD
          }
        ];
      }
    });
  };

  const removeFromCart = (id) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const updateQuantity = (id, quantity) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  // Calculations
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const packagingFee = subtotal > 0 ? 10 : 0; // Flat Rs. 10 container charge for canteen packaging
  const cgst = Math.round(subtotal * 0.025); // 2.5% CGST
  const sgst = Math.round(subtotal * 0.025); // 2.5% SGST
  const total = subtotal + packagingFee + cgst + sgst;

  return (
    <CartContext.Provider
      value={{
        cartItems: cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        subtotal,
        packagingFee,
        cgst,
        sgst,
        total
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
