import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { useToast } from '@chakra-ui/react';

// Configure axios defaults
axios.defaults.withCredentials = true;
axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const toast = useToast();

  const checkAuth = () => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in or sign up to continue',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return false;
    }
    return true;
  };

  const fetchCart = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/cart/', {
        withCredentials: true,
      });
      setCart(response.data);
    } catch (error) {
      console.error('Error fetching cart:', error);
      setCart(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setCart(null);
      setLoading(false);
    }
  }, [user]);

  const addToCart = async (productId, quantity = 1) => {
    if (!checkAuth()) return { success: false, requiresAuth: true };

    try {
      await axios.post(
        'http://localhost:8000/api/cart/add_item/',
        { product_id: productId, quantity },
        { withCredentials: true }
      );
      await fetchCart();
      toast({
        title: 'Added to Cart',
        description: 'Item has been added to your cart',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      return { success: true };
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to add item to cart',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return { success: false, error: error.message };
    }
  };

  const updateCartItem = async (itemId, quantity) => {
    if (!checkAuth()) return { success: false, requiresAuth: true };

    try {
      await axios.post(
        'http://localhost:8000/api/cart/update_item/',
        { item_id: itemId, quantity },
        { withCredentials: true }
      );
      await fetchCart();
      return { success: true };
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to update cart',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return { success: false, error: error.message };
    }
  };

  const removeFromCart = async (itemId) => {
    if (!checkAuth()) return { success: false, requiresAuth: true };

    try {
      await axios.post(
        'http://localhost:8000/api/cart/remove_item/',
        { item_id: itemId },
        { withCredentials: true }
      );
      await fetchCart();
      toast({
        title: 'Removed from Cart',
        description: 'Item has been removed from your cart',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      return { success: true };
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to remove item',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return { success: false, error: error.message };
    }
  };

  const placeOrder = async (shippingInfo) => {
    if (!checkAuth()) return { success: false, requiresAuth: true };

    try {
      const response = await axios.post(
        'http://localhost:8000/api/cart/place_order/',
        {
          ...shippingInfo,
          user_id: user.id,
          user_email: user.email,
        },
        { withCredentials: true }
      );
      await fetchCart();
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to place order',
      };
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        addToCart,
        updateCartItem,
        removeFromCart,
        placeOrder,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext; 