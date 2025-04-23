import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ flexGrow: 1, cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          Điện Máy Thiên Xuân
        </Typography>
        <Box>
          <Button color="inherit" component={RouterLink} to="/customers">
            Khách Hàng
          </Button>
          <Button color="inherit" component={RouterLink} to="/products">
            Sản Phẩm
          </Button>
          <Button color="inherit" component={RouterLink} to="/invoices">
            Hóa Đơn
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar; 