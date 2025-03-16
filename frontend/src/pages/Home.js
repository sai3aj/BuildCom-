import React from 'react';
import { Box, Container, Heading, Text, Button, SimpleGrid, Image } from '@chakra-ui/react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <Box>
      {/* Hero Section */}
      <Box
        bgImage="url('https://images.unsplash.com/photo-1541888946425-d81bb19240f5?ixlib=rb-4.0.3')"
        bgPosition="center"
        bgRepeat="no-repeat"
        bgSize="cover"
        h="500px"
        position="relative"
      >
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bg="rgba(0, 0, 0, 0.6)"
        />
        <Container maxW="container.xl" h="100%" position="relative">
          <Box
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="flex-start"
            h="100%"
            color="white"
          >
            <Heading size="2xl" mb={4}>
              Quality Building Materials
            </Heading>
            <Text fontSize="xl" mb={6} maxW="lg">
              Your one-stop shop for all construction materials. We offer the best prices
              and quality products for your building needs.
            </Text>
            <Link to="/products">
              <Button colorScheme="blue" size="lg">
                Shop Now
              </Button>
            </Link>
          </Box>
        </Container>
      </Box>

      {/* Featured Categories */}
      <Container maxW="container.xl" py={16}>
        <Heading mb={8} textAlign="center">Featured Categories</Heading>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={8}>
          {categories.map((category) => (
            <Box
              key={category.name}
              bg="white"
              p={6}
              borderRadius="lg"
              boxShadow="md"
              textAlign="center"
            >
              <Image
                src={category.image}
                alt={category.name}
                h="150px"
                w="100%"
                objectFit="cover"
                borderRadius="md"
                mb={4}
              />
              <Heading size="md" mb={2}>{category.name}</Heading>
              <Text color="gray.600">{category.description}</Text>
            </Box>
          ))}
        </SimpleGrid>
      </Container>
    </Box>
  );
};

const categories = [
  {
    name: 'Cement',
    description: 'High-quality cement for all construction needs',
    image: 'https://images.unsplash.com/photo-1518228684816-9135c15af8a9?ixlib=rb-4.0.3',
  },
  {
    name: 'Steel',
    description: 'Premium steel bars and rods',
    image: 'https://images.unsplash.com/photo-1535813547-99c456a41d4a?ixlib=rb-4.0.3',
  },
  {
    name: 'Bricks',
    description: 'Durable bricks and blocks',
    image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?ixlib=rb-4.0.3',
  },
  {
    name: 'Tools',
    description: 'Essential construction tools',
    image: 'https://images.unsplash.com/photo-1581147036324-c1c78587ab72?ixlib=rb-4.0.3',
  },
];

export default Home; 