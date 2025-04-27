import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Divider,
  Card,
  CardContent,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import axiosInstance from '../utils/axios';
import { formatMoney } from '../utils/moneyUtils';

function CustomerDetail() {
  const [customer, setCustomer] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    fetchCustomer();
    fetchCustomerInvoices();
  }, [id]);

  const fetchCustomer = async () => {
    try {
      const response = await axiosInstance.get(`/api/customers/${id}`);
      setCustomer(response.data);
    } catch (error) {
      console.error('Error fetching customer:', error);
    }
  };

  const fetchCustomerInvoices = async () => {
    try {
      const response = await axiosInstance.get('/api/invoices');
      const customerInvoices = response.data.filter(invoice => invoice.customer._id === id);
      setInvoices(customerInvoices);
    } catch (error) {
      console.error('Error fetching customer invoices:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'debt':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'paid':
        return 'Đã Thanh Toán';
      case 'debt':
        return 'Công Nợ';
      default:
        return status;
    }
  };

  const getInvoiceTypeText = (type) => {
    switch (type) {
      case 'retail':
        return 'Hoá Đơn Bán Lẻ';
      case 'wholesale':
        return 'Hóa Đơn Bán Sỉ';
      default:
        return type;
    }
  };

  const getCustomerTypeText = (type) => {
    switch (type) {
      case 'retail':
        return 'Khách Lẻ';
      case 'wholesale':
        return 'Khách Sỉ';
      default:
        return type;
    }
  };

  const getCustomerTypeColor = (type) => {
    switch (type) {
      case 'retail':
        return 'primary';
      case 'wholesale':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const renderMobileInvoiceView = () => (
    <Box>
      {invoices.map((invoice) => (
        <Card key={invoice._id} sx={{ mb: 2 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle1" fontWeight="bold">
                {getInvoiceTypeText(invoice.invoiceType)}
              </Typography>
              <Chip
                label={getStatusText(invoice.status)}
                color={getStatusColor(invoice.status)}
                size="small"
              />
            </Box>
            <Typography variant="body2" color="text.secondary">
              Tổng tiền: {formatMoney(invoice.totalAmount)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Ngày: {new Date(invoice.createdAt).toLocaleDateString('vi-VN')}
            </Typography>
            <Box mt={1}>
              <Button
                size="small"
                onClick={() => navigate(`/invoices/${invoice._id}`)}
                variant="outlined"
                fullWidth
              >
                Xem Chi Tiết
              </Button>
            </Box>
          </CardContent>
        </Card>
      ))}
      {invoices.length === 0 && (
        <Typography align="center" color="text.secondary">
          Không có hóa đơn nào
        </Typography>
      )}
    </Box>
  );

  const renderDesktopInvoiceView = () => (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Loại Hóa Đơn</TableCell>
            <TableCell>Số Sản Phẩm</TableCell>
            <TableCell>Tổng Tiền</TableCell>
            <TableCell>Trạng Thái</TableCell>
            <TableCell>Ngày Xuất Hoá Đơn</TableCell>
            <TableCell>Thao Tác</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow key={invoice._id}>
              <TableCell>{getInvoiceTypeText(invoice.invoiceType)}</TableCell>
              <TableCell>{invoice.items.length}</TableCell>
              <TableCell>{formatMoney(invoice.totalAmount)}</TableCell>
              <TableCell>
                <Chip
                  label={getStatusText(invoice.status)}
                  color={getStatusColor(invoice.status)}
                  size="small"
                />
              </TableCell>
              <TableCell>
                {new Date(invoice.createdAt).toLocaleDateString('vi-VN')}
              </TableCell>
              <TableCell>
                <Button
                  size="small"
                  onClick={() => navigate(`/invoices/${invoice._id}`)}
                >
                  Xem Chi Tiết
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {invoices.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} align="center">
                Không có hóa đơn nào
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  if (!customer) {
    return <Typography>Đang tải...</Typography>;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/customers')}
        sx={{ mb: 2 }}
      >
        Quay lại
      </Button>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography 
          variant="h5" 
          gutterBottom
          sx={{
            fontWeight: 600,
            color: 'primary.main',
            mb: 3
          }}
        >
          Hồ Sơ Khách Hàng
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1" color="text.secondary">
              Tên
            </Typography>
            <Typography variant="body1" gutterBottom>
              {customer.name}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1" color="text.secondary">
              Loại Khách Hàng
            </Typography>
            <Chip
              label={getCustomerTypeText(customer.customerType)}
              color={getCustomerTypeColor(customer.customerType)}
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1" color="text.secondary">
              Email
            </Typography>
            <Typography variant="body1" gutterBottom>
              {customer.email || '-'}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1" color="text.secondary">
              Số Điện Thoại
            </Typography>
            <Typography variant="body1" gutterBottom>
              {customer.phone || '-'}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1" color="text.secondary">
              Mã Số Thuế
            </Typography>
            <Typography variant="body1" gutterBottom>
              {customer.taxCode || '-'}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle1" color="text.secondary">
              Địa Chỉ
            </Typography>
            <Typography variant="body1" gutterBottom>
              {customer.address || '-'}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography 
          variant="h5" 
          gutterBottom
          sx={{
            fontWeight: 600,
            color: 'primary.main',
            mb: 3
          }}
        >
          Lịch Sử Hóa Đơn
        </Typography>
        {isMobile ? renderMobileInvoiceView() : renderDesktopInvoiceView()}
      </Paper>
    </Container>
  );
}

export default CustomerDetail; 