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
        backgroundColor: theme.palette.background.paper,
        borderRight: '1px solid',
        borderColor: theme.palette.divider,
        display: { xs: 'none', md: 'flex' },
        flexDirection: 'column',
        pt: 2
      }}
    >
      <List sx={{ flex: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              component={RouterLink}
              to={item.path}
              selected={location.pathname === item.path}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: theme.palette.primary.light,
                  color: theme.palette.primary.main,
                  '&:hover': {
                    backgroundColor: theme.palette.primary.light,
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: location.pathname === item.path ? theme.palette.primary.main : 'inherit',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
}

export default Sidebar; 