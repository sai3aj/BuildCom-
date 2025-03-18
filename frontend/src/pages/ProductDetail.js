import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Image,
  Text,
  Button,
  VStack,
  HStack,
  Heading,
  Spinner,
  useToast,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Flex,
  IconButton,
} from '@chakra-ui/react';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';

const MotionBox = motion(Box);
const MotionImage = motion(Image);

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/products/${id}/`);
        setProduct(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching product:', error);
        toast({
          title: 'Error',
          description: 'Failed to load product details',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        navigate('/products');
      }
    };

    fetchProduct();
  }, [id, navigate, toast]);

  const handleAddToCart = async () => {
    const result = await addToCart(product.id, quantity);
    
    if (result.success) {
      toast({
        title: 'Added to Cart',
        description: `${quantity} ${quantity > 1 ? 'items' : 'item'} added to your cart`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handlePrevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    } else {
      // Cycle to the last image if at the first image
      const totalImages = product.product_images.length + (product.image ? 1 : 0);
      setCurrentImageIndex(totalImages - 1);
    }
  };

  const handleNextImage = () => {
    const totalImages = product.product_images.length + (product.image ? 1 : 0);
    if (currentImageIndex < totalImages - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    } else {
      // Cycle back to the first image if at the last image
      setCurrentImageIndex(0);
    }
  };

  const getImageUrl = (index) => {
    if (!product) return '';
    
    // Main product image is at index 0
    if (index === 0 && product.image) {
      return `http://localhost:8000${product.image}`;
    }
    
    // Additional images start from index 1 (or 0 if no main image)
    const adjustedIndex = product.image ? index - 1 : index;
    if (adjustedIndex >= 0 && adjustedIndex < product.product_images.length) {
      return `http://localhost:8000${product.product_images[adjustedIndex].image_url}`;
    }
    
    return 'https://via.placeholder.com/500';
  };

  if (loading) {
    return (
      <Container maxW="container.xl" py={8} centerContent>
        <Spinner size="xl" />
      </Container>
    );
  }

  if (!product) {
    return (
      <Container maxW="container.xl" py={8}>
        <Heading>Product not found</Heading>
        <Button mt={4} onClick={() => navigate('/products')}>
          Back to Products
        </Button>
      </Container>
    );
  }

  // Combine main image and additional images for the thumbnail display
  const allImages = [];
  if (product.image) {
    allImages.push({ url: product.image });
  }
  if (product.product_images && product.product_images.length > 0) {
    allImages.push(...product.product_images.map(img => ({ url: img.image_url })));
  }

  return (
    <Container maxW="container.xl" py={8}>
      <Button mb={4} onClick={() => navigate('/products')} leftIcon={<ChevronLeftIcon />}>
        Back to Products
      </Button>
      
      <Flex direction={{ base: 'column', md: 'row' }} gap={8}>
        {/* Images Section */}
        <Box flex="1">
          <Box position="relative">
            <MotionBox
              position="relative"
              height="400px"
              mb={4}
              borderRadius="md"
              overflow="hidden"
            >
              <AnimatePresence mode="wait">
                <MotionImage
                  key={currentImageIndex}
                  src={getImageUrl(currentImageIndex)}
                  alt={product.name}
                  objectFit="cover"
                  width="100%"
                  height="100%"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </AnimatePresence>
              
              {allImages.length > 1 && (
                <>
                  <IconButton
                    aria-label="Previous image"
                    icon={<ChevronLeftIcon />}
                    position="absolute"
                    left={2}
                    top="50%"
                    transform="translateY(-50%)"
                    onClick={handlePrevImage}
                    zIndex={2}
                    colorScheme="blue"
                    isRound
                    size="sm"
                  />
                  <IconButton
                    aria-label="Next image"
                    icon={<ChevronRightIcon />}
                    position="absolute"
                    right={2}
                    top="50%"
                    transform="translateY(-50%)"
                    onClick={handleNextImage}
                    zIndex={2}
                    colorScheme="blue"
                    isRound
                    size="sm"
                  />
                </>
              )}
            </MotionBox>
            
            {/* Thumbnails */}
            {allImages.length > 1 && (
              <Flex gap={2} overflowX="auto" pb={2}>
                {allImages.map((img, index) => (
                  <Box 
                    key={index}
                    as="button"
                    width="70px"
                    height="70px"
                    flexShrink={0}
                    borderRadius="md"
                    overflow="hidden"
                    borderWidth={currentImageIndex === index ? "2px" : "1px"}
                    borderColor={currentImageIndex === index ? "blue.500" : "gray.200"}
                    onClick={() => setCurrentImageIndex(index)}
                  >
                    <Image
                      src={`http://localhost:8000${img.url}`}
                      alt={`Thumbnail ${index}`}
                      objectFit="cover"
                      width="100%"
                      height="100%"
                    />
                  </Box>
                ))}
              </Flex>
            )}
          </Box>
        </Box>
        
        {/* Product Details */}
        <VStack align="start" flex="1" spacing={4}>
          <Heading>{product.name}</Heading>
          
          <Text fontSize="2xl" fontWeight="bold" color="blue.600">
            ₹{Number(product.price).toFixed(2)}
          </Text>
          
          <Text>
            {product.stock > 0 
              ? <Text as="span" color="green.500">In Stock ({product.stock} available)</Text>
              : <Text as="span" color="red.500">Out of Stock</Text>
            }
          </Text>
          
          <Text fontSize="md" lineHeight="tall">
            {product.description}
          </Text>
          
          <HStack mt={4}>
            <Text>Quantity:</Text>
            <NumberInput
              defaultValue={1}
              min={1}
              max={product.stock}
              onChange={(_, value) => setQuantity(value)}
              isDisabled={product.stock <= 0}
            >
              <NumberInputField width="70px" />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </HStack>
          
          <Button
            colorScheme="blue"
            size="lg"
            width="full"
            mt={4}
            onClick={handleAddToCart}
            isDisabled={product.stock <= 0}
          >
            Add to Cart
          </Button>
        </VStack>
      </Flex>
    </Container>
  );
};

export default ProductDetail; 