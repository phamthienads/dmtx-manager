import React from 'react';
import { 
  Box, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  ListItemButton,
  useTheme
} from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import PeopleIcon from '@mui/icons-material/People';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ReceiptIcon from '@mui/icons-material/Receipt';

function Sidebar() {
  const theme = useTheme();
  const location = useLocation();

  const menuItems = [
    { text: 'Khách Hàng', path: '/customers', icon: <PeopleIcon /> },
    { text: 'Sản Phẩm', path: '/products', icon: <ShoppingCartIcon /> },
    { text: 'Hóa Đơn', path: '/invoices', icon: <ReceiptIcon /> }
  ];

  return (
    <Box
      sx={{
        width: 240,
        height: '100vh',
        backgroundColor: '#FFFFFF',
        borderRight: '1px solid',
        borderColor: 'rgba(0, 0, 0, 0.12)',
        display: { xs: 'none', md: 'flex' },
        flexDirection: 'column',
        pt: 2
      }}
    >
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              component={RouterLink}
              to={item.path}
              selected={location.pathname === item.path}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: 'rgba(74, 144, 226, 0.08)',
                  '&:hover': {
                    backgroundColor: 'rgba(74, 144, 226, 0.12)',
                  },
                  '& .MuiListItemIcon-root': {
                    color: '#4A90E2',
                  },
                  '& .MuiListItemText-primary': {
                    color: '#4A90E2',
                    fontWeight: 600,
                  },
                },
                '&:hover': {
                  backgroundColor: 'rgba(74, 144, 226, 0.04)',
                },
                borderRadius: '0 24px 24px 0',
                mx: 1,
                my: 0.5,
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 40,
                  color: location.pathname === item.path ? '#4A90E2' : 'rgba(0, 0, 0, 0.54)',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text}
                sx={{
                  '& .MuiTypography-root': {
                    color: location.pathname === item.path ? '#4A90E2' : 'rgba(0, 0, 0, 0.87)',
                    fontWeight: location.pathname === item.path ? 600 : 400,
                  },
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
}

export default Sidebar; 