import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [wallet, setWallet] = useState(0);

  useEffect(() => {
    // Load cart from localStorage
    const storedCart = localStorage.getItem('cart');
    const storedWallet = localStorage.getItem('wallet');
    
    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }
    if (storedWallet) {
      setWallet(parseFloat(storedWallet));
    }
  }, []);

  const addToCart = (service, customPrice = null) => {
    const newItem = {
      id: Date.now(),
      serviceId: service.id,
      serviceName: service.name,
      price: customPrice || service.minPrice,
      addedAt: new Date().toISOString()
    };

    const updatedCart = [...cart, newItem];
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const removeFromCart = (itemId) => {
    const updatedCart = cart.filter(item => item.id !== itemId);
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('cart');
  };

  const addFunds = (amount) => {
    const newBalance = wallet + amount;
    setWallet(newBalance);
    localStorage.setItem('wallet', newBalance.toString());
  };

  const setWalletBalance = (balance) => {
    setWallet(balance);
    localStorage.setItem('wallet', balance.toString());
  };

  const deductFunds = (amount) => {
    if (wallet >= amount) {
      const newBalance = wallet - amount;
      setWallet(newBalance);
      localStorage.setItem('wallet', newBalance.toString());
      return { success: true };
    }
    return { success: false, error: 'Insufficient funds' };
  };

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + item.price, 0);
  };

  const value = {
    cart,
    wallet,
    addToCart,
    removeFromCart,
    clearCart,
    addFunds,
    setWalletBalance,
    deductFunds,
    getTotalAmount,
    cartCount: cart.length
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
