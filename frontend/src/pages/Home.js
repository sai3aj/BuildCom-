import React from 'react';
import { motion } from 'framer-motion';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Image,
  useColorModeValue,
  Icon,
  SimpleGrid,
  Flex,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { FaTruck, FaTools, FaHardHat, FaHome } from 'react-icons/fa';

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

const FeatureCard = ({ icon, title, description }) => {
  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      p={6}
      bg={useColorModeValue('white', 'gray.700')}
      rounded="xl"
      shadow="lg"
      textAlign="center"
      _hover={{
        transform: 'translateY(-5px)',
        shadow: 'xl',
        transition: 'all 0.2s ease-in-out',
      }}
    >
      <Icon as={icon} w={10} h={10} color="blue.500" mb={4} />
      <Heading size="md" mb={2}>
        {title}
      </Heading>
      <Text color={useColorModeValue('gray.600', 'gray.300')}>{description}</Text>
    </MotionBox>
  );
};

const Home = () => {
  const navigate = useNavigate();
  const bgGradient = useColorModeValue(
    'linear(to-r, blue.100, purple.100)',
    'linear(to-r, blue.900, purple.900)'
  );

  return (
    <Box>
      {/* Hero Section */}
      <Box
        bg={bgGradient}
        pt={{ base: 20, md: 28 }}
        pb={{ base: 16, md: 24 }}
        position="relative"
        overflow="hidden"
      >
        {/* Animated Background Elements */}
        <MotionBox
          position="absolute"
          top="-10%"
          left="-5%"
          w="120%"
          h="120%"
          bgGradient="radial(circle at top left, blue.200, transparent 60%)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ duration: 2 }}
        />
        <MotionBox
          position="absolute"
          bottom="-10%"
          right="-5%"
          w="120%"
          h="120%"
          bgGradient="radial(circle at bottom right, purple.200, transparent 60%)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ duration: 2, delay: 0.5 }}
        />

        <Container maxW="container.xl" position="relative">
          <MotionFlex
            direction={{ base: 'column', md: 'row' }}
            align="center"
            justify="space-between"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <VStack
              align={{ base: 'center', md: 'start' }}
              spacing={6}
              maxW={{ base: 'full', md: '50%' }}
              textAlign={{ base: 'center', md: 'left' }}
            >
              <Heading
                as="h1"
                size="2xl"
                fontWeight="bold"
                color={useColorModeValue('gray.800', 'white')}
                lineHeight="shorter"
              >
                Your One-Stop Shop for Construction Materials
              </Heading>
              <Text
                fontSize="xl"
                color={useColorModeValue('gray.600', 'gray.300')}
              >
                Quality building materials delivered to your doorstep. Build with confidence using our premium products.
              </Text>
              <HStack spacing={4}>
                <Button
                  size="lg"
                  colorScheme="blue"
                  onClick={() => navigate('/products')}
                  _hover={{
                    transform: 'translateY(-2px)',
                    boxShadow: 'lg',
                  }}
                >
                  Shop Now
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate('/register')}
                  _hover={{
                    transform: 'translateY(-2px)',
                    boxShadow: 'lg',
                  }}
                >
                  Join Us
                </Button>
              </HStack>
            </VStack>

            <MotionBox
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              display={{ base: 'none', md: 'block' }}
              w={{ base: 'full', md: '40%' }}
            >
              <Image
                src="/hero-image.png"
                alt="Construction Materials"
                fallbackSrc="https://static.vecteezy.com/system/resources/thumbnails/028/642/325/small_2x/professional-engineer-in-protective-helmet-and-blueprints-paper-at-house-building-construction-site-photo.jpg"
                rounded="lg"
                shadow="2xl"
              />
            </MotionBox>
          </MotionFlex>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxW="container.xl" py={20}>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={10}>
          <FeatureCard
            icon={FaTruck}
            title="Fast Delivery"
            description="Quick and reliable delivery service to your construction site"
          />
          <FeatureCard
            icon={FaTools}
            title="Quality Tools"
            description="Premium construction tools and equipment"
          />
          <FeatureCard
            icon={FaHardHat}
            title="Expert Support"
            description="Professional guidance for your construction needs"
          />
          <FeatureCard
            icon={FaHome}
            title="Complete Solutions"
            description="Everything you need for your construction project"
          />
        </SimpleGrid>
      </Container>

      {/* Call to Action Section */}
      <Box bg={useColorModeValue('gray.100', 'gray.700')} py={16}>
        <Container maxW="container.xl">
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            textAlign="center"
          >
            <Heading mb={4}>Ready to Start Your Project?</Heading>
            <Text fontSize="lg" mb={8}>
              Browse our extensive collection of construction materials and get started today.
            </Text>
            <Button
              size="lg"
              colorScheme="blue"
              onClick={() => navigate('/products')}
              _hover={{
                transform: 'translateY(-2px)',
                boxShadow: 'lg',
              }}
            >
              View Products
            </Button>
          </MotionBox>
        </Container>
      </Box>
    </Box>
  );
};

export default Home; 