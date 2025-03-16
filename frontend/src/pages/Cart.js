import React, { useState } from 'react';
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
  useToast,
  Input,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Spinner,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { useCart } from '../context/CartContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
  const { cart, loading, updateCartItem, removeFromCart, clearCart } = useCart();
  const [shippingInfo, setShippingInfo] = useState({
    full_name: '',
    phone: '',
    address: '',
  });
  const [errors, setErrors] = useState({});
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const validatePhone = (phone) => {
    const digits = phone.replace(/\D/g, '');
    return digits.length >= 10;
  };

  const handleUpdateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    const success = await updateCartItem(productId, newQuantity);
    if (!success) {
      toast({
        title: 'Error',
        description: 'Failed to update quantity',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleRemoveItem = async (productId) => {
    const success = await removeFromCart(productId);
    if (!success) {
      toast({
        title: 'Error',
        description: 'Failed to remove item',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!shippingInfo.full_name) {
      newErrors.full_name = 'Full name is required';
    }
    
    if (!shippingInfo.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!validatePhone(shippingInfo.phone)) {
      newErrors.phone = 'Phone number must be at least 10 digits';
    }
    
    if (!shippingInfo.address) {
      newErrors.address = 'Address is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) {
      toast({
        title: 'Error',
        description: 'Please fix the errors in the form',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setIsPlacingOrder(true);
      const response = await axios.post(
        'http://localhost:8000/api/cart/place_order/',
        shippingInfo,
        { withCredentials: true }
      );

      // Clear the cart after successful order placement
      await clearCart();

      toast({
        title: 'Order Placed!',
        description: `Order #${response.data.order_number} has been placed successfully. We will contact you soon.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      setShippingInfo({ full_name: '', phone: '', address: '' });
      navigate('/products'); // Redirect to products page
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to place order',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (loading) {
    return (
      <Container maxW="container.xl" py={8} centerContent>
        <Spinner size="xl" />
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <Heading mb={8}>Shopping Cart</Heading>

      {(!cart?.items || cart.items.length === 0) ? (
        <Alert status="info">
          <AlertIcon />
          Your cart is empty. Browse our products to add items to your cart.
        </Alert>
      ) : (
        <Box display={{ md: 'flex' }} gap={8}>
          <VStack flex="2" alignItems="stretch" spacing={4}>
            {cart.items.map((item) => (
              <HStack
                key={item.id}
                p={4}
                borderWidth="1px"
                borderRadius="lg"
                spacing={4}
              >
                <Image
                  src={item.product.image || 'https://via.placeholder.com/100'}
                  alt={item.product.name}
                  boxSize="100px"
                  objectFit="cover"
                />
                <Box flex="1">
                  <Text fontWeight="bold">{item.product.name}</Text>
                  <Text color="gray.600">₹{item.product.price}</Text>
                </Box>
                <HStack>
                  <Button
                    size="sm"
                    onClick={() => handleUpdateQuantity(item.product.id, item.quantity - 1)}
                  >
                    -
                  </Button>
                  <Text>{item.quantity}</Text>
                  <Button
                    size="sm"
                    onClick={() => handleUpdateQuantity(item.product.id, item.quantity + 1)}
                  >
                    +
                  </Button>
                </HStack>
                <Button
                  colorScheme="red"
                  variant="ghost"
                  onClick={() => handleRemoveItem(item.product.id)}
                >
                  Remove
                </Button>
              </HStack>
            ))}
          </VStack>

          <Box flex="1">
            <Box p={6} borderWidth="1px" borderRadius="lg">
              <Heading size="md" mb={4}>Order Summary</Heading>
              <VStack spacing={4} align="stretch">
                <HStack justify="space-between">
                  <Text>Subtotal</Text>
                  <Text>₹{cart.total}</Text>
                </HStack>
                <HStack justify="space-between">
                  <Text>Shipping</Text>
                  <Text>₹100</Text>
                </HStack>
                <Divider />
                <HStack justify="space-between" fontWeight="bold">
                  <Text>Total</Text>
                  <Text>₹{Number(cart.total) + 100}</Text>
                </HStack>

                <VStack spacing={4} mt={6} align="stretch">
                  <FormControl isRequired isInvalid={!!errors.full_name}>
                    <FormLabel>Full Name</FormLabel>
                    <Input
                      name="full_name"
                      value={shippingInfo.full_name}
                      onChange={handleInputChange}
                    />
                    <FormErrorMessage>{errors.full_name}</FormErrorMessage>
                  </FormControl>
                  <FormControl isRequired isInvalid={!!errors.phone}>
                    <FormLabel>Phone Number</FormLabel>
                    <Input
                      name="phone"
                      value={shippingInfo.phone}
                      onChange={handleInputChange}
                      placeholder="Enter at least 10 digits"
                    />
                    <FormErrorMessage>{errors.phone}</FormErrorMessage>
                  </FormControl>
                  <FormControl isRequired isInvalid={!!errors.address}>
                    <FormLabel>Delivery Address</FormLabel>
                    <Input
                      name="address"
                      value={shippingInfo.address}
                      onChange={handleInputChange}
                    />
                    <FormErrorMessage>{errors.address}</FormErrorMessage>
                  </FormControl>
                </VStack>

                <Button
                  colorScheme="blue"
                  size="lg"
                  width="full"
                  onClick={handlePlaceOrder}
                  mt={4}
                  isLoading={isPlacingOrder}
                  loadingText="Placing Order..."
                >
                  Place Order (Cash on Delivery)
                </Button>
              </VStack>
            </Box>
          </Box>
        </Box>
      )}
    </Container>
  );
};

export default Cart; 