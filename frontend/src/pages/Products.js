import React, { useState, useEffect } from 'react';
import {
  Container,
  SimpleGrid,
  Box,
  Image,
  Text,
  Button,
  VStack,
  HStack,
  Select,
  Heading,
  useToast,
  Spinner,
} from '@chakra-ui/react';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/products/');
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
        toast({
          title: 'Error',
          description: 'Failed to load products',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/categories/');
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchProducts();
    fetchCategories();
  }, [toast]);

  const handleAddToCart = async (productId) => {
    const result = await addToCart(productId);
    
    if (result.requiresAuth) {
      navigate('/login');
      return;
    }

    if (result.success) {
      toast({
        title: 'Added to Cart',
        description: 'Item has been added to your cart',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const filteredProducts = selectedCategory
    ? products.filter(product => product.category === parseInt(selectedCategory))
    : products;

  if (loading) {
    return (
      <Container maxW="container.xl" centerContent py={8}>
        <Spinner size="xl" />
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading mb={4}>Our Products</Heading>
          <Select
            placeholder="All Categories"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            maxW="300px"
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {filteredProducts.map((product) => (
            <Box
              key={product.id}
              borderWidth="1px"
              borderRadius="lg"
              overflow="hidden"
              shadow="sm"
            >
              <Image
                src={product.image ? `http://localhost:8000${product.image}` : 'https://via.placeholder.com/200'}
                alt={product.name}
                height="200px"
                width="100%"
                objectFit="cover"
                fallback={<Box height="200px" bg="gray.100" />}
              />
              <VStack p={4} align="start" spacing={2}>
                <Heading size="md">{product.name}</Heading>
                <Text color="gray.600">{product.description}</Text>
                <HStack justify="space-between" width="100%">
                  <Text fontWeight="bold" fontSize="xl">
                    ${Number(product.price).toFixed(2)}
                  </Text>
                  <Text color={product.stock > 0 ? 'green.500' : 'red.500'}>
                    {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
                  </Text>
                </HStack>
                <Button
                  colorScheme="blue"
                  width="100%"
                  onClick={() => handleAddToCart(product.id)}
                  isDisabled={product.stock === 0}
                >
                  Add to Cart
                </Button>
              </VStack>
            </Box>
          ))}
        </SimpleGrid>
      </VStack>
    </Container>
  );
};

export default Products; 