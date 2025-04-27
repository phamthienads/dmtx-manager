import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  Stack
} from '@mui/material';
import {
  People as PeopleIcon,
  ShoppingCart as ShoppingCartIcon,
  Receipt as ReceiptIcon,
  Add as AddIcon
} from '@mui/icons-material';
import axiosInstance from '../utils/axios';

function Dashboard() {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalProducts: 0,
    totalInvoices: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [customersRes, productsRes, invoicesRes] = await Promise.all([
        axiosInstance.get('/api/customers/count'),
        axiosInstance.get('/api/products/count'),
        axiosInstance.get('/api/invoices/count')
      ]);

      setStats({
        totalCustomers: customersRes.data.total,
        totalProducts: productsRes.data.total,
        totalInvoices: invoicesRes.data.total
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const StatCard = ({ title, value, icon, color, onClick, onCreate }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          {icon}
          <Typography variant="h6" component="div" sx={{ ml: 1 }}>
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" component="div" color={color}>
          {value}
        </Typography>
      </CardContent>
      <CardActions>
        <Stack direction="row" spacing={1} sx={{ width: '100%' }}>
          <Button 
            size="small" 
            onClick={onClick}
            variant="outlined"
            sx={{ flex: 1 }}
          >
            Xem chi tiết
          </Button>
          <Button
            size="small"
            onClick={onCreate}
            variant="contained"
            startIcon={<AddIcon />}
            sx={{ flex: 1 }}
          >
            Tạo mới
          </Button>
        </Stack>
      </CardActions>
    </Card>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography 
        variant="h4" 
        gutterBottom
        sx={{
          fontWeight: 600,
          color: 'primary.main',
          mb: 4,
          textAlign: 'center',
          fontSize: { xs: '1.5rem', sm: '2.125rem' },
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}
      >
        Bảng Điều Khiển
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={4}>
          <StatCard
            title="Khách Hàng"
            value={stats.totalCustomers}
            icon={<PeopleIcon color="primary" />}
            color="primary"
            onClick={() => navigate('/customers')}
            onCreate={() => navigate('/customers/new')}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard
            title="Sản Phẩm"
            value={stats.totalProducts}
            icon={<ShoppingCartIcon color="secondary" />}
            color="secondary"
            onClick={() => navigate('/products')}
            onCreate={() => navigate('/products/new')}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard
            title="Hóa Đơn"
            value={stats.totalInvoices}
            icon={<ReceiptIcon color="success" />}
            color="success"
            onClick={() => navigate('/invoices')}
            onCreate={() => navigate('/invoices/new')}
          />
        </Grid>
      </Grid>
    </Container>
  );
}

export default Dashboard; 