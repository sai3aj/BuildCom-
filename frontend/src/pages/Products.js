import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  SimpleGrid,
  Image,
  Text,
  Button,
  VStack,
  HStack,
  Heading,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  useToast,
  Spinner,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// Styled motion components
const MotionBox = motion(Box);
const MotionContainer = motion(Container);
const MotionSimpleGrid = motion(SimpleGrid);

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState('');

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

  return (
    <MotionContainer
      maxW="container.xl"
      py={8}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <VStack spacing={6} align="stretch">
        <HStack justify="space-between" wrap="wrap" spacing={4}>
          <Heading size="lg">Products</Heading>
          <HStack spacing={4}>
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              placeholder="All Categories"
              w={{ base: "full", md: "200px" }}
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
            <InputGroup w={{ base: "full", md: "300px" }}>
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.300" />
              </InputLeftElement>
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </InputGroup>
          </HStack>
        </HStack>

        <AnimatePresence>
          <MotionSimpleGrid
            columns={{ base: 1, sm: 2, md: 3, lg: 4 }}
            spacing={6}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {filteredProducts.map((product) => (
              <MotionBox
                key={product.id}
                borderWidth="1px"
                borderRadius="lg"
                overflow="hidden"
                shadow="sm"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ 
                  scale: 1.03,
                  shadow: "lg",
                  transition: { duration: 0.2 }
                }}
              >
                <Box position="relative" paddingTop="100%">
                  <Image
                    as={motion.img}
                    src={`http://localhost:8000${product.image}`}
                    alt={product.name}
                    position="absolute"
                    top="0"
                    left="0"
                    w="100%"
                    h="100%"
                    objectFit="cover"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                  />
                </Box>
                <Box p={4}>
                  <VStack align="start" spacing={2}>
                    <Heading size="md" noOfLines={2}>
                      {product.name}
                    </Heading>
                    <Text color="gray.600" noOfLines={2}>
                      {product.description}
                    </Text>
                    <Text color="blue.600" fontSize="xl" fontWeight="bold">
                      ${Number(product.price).toFixed(2)}
                    </Text>
                    <Text color={product.stock > 0 ? "green.500" : "red.500"}>
                      {product.stock > 0 ? `In Stock (${product.stock})` : "Out of Stock"}
                    </Text>
                    <Button
                      as={motion.button}
                      colorScheme="blue"
                      width="full"
                      onClick={() => handleAddToCart(product.id)}
                      isDisabled={product.stock === 0}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Add to Cart
                    </Button>
                  </VStack>
                </Box>
              </MotionBox>
            ))}
          </MotionSimpleGrid>
        </AnimatePresence>
      </VStack>
    </MotionContainer>
  );
};

export default Products; 