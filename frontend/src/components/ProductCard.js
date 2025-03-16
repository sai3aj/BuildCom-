import React from 'react';
import { Box, Image, Text, Button, Badge, useToast } from '@chakra-ui/react';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product }) => {
  const { addToCart, loading } = useCart();
  const toast = useToast();

  const handleAddToCart = async () => {
    const success = await addToCart(product.id);
    if (success) {
      toast({
        title: 'Added to cart',
        description: `${product.name} has been added to your cart.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box
      maxW="sm"
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      boxShadow="md"
    >
      <Image
        src={product.image || 'https://via.placeholder.com/300'}
        alt={product.name}
        height="200px"
        width="100%"
        objectFit="cover"
      />

      <Box p="6">
        <Box display="flex" alignItems="baseline">
          <Badge borderRadius="full" px="2" colorScheme="blue">
            {product.category_name}
          </Badge>
        </Box>

        <Box
          mt="1"
          fontWeight="semibold"
          as="h4"
          lineHeight="tight"
          noOfLines={1}
        >
          {product.name}
        </Box>

        <Box>
          ₹{product.price}
          <Box as="span" color="gray.600" fontSize="sm">
            / unit
          </Box>
        </Box>

        <Text mt={2} color="gray.600" fontSize="sm" noOfLines={2}>
          {product.description}
        </Text>

        <Button
          mt={4}
          colorScheme="blue"
          width="full"
          onClick={handleAddToCart}
          isDisabled={product.stock <= 0}
          isLoading={loading}
        >
          {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
        </Button>
      </Box>
    </Box>
  );
};

export default ProductCard; 