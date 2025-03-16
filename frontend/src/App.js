import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import AppRoutes from './AppRoutes';
import Navbar from './components/Navbar';

function App() {
  return (
    <BrowserRouter>
      <ChakraProvider>
        <AuthProvider>
          <CartProvider>
            <div className="App">
              <Navbar />
              <AppRoutes />
            </div>
          </CartProvider>
        </AuthProvider>
      </ChakraProvider>
    </BrowserRouter>
  );
}

export default App;
