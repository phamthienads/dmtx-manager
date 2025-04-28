import React from 'react';
import { Box } from '@mui/material';
import Navbar from './Navbar';
import Footer from './Footer';
import Sidebar from './Sidebar';

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
      <Box sx={{ display: 'flex', flex: 1 }}>
        <Sidebar />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 2, sm: 3 },
            width: { md: `calc(100% - 240px)` },
            display: 'flex',
            justifyContent: 'center'
          }}
        >
          <Box sx={{ 
            width: '100%',
            maxWidth: { xs: '100%', sm: '100%', md: '1200px' }
          }}>
            {children}
          </Box>
        </Box>
      </Box>
      <Footer />
    </Box>
  );
}

export default Layout; 