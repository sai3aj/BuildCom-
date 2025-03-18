import React from 'react';
import { Box, Image, Text, Button, Badge, useToast, Flex } from '@chakra-ui/react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

const ProductCard = ({ product }) => {
  const { addToCart, loading } = useCart();
  const toast = useToast();
  const navigate = useNavigate();

  const handleAddToCart = async (e) => {
    e.stopPropagation(); // Prevent navigation when clicking the button
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

  const goToProductDetail = () => {
    navigate(`/products/${product.id}`);
  };

  // Get the image source with fallback logic
  const getImageSrc = () => {
    if (product.image) {
      return `http://localhost:8000${product.image}`;
    } else if (product.product_images && product.product_images.length > 0) {
      return `http://localhost:8000${product.product_images[0].image_url}`;
    }
    return 'https://via.placeholder.com/300';
  };

  return (
    <Box
      maxW="sm"
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      boxShadow="md"
      cursor="pointer"
      onClick={goToProductDetail}
      transition="transform 0.2s, box-shadow 0.2s"
      _hover={{ transform: 'translateY(-5px)', boxShadow: 'lg' }}
    >
      <Image
        src={getImageSrc()}
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

        <Flex mt={4} justifyContent="space-between" align="center">
          <Text color={product.stock > 0 ? "green.500" : "red.500"} fontSize="sm">
            {product.stock > 0 ? `In Stock (${product.stock})` : "Out of Stock"}
          </Text>
          
          <Button
            colorScheme="blue"
            onClick={handleAddToCart}
            isDisabled={product.stock <= 0}
            isLoading={loading}
            size="sm"
          >
            Add to Cart
          </Button>
        </Flex>
      </Box>
    </Box>
  );
};

export default ProductCard; 