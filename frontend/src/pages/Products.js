import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  SimpleGrid,
  Select,
  Input,
  Flex,
  Heading,
  useToast,
} from '@chakra-ui/react';
import axios from 'axios';
import ProductCard from '../components/ProductCard';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const toast = useToast();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/products/');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
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

  const handleAddToCart = (product) => {
    // For now, just show a toast notification
    toast({
      title: 'Added to cart',
      description: `${product.name} has been added to your cart.`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const filteredProducts = products.filter((product) => {
    const matchesCategory = !selectedCategory || product.category === parseInt(selectedCategory);
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <Container maxW="container.xl" py={8}>
      <Heading mb={8}>Our Products</Heading>
      
      <Flex mb={8} gap={4}>
        <Input
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Select
          placeholder="All Categories"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </Select>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
        {filteredProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={handleAddToCart}
          />
        ))}
      </SimpleGrid>
    </Container>
  );
};

export default Products; 