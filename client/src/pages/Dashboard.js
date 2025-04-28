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
  Stack,
  Divider,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  People as PeopleIcon,
  ShoppingCart as ShoppingCartIcon,
  Receipt as ReceiptIcon,
  Add as AddIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon
} from '@mui/icons-material';
import axiosInstance from '../utils/axios';
import { formatMoney } from '../utils/moneyUtils';

function Dashboard() {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalProducts: 0,
    totalInvoices: 0
  });
  const [revenue, setRevenue] = useState({
    currentMonth: { month: 0, year: 0, revenue: 0 },
    previousMonth: { month: 0, year: 0, revenue: 0 },
    growthRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [customersRes, productsRes, invoicesRes, revenueRes] = await Promise.all([
        axiosInstance.get('/api/customers/count'),
        axiosInstance.get('/api/products/count'),
        axiosInstance.get('/api/invoices/count'),
        axiosInstance.get('/api/invoices/revenue/monthly')
      ]);

      setStats({
        totalCustomers: customersRes.data.total,
        totalProducts: productsRes.data.total,
        totalInvoices: invoicesRes.data.total
      });
      
      setRevenue(revenueRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
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

  const RevenueCard = ({ title, revenue, growthRate }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <ReceiptIcon color="primary" />
          <Typography variant="h6" component="div" sx={{ ml: 1 }}>
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" component="div" color="primary">
          {formatMoney(revenue)}
        </Typography>
        <Box display="flex" alignItems="center" mt={1}>
          {growthRate >= 0 ? (
            <TrendingUpIcon color="success" />
          ) : (
            <TrendingDownIcon color="error" />
          )}
          <Typography 
            variant="body2" 
            color={growthRate >= 0 ? 'success.main' : 'error.main'}
            sx={{ ml: 1 }}
          >
            {growthRate >= 0 ? '+' : ''}{growthRate.toFixed(1)}% so với tháng trước
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>Đang tải dữ liệu...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      </Container>
    );
  }

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
        <Grid item xs={12} md={6}>
          <RevenueCard 
            title={`Doanh Thu Tháng ${revenue.currentMonth.month}/${revenue.currentMonth.year}`}
            revenue={revenue.currentMonth.revenue}
            growthRate={revenue.growthRate}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <RevenueCard 
            title={`Doanh Thu Tháng ${revenue.previousMonth.month}/${revenue.previousMonth.year}`}
            revenue={revenue.previousMonth.revenue}
            growthRate={0}
          />
        </Grid>
      </Grid>

      <Divider sx={{ my: 4 }} />

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