import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  Divider,
  Button,
  useToast,
  Spinner,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
} from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Profile = () => {
  const { user, signOut } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, [user, navigate]);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/orders/', {
        withCredentials: true,
        headers: {
          'Authorization': `Bearer ${user?.access_token}`
        }
      });
      setOrders(response.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch orders',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'yellow';
      case 'processing':
        return 'blue';
      case 'shipped':
        return 'purple';
      case 'delivered':
        return 'green';
      case 'cancelled':
        return 'red';
      default:
        return 'gray';
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
      <Box borderWidth={1} borderRadius={8} p={8} boxShadow="lg">
        <VStack spacing={6} align="stretch">
          <HStack justify="space-between">
            <Heading size="lg">My Profile</Heading>
            <Button colorScheme="red" onClick={handleSignOut}>
              Sign Out
            </Button>
          </HStack>
          
          <Box>
            <Text fontSize="lg" fontWeight="bold">Email</Text>
            <Text>{user?.email}</Text>
          </Box>

          <Divider />

          <Box>
            <Heading size="md" mb={4}>Order History</Heading>
            {orders.length === 0 ? (
              <Text>No orders found.</Text>
            ) : (
              <TableContainer>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Order #</Th>
                      <Th>Date</Th>
                      <Th>Total Amount</Th>
                      <Th>Status</Th>
                      <Th>Items</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {orders.map((order) => (
                      <Tr key={order.order_number}>
                        <Td>{order.order_number}</Td>
                        <Td>{new Date(order.created_at).toLocaleDateString()}</Td>
                        <Td>₹{order.total_amount}</Td>
                        <Td>
                          <Badge colorScheme={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                        </Td>
                        <Td>
                          <VStack align="start" spacing={2}>
                            {order.items.map((item, index) => (
                              <Text key={index}>
                                {item.quantity}x {item.product_name}
                              </Text>
                            ))}
                          </VStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            )}
          </Box>
        </VStack>
      </Box>
    </Container>
  );
};

export default Profile; 