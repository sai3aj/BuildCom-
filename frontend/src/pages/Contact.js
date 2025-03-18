import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  Select,
  FormErrorMessage,
  useToast,
  HStack,
  Icon,
  Divider,
  Flex,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link as RouterLink } from 'react-router-dom';

const MotionBox = motion(Box);

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'general',
    message: '',
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();
  const { user } = useAuth();
  
  // Fetch CSRF token when component mounts
  useEffect(() => {
    const fetchCSRFToken = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/csrf/', {
          withCredentials: true
        });
        // Set CSRF token in axios defaults
        axios.defaults.headers.common['X-CSRFToken'] = response.data.csrfToken;
      } catch (error) {
        console.error('Error fetching CSRF token:', error);
      }
    };
    
    fetchCSRFToken();
  }, []);

  // Set email if user is logged in
  useEffect(() => {
    if (user && user.email) {
      setFormData(prev => ({
        ...prev,
        email: user.email
      }));
    }
  }, [user]);
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    
    return newErrors;
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({ ...errors, [name]: undefined });
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if user is logged in
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to submit the contact form',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await axios.post('http://localhost:8000/api/contact/', formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      toast({
        title: 'Success',
        description: response.data.message || 'Your message has been sent successfully!',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      // Reset form
      setFormData({
        name: '',
        email: user?.email || '',
        phone: '',
        subject: 'general',
        message: '',
      });
      
    } catch (error) {
      console.error('Error submitting form:', error);
      
      // Extract error message from API response if available
      const errorMessage = error.response?.data?.message || 
        'There was an error sending your message. Please try again later.';
      
      toast({
        title: 'Error',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Container maxW="container.xl" py={10}>
      <VStack spacing={8} align="stretch">
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          textAlign="center"
        >
          <Heading size="xl" mb={4}>Contact & Support</Heading>
          <Text fontSize="lg" color="gray.600">
            Have questions or need assistance? We're here to help!
          </Text>
        </MotionBox>
        
        {!user && (
          <Alert status="warning" borderRadius="md">
            <AlertIcon />
            <Box>
              <AlertTitle>Authentication Required</AlertTitle>
              <AlertDescription>
                Please <Button as={RouterLink} to="/login" variant="link" colorScheme="blue">log in</Button> or <Button as={RouterLink} to="/register" variant="link" colorScheme="blue">register</Button> to submit the contact form.
              </AlertDescription>
            </Box>
          </Alert>
        )}
        
        <Flex 
          direction={{ base: 'column', md: 'row' }} 
          gap={{ base: 8, md: 6 }}
          align="flex-start"
        >
          {/* Contact Information */}
          <Box
            w={{ base: '100%', md: '30%' }}
            h="fit-content"
            p={6}
            borderWidth="1px"
            borderRadius="lg"
            bg="gray.50"
            shadow="sm"
          >
            <VStack spacing={6} align="start">
              <Heading size="md">Get In Touch</Heading>
              
              <HStack spacing={4} align="flex-start">
                <Icon as={FaPhone} color="blue.500" boxSize={5} mt={1} />
                <VStack align="start" spacing={0}>
                  <Text fontWeight="bold">Phone</Text>
                  <Text>+91 123-456-7890</Text>
                </VStack>
              </HStack>
              
              <HStack spacing={4} align="flex-start">
                <Icon as={FaEnvelope} color="blue.500" boxSize={5} mt={1} />
                <VStack align="start" spacing={0}>
                  <Text fontWeight="bold">Email</Text>
                  <Text>support@civilmaterials.com</Text>
                </VStack>
              </HStack>
              
              <HStack spacing={4} align="flex-start">
                <Icon as={FaMapMarkerAlt} color="blue.500" boxSize={5} mt={1} />
                <VStack align="start" spacing={0}>
                  <Text fontWeight="bold">Office</Text>
                  <Text>123 Construction Avenue</Text>
                  <Text>Mumbai, Maharashtra 400001</Text>
                </VStack>
              </HStack>
              
              <Divider />
              
              <Box>
                <Text fontWeight="bold" mb={2}>Business Hours</Text>
                <Text>Monday - Friday: 9:00 AM - 6:00 PM</Text>
                <Text>Saturday: 10:00 AM - 4:00 PM</Text>
                <Text>Sunday: Closed</Text>
              </Box>
            </VStack>
          </Box>
          
          {/* Contact Form */}
          <Box 
            as="form" 
            onSubmit={handleSubmit}
            w={{ base: '100%', md: '70%' }}
            p={{ base: 0, md: 6 }}
            borderWidth={{ base: 0, md: '1px' }}
            borderRadius="lg"
            shadow={{ base: 'none', md: 'sm' }}
            opacity={!user ? 0.7 : 1}
            pointerEvents={!user ? 'none' : 'auto'}
          >
            <VStack spacing={6} align="stretch">
              <FormControl isInvalid={errors.name}>
                <FormLabel>Name</FormLabel>
                <Input 
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Your name"
                  size="lg"
                />
                <FormErrorMessage>{errors.name}</FormErrorMessage>
              </FormControl>
              
              <FormControl isInvalid={errors.email}>
                <FormLabel>Email</FormLabel>
                <Input 
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Your email address"
                  size="lg"
                  readOnly={!!user}
                />
                <FormErrorMessage>{errors.email}</FormErrorMessage>
              </FormControl>
              
              <FormControl>
                <FormLabel>Phone (Optional)</FormLabel>
                <Input 
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Your phone number"
                  size="lg"
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Subject</FormLabel>
                <Select 
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  size="lg"
                >
                  <option value="general">General Inquiry</option>
                  <option value="order">Order Issue</option>
                  <option value="product">Product Information</option>
                  <option value="feedback">Feedback</option>
                  <option value="other">Other</option>
                </Select>
              </FormControl>
              
              <FormControl isInvalid={errors.message}>
                <FormLabel>Message</FormLabel>
                <Textarea 
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="How can we help you?"
                  rows={6}
                  size="lg"
                />
                <FormErrorMessage>{errors.message}</FormErrorMessage>
              </FormControl>
              
              <Button
                mt={2}
                colorScheme="blue"
                type="submit"
                isLoading={isSubmitting}
                loadingText="Submitting"
                size="lg"
                w={{ base: 'full', md: 'auto' }}
                alignSelf={{ base: 'stretch', md: 'flex-end' }}
                isDisabled={!user}
              >
                Send Message
              </Button>
            </VStack>
          </Box>
        </Flex>
      </VStack>
    </Container>
  );
};

export default Contact; 