import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  useMediaQuery,
  useTheme,
  Box,
  Link
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import PeopleIcon from '@mui/icons-material/People';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ReceiptIcon from '@mui/icons-material/Receipt';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { text: 'Khách Hàng', path: '/customers', icon: <PeopleIcon /> },
    { text: 'Sản Phẩm', path: '/products', icon: <ShoppingCartIcon /> },
    { text: 'Hóa Đơn', path: '/invoices', icon: <ReceiptIcon /> }
  ];

  const drawer = (
    <Box>
      <Box
        sx={{
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          backgroundColor: '#FFFFFF',
          color: '#333333',
          borderBottom: '1px solid rgba(0,0,0,0.1)'
        }}
      >
        <img 
          src="/logo.png" 
          alt="Logo" 
          style={{ 
            width: '80px', 
            height: '80px', 
            marginBottom: '10px',
            objectFit: 'contain'
          }} 
        />
        <Typography variant="h6" sx={{ textAlign: 'center' }}>
          Điện Máy Thiên Xuân
        </Typography>
        <Typography variant="body2" sx={{ textAlign: 'center', opacity: 0.8 }}>
          Quản Lí Doanh Nghiệp
        </Typography>
      </Box>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem 
            button 
            key={item.text} 
            component={RouterLink} 
            to={item.path}
            onClick={handleDrawerToggle}
          >
            <ListItemIcon>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <AppBar 
      position="static"
      sx={{
        backgroundColor: '#FFFFFF',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        color: '#333333'
      }}
    >
      <Toolbar>
        {isMobile ? (
          <>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Box
              sx={{
                position: 'absolute',
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                cursor: 'pointer'
              }}
              onClick={() => navigate('/')}
            >
              <img 
                src="/logo.png" 
                alt="Logo" 
                style={{ 
                  width: '75px', 
                  height: '75px',
                  objectFit: 'contain'
                }} 
              />
            </Box>
            <Box sx={{ flexGrow: 1 }} />
            <IconButton
              color="inherit"
              href="https://dienmaythienxuan.vn"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ ml: 1 }}
            >
              <OpenInNewIcon />
            </IconButton>
          </>
        ) : (
          <>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                cursor: 'pointer',
                ml: 2
              }}
              onClick={() => navigate('/')}
            >
              <img 
                src="/logo.png" 
                alt="Logo" 
                style={{ 
                  width: '75px', 
                  height: '75px',
                  objectFit: 'contain'
                }} 
              />
              <Typography 
                variant="h6" 
                component="div" 
                sx={{ 
                  fontSize: '1.25rem'
                }}
              >
                Điện Máy Thiên Xuân
              </Typography>
            </Box>
            <Box sx={{ flexGrow: 1 }} />
            <Link
              href="https://dienmaythienxuan.vn"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                color: 'inherit',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                mr: 2
              }}
            >
              dienmaythienxuan.vn
              <OpenInNewIcon fontSize="small" />
            </Link>
          </>
        )}
      </Toolbar>
      <Drawer
        variant="temporary"
        anchor="left"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: 240 
          },
        }}
      >
        {drawer}
      </Drawer>
    </AppBar>
  );
}

export default Navbar; 