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
  Button
} from '@mui/material';
import {
  People as PeopleIcon,
  ShoppingCart as ShoppingCartIcon,
  Receipt as ReceiptIcon
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
        axiosInstance.get('/api/customers'),
        axiosInstance.get('/api/products'),
        axiosInstance.get('/api/invoices')
      ]);

      setStats({
        totalCustomers: customersRes.data.length,
        totalProducts: productsRes.data.length,
        totalInvoices: invoicesRes.data.length
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const StatCard = ({ title, value, icon, color, onClick }) => (
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
        <Button size="small" onClick={onClick}>
          Xem chi tiết
        </Button>
      </CardActions>
    </Card>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Tổng Quan
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={4}>
          <StatCard
            title="Khách Hàng"
            value={stats.totalCustomers}
            icon={<PeopleIcon color="primary" />}
            color="primary"
            onClick={() => navigate('/customers')}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard
            title="Sản Phẩm"
            value={stats.totalProducts}
            icon={<ShoppingCartIcon color="secondary" />}
            color="secondary"
            onClick={() => navigate('/products')}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard
            title="Hóa Đơn"
            value={stats.totalInvoices}
            icon={<ReceiptIcon color="success" />}
            color="success"
            onClick={() => navigate('/invoices')}
          />
        </Grid>
      </Grid>
    </Container>
  );
}

export default Dashboard; 