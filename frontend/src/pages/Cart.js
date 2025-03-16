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
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

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
      <Container maxW="container.xl" py={8} centerContent>
        <Spinner size="xl" />
      </Container>
    );
  }

  if (!cart?.items?.length) {
    return (
      <Container maxW="container.xl" py={8}>
        <Heading mb={6}>Shopping Cart</Heading>
        <Text>Your cart is empty</Text>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <Heading mb={6}>Shopping Cart</Heading>
      <Box display="flex" flexDirection={{ base: 'column', lg: 'row' }} gap={8}>
        <VStack flex="2" align="stretch" spacing={4}>
          {cart.items.map((item) => (
            <Box
              key={item.id}
              p={4}
              borderWidth="1px"
              borderRadius="lg"
              shadow="sm"
            >
              <HStack spacing={4} align="start">
                {item.product.image && (
                  <Image
                    src={`http://localhost:8000${item.product.image}`}
                    alt={item.product.name}
                    boxSize="100px"
                    objectFit="cover"
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
                    colorScheme="red"
                    size="sm"
                    onClick={() => handleRemoveItem(item.id)}
                  >
                    Remove
                  </Button>
                </VStack>
              </HStack>
            </Box>
          ))}
        </VStack>

        <VStack flex="1" align="stretch" spacing={4}>
          <Box p={6} borderWidth="1px" borderRadius="lg" shadow="sm">
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
            </VStack>
          </Box>

          <Box p={6} borderWidth="1px" borderRadius="lg" shadow="sm">
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
                  type="submit"
                  colorScheme="blue"
                  size="lg"
                  width="full"
                  isLoading={isSubmitting}
                  loadingText="Placing Order..."
                >
                  Place Order
                </Button>
              </VStack>
            </form>
          </Box>
        </VStack>
      </Box>
    </Container>
  );
};

export default Cart; 