import React from 'react';
import { Container, Box } from '@mui/material';
import Navbar from './Navbar';

function Layout({ children }) {
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      width: '100%',
      overflowX: 'hidden'
    }}>
      <Navbar />
      <Container 
        component="main" 
        sx={{ 
          mt: { xs: 2, sm: 4 }, 
          mb: { xs: 2, sm: 4 }, 
          flex: 1,
          width: '100%',
          maxWidth: { xs: '100%', sm: '100%', md: '1200px' },
          px: { xs: 1, sm: 2, md: 3 }
        }}
      >
        {children}
      </Container>
    </Box>
  );
}

export default Layout; 