import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  VStack,
  HStack,
  Text,
  Button,
  Image,
  Divider,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  useToast,
  Spinner,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// Styled motion components
const MotionBox = motion(Box);
const MotionContainer = motion(Container);

const Cart = () => {
  const { cart, loading, removeFromCart, updateCartItem, placeOrder } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    address: '',
  });

  useEffect(() => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in or sign up to view your cart',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      navigate('/login');
    }
  }, [user, navigate, toast]);

  if (!user) {
    return null;
  }

  const handleQuantityChange = async (itemId, newQuantity) => {
    try {
      const success = await updateCartItem(itemId, parseInt(newQuantity));
      if (!success) {
        toast({
          title: 'Error',
          description: 'Failed to update quantity',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      const success = await removeFromCart(itemId);
      if (!success) {
        toast({
          title: 'Error',
          description: 'Failed to remove item',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to place an order',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      navigate('/login');
      return;
    }

    if (!formData.full_name || !formData.phone || !formData.address) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await placeOrder(formData);
      if (result.success) {
        toast({
          title: 'Order Placed',
          description: 'Your order has been successfully placed',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        navigate('/orders');
      } else {
        throw new Error(result.error || 'Failed to place order');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <MotionContainer
        maxW="container.xl"
        py={8}
        centerContent
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <Spinner size="xl" />
      </MotionContainer>
    );
  }

  if (!cart?.items?.length) {
    return (
      <MotionContainer
        maxW="container.xl"
        py={8}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
      >
        <Heading mb={6}>Shopping Cart</Heading>
        <Text>Your cart is empty</Text>
      </MotionContainer>
    );
  }

  return (
    <MotionContainer
      maxW="container.xl"
      py={8}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Heading mb={6}>Shopping Cart</Heading>
      <Box display="flex" flexDirection={{ base: 'column', lg: 'row' }} gap={8}>
        <VStack flex="2" align="stretch" spacing={4}>
          <AnimatePresence>
            {cart.items.map((item) => (
              <MotionBox
                key={item.id}
                p={4}
                borderWidth="1px"
                borderRadius="lg"
                shadow="sm"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <HStack spacing={4} align="start">
                  {item.product.image && (
                    <Image
                      as={motion.img}
                      src={`http://localhost:8000${item.product.image}`}
                      alt={item.product.name}
                      boxSize="100px"
                      objectFit="cover"
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                  <VStack align="start" flex="1">
                    <Text fontWeight="bold">{item.product.name}</Text>
                    <Text color="gray.600">
                      Price: ${Number(item.product.price).toFixed(2)}
                    </Text>
                    <HStack>
                      <Text>Quantity:</Text>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                        min="1"
                        max={item.product.stock}
                        width="80px"
                      />
                    </HStack>
                    <Text fontWeight="semibold">
                      Subtotal: ${(item.quantity * Number(item.product.price)).toFixed(2)}
                    </Text>
                    <Button
                      as={motion.button}
                      colorScheme="red"
                      size="sm"
                      onClick={() => handleRemoveItem(item.id)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Remove
                    </Button>
                  </VStack>
                </HStack>
              </MotionBox>
            ))}
          </AnimatePresence>
        </VStack>

        <VStack flex="1" align="stretch" spacing={4}>
          <MotionBox
            p={6}
            borderWidth="1px"
            borderRadius="lg"
            shadow="sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ boxShadow: "lg" }}
          >
            <Heading size="md" mb={4}>Order Summary</Heading>
            <VStack align="stretch" spacing={3}>
              <HStack justify="space-between">
                <Text>Subtotal:</Text>
                <Text fontWeight="bold">${Number(cart.total).toFixed(2)}</Text>
              </HStack>
              <Divider />
              <HStack justify="space-between">
                <Text fontWeight="bold">Total:</Text>
                <Text fontWeight="bold" fontSize="xl" color="green.500">
                  ${Number(cart.total).toFixed(2)}
                </Text>
              </HStack>
              <Box mt={2} p={3} bg="gray.50" borderRadius="md">
                <Text color="gray.600" fontSize="sm">
                  <strong>Payment Method:</strong> Cash on Delivery (COD)
                </Text>
              </Box>
            </VStack>
          </MotionBox>

          <MotionBox
            p={6}
            borderWidth="1px"
            borderRadius="lg"
            shadow="sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ boxShadow: "lg" }}
          >
            <Heading size="md" mb={4}>Shipping Information</Heading>
            <form onSubmit={handlePlaceOrder}>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Full Name</FormLabel>
                  <Input
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Phone</FormLabel>
                  <Input
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Address</FormLabel>
                  <Textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                  />
                </FormControl>
                <Button
                  as={motion.button}
                  type="submit"
                  colorScheme="blue"
                  size="lg"
                  width="full"
                  isLoading={isSubmitting}
                  loadingText="Placing Order..."
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Place Order
                </Button>
              </VStack>
            </form>
          </MotionBox>
        </VStack>
      </Box>
    </MotionContainer>
  );
};

export default Cart; 