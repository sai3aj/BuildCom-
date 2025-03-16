import React from 'react';
import { Box, Flex, Button, Heading, Spacer, Badge } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const { cart } = useCart();

  const cartItemsCount = cart?.items?.length || 0;

  return (
    <Box bg="gray.800" px={4} py={3}>
      <Flex maxW="container.xl" mx="auto" alignItems="center">
        <Link to="/">
          <Heading size="md" color="white">Civil Materials Store</Heading>
        </Link>
        <Spacer />
        <Flex gap={4}>
          <Link to="/products">
            <Button colorScheme="blue" variant="ghost">Products</Button>
          </Link>
          <Link to="/cart">
            <Button colorScheme="blue" variant="ghost" position="relative">
              Cart
              {cartItemsCount > 0 && (
                <Badge
                  colorScheme="red"
                  borderRadius="full"
                  position="absolute"
                  top="-1"
                  right="-1"
                >
                  {cartItemsCount}
                </Badge>
              )}
            </Button>
          </Link>
          <Link to="/login">
            <Button colorScheme="blue">Login</Button>
          </Link>
        </Flex>
      </Flex>
    </Box>
  );
};

export default Navbar; 