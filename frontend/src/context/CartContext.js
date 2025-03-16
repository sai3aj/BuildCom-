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

  // Initialize cart and fetch CSRF token
  useEffect(() => {
    const initializeCart = async () => {
      try {
        // Get CSRF token first
        const csrfResponse = await axios.get('http://localhost:8000/api/csrf/', {
          withCredentials: true
        });
        
        // Set CSRF token in axios defaults
        const csrfToken = csrfResponse.data.csrfToken;
        axios.defaults.headers.common['X-CSRFToken'] = csrfToken;

        // If user is logged in, fetch their cart
        if (user) {
          await fetchCart();
        } else {
          setCart(null);
        }
      } catch (error) {
        console.error('Error initializing cart:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeCart();
  }, [user]);

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
        params: {
          user_id: user?.id
        },
        withCredentials: true
      });
      setCart(response.data);
    } catch (error) {
      console.error('Error fetching cart:', error);
      setCart(null);
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    if (!checkAuth()) return { success: false, requiresAuth: true };

    try {
      const response = await axios.post(
        'http://localhost:8000/api/cart/add_item/',
        { 
          product_id: productId, 
          quantity,
          user_id: user?.id,
          user_email: user?.email 
        },
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      await fetchCart();
      toast({
        title: 'Added to Cart',
        description: 'Item has been added to your cart',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error adding to cart:', error.response || error);
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
        { 
          item_id: itemId, 
          quantity,
          user_id: user.id 
        },
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
        { 
          item_id: itemId,
          user_id: user.id 
        },
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