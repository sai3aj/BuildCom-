import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Flex,
  Text,
  Button,
  Stack,
  Link,
  useColorModeValue,
  useDisclosure,
  IconButton,
  HStack,
  Spinner,
} from '@chakra-ui/react';
import { HamburgerIcon, CloseIcon } from '@chakra-ui/icons';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const NavLink = ({ children, to }) => (
  <Link
    as={RouterLink}
    to={to}
    px={2}
    py={1}
    rounded={'md'}
    _hover={{
      textDecoration: 'none',
      bg: useColorModeValue('gray.200', 'gray.700'),
    }}
  >
    {children}
  </Link>
);

const Navbar = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user, signOut } = useAuth();
  const { cart, loading } = useCart();

  const cartItemCount = cart?.items?.length || 0;

  return (
    <Box bg={useColorModeValue('gray.100', 'gray.900')} px={4}>
      <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
        <IconButton
          size={'md'}
          icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
          aria-label={'Open Menu'}
          display={{ md: 'none' }}
          onClick={isOpen ? onClose : onOpen}
        />
        <HStack spacing={8} alignItems={'center'}>
          <Box fontWeight="bold">Civil Materials Store</Box>
          <HStack as={'nav'} spacing={4} display={{ base: 'none', md: 'flex' }}>
            <NavLink to="/">Home</NavLink>
            <NavLink to="/products">Products</NavLink>
            {user && <NavLink to="/orders">Orders</NavLink>}
            <NavLink to="/contact">Contact</NavLink>
            <NavLink to="/cart">
              Cart {loading ? <Spinner size="xs" ml={1} /> : cartItemCount > 0 && `(${cartItemCount})`}
            </NavLink>
          </HStack>
        </HStack>
        <Flex alignItems={'center'}>
          <Stack
            flex={{ base: 1, md: 0 }}
            justify={'flex-end'}
            direction={'row'}
            spacing={6}
          >
            {user ? (
              <>
                <Text>Welcome, {user.email}</Text>
                <Button
                  display={{ base: 'none', md: 'inline-flex' }}
                  fontSize={'sm'}
                  fontWeight={600}
                  color={'white'}
                  bg={'red.400'}
                  onClick={signOut}
                  _hover={{
                    bg: 'red.300',
                  }}
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button
                  as={RouterLink}
                  to="/login"
                  fontSize={'sm'}
                  fontWeight={400}
                  variant={'link'}
                >
                  Sign In
                </Button>
                <Button
                  as={RouterLink}
                  to="/register"
                  display={{ base: 'none', md: 'inline-flex' }}
                  fontSize={'sm'}
                  fontWeight={600}
                  color={'white'}
                  bg={'blue.400'}
                  _hover={{
                    bg: 'blue.300',
                  }}
                >
                  Sign Up
                </Button>
              </>
            )}
          </Stack>
        </Flex>
      </Flex>

      {isOpen ? (
        <Box pb={4} display={{ md: 'none' }}>
          <Stack as={'nav'} spacing={4}>
            <NavLink to="/">Home</NavLink>
            <NavLink to="/products">Products</NavLink>
            {user && <NavLink to="/orders">Orders</NavLink>}
            <NavLink to="/contact">Contact</NavLink>
            <NavLink to="/cart">
              Cart {loading ? <Spinner size="xs" ml={1} /> : cartItemCount > 0 && `(${cartItemCount})`}
            </NavLink>
          </Stack>
        </Box>
      ) : null}
    </Box>
  );
};

export default Navbar; 