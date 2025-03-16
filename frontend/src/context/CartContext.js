import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Configure axios defaults
axios.defaults.withCredentials = true;
axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get CSRF token first
  const getCSRFToken = async () => {
    try {
      await axios.get('http://localhost:8000/api/csrf/');
    } catch (err) {
      console.error('Error fetching CSRF token:', err);
    }
  };

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8000/api/cart/', {
        withCredentials: true
      });
      setCart(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch cart');
      console.error('Error fetching cart:', err);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    try {
      setLoading(true);
      await axios.post('http://localhost:8000/api/cart/add_item/', {
        product_id: productId,
        quantity,
      }, {
        withCredentials: true
      });
      await fetchCart();
      return true;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add item to cart');
      console.error('Error adding to cart:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateCartItem = async (productId, quantity) => {
    try {
      setLoading(true);
      await axios.post('http://localhost:8000/api/cart/update_item/', {
        product_id: productId,
        quantity,
      }, {
        withCredentials: true
      });
      await fetchCart();
      return true;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update cart');
      console.error('Error updating cart:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      setLoading(true);
      await axios.post('http://localhost:8000/api/cart/update_item/', {
        product_id: productId,
        quantity: 0,
      }, {
        withCredentials: true
      });
      await fetchCart();
      return true;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to remove item from cart');
      console.error('Error removing from cart:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setLoading(true);
      await axios.post('http://localhost:8000/api/cart/clear/', {}, {
        withCredentials: true
      });
      await fetchCart();
      return true;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to clear cart');
      console.error('Error clearing cart:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializeCart = async () => {
      await getCSRFToken();
      await fetchCart();
    };
    initializeCart();
  }, []);

  const value = {
    cart,
    loading,
    error,
    fetchCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export default CartContext; 