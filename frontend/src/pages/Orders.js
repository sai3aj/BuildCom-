import React, { useState, useEffect } from 'react';
import {
  Container,
  VStack,
  Box,
  Heading,
  Text,
  Badge,
  Spinner,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from '@chakra-ui/react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const statusColors = {
  pending: 'yellow',
  processing: 'blue',
  shipped: 'purple',
  delivered: 'green',
  cancelled: 'red',
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const fetchOrders = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/orders/', {
        params: {
          user_id: user.id
        },
        withCredentials: true,
      });
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: 'Error',
        description: 'Failed to load orders',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to view your orders',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      navigate('/login');
      return;
    }

    fetchOrders();

    // Set up polling for order status updates
    const pollInterval = setInterval(fetchOrders, 30000); // Poll every 30 seconds

    return () => clearInterval(pollInterval);
  }, [user, navigate, toast]);

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <Container maxW="container.xl" centerContent py={8}>
        <Spinner size="xl" />
      </Container>
    );
  }

  if (orders.length === 0) {
    return (
      <Container maxW="container.xl" py={8}>
        <Heading mb={6}>My Orders</Heading>
        <Text>You haven't placed any orders yet.</Text>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <Heading mb={6}>My Orders</Heading>
      <VStack spacing={4} align="stretch">
        <Accordion allowMultiple>
          {orders.map((order) => (
            <AccordionItem key={order.id}>
              <h2>
                <AccordionButton>
                  <Box flex="1" textAlign="left">
                    <Text fontWeight="bold">
                      Order #{order.order_number} -{' '}
                      <Badge colorScheme={statusColors[order.status]}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      Placed on {new Date(order.created_at).toLocaleDateString()}
                    </Text>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4}>
                <VStack align="stretch" spacing={4}>
                  <Box>
                    <Text fontWeight="bold">Shipping Information:</Text>
                    <Text>{order.full_name}</Text>
                    <Text>{order.phone}</Text>
                    <Text whiteSpace="pre-wrap">{order.address}</Text>
                  </Box>

                  <Box>
                    <Text fontWeight="bold">Payment Method:</Text>
                    <Text>Cash on Delivery (COD)</Text>
                  </Box>

                  <TableContainer>
                    <Table variant="simple">
                      <Thead>
                        <Tr>
                          <Th>Item</Th>
                          <Th isNumeric>Price</Th>
                          <Th isNumeric>Quantity</Th>
                          <Th isNumeric>Subtotal</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {order.items.map((item) => (
                          <Tr key={item.id}>
                            <Td>{item.product_name}</Td>
                            <Td isNumeric>₹{Number(item.product_price).toFixed(2)}</Td>
                            <Td isNumeric>{item.quantity}</Td>
                            <Td isNumeric>₹{Number(item.subtotal).toFixed(2)}</Td>
                          </Tr>
                        ))}
                        <Tr>
                          <Td colSpan={3} fontWeight="bold">
                            Total
                          </Td>
                          <Td isNumeric fontWeight="bold">
                            ₹{Number(order.total_amount).toFixed(2)}
                          </Td>
                        </Tr>
                      </Tbody>
                    </Table>
                  </TableContainer>

                  <Box>
                    <Text fontSize="sm" color="gray.600">
                      Last Updated: {new Date(order.updated_at).toLocaleString()}
                    </Text>
                  </Box>
                </VStack>
              </AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>
      </VStack>
    </Container>
  );
};

export default Orders; 