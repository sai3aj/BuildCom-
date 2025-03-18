import React, { useState, useEffect, useCallback } from 'react';
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
import ProductCard from '../components/ProductCard';
import { debounce } from 'lodash'; // Make sure to install lodash if not already installed

// Styled motion components
const MotionBox = motion(Box);
const MotionContainer = motion(Container);
const MotionSimpleGrid = motion(SimpleGrid);

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState('');

  const fetchProducts = async (category = null, search = null) => {
    setSearchLoading(true);
    try {
      let url = 'http://localhost:8000/api/products/';
      const params = {};
      
      if (category) {
        params.category = category;
      }
      
      if (search && search.trim()) {
        params.search = search.trim();
      }
      
      const response = await axios.get(url, { params });
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
      setSearchLoading(false);
    }
  };

  // Create a debounced version of fetchProducts for search
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce((searchQuery, category) => {
      fetchProducts(category, searchQuery);
    }, 500),
    []
  );

  useEffect(() => {
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
  }, []);

  // Run the search when search query or category changes
  useEffect(() => {
    debouncedSearch(searchQuery, selectedCategory);
  }, [searchQuery, selectedCategory, debouncedSearch]);

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setSearchLoading(true);
  };

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
              onChange={handleCategoryChange}
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
                {searchLoading ? <Spinner size="sm" /> : <SearchIcon color="gray.300" />}
              </InputLeftElement>
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={handleSearchChange}
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
            {products.length > 0 ? (
              products.map((product) => (
                <MotionBox
                  key={product.id}
                  initial={{ 
                    opacity: 0, 
                    scale: 0.9,
                  }}
                  animate={{ 
                    opacity: 1, 
                    scale: 1
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <ProductCard product={product} />
                </MotionBox>
              ))
            ) : (
              <Box gridColumn="span 4" textAlign="center" py={10}>
                <Text fontSize="lg">No products found matching your criteria.</Text>
              </Box>
            )}
          </MotionSimpleGrid>
        </AnimatePresence>
      </VStack>
    </MotionContainer>
  );
};

export default Products; 