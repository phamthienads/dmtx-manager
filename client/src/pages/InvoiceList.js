import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Typography,
  Box,
  Chip,
  Card,
  CardContent,
  Grid,
  useMediaQuery,
  useTheme,
  Divider
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import axiosInstance from '../utils/axios';

function InvoiceList() {
  const [invoices, setInvoices] = useState([]);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await axiosInstance.get('/api/invoices');
      setInvoices(response.data);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa hóa đơn này?')) {
      try {
        await axiosInstance.delete(`/api/invoices/${id}`);
        fetchInvoices();
      } catch (error) {
        console.error('Error deleting invoice:', error);
      }
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
        return 'Hóa Đơn Bán Lẻ';
      case 'wholesale':
        return 'Hóa Đơn Bán Sỉ';
      default:
        return type;
    }
  };

  // Tính tổng tiền sau chiết khấu
  const calculateTotal = (items) => {
    const subtotal = items.reduce((total, item) => {
      const itemTotal = Number(item.price) * Number(item.quantity);
      return total + (isNaN(itemTotal) ? 0 : itemTotal);
    }, 0);
    const discount = items.reduce((total, item) => {
      const itemTotal = Number(item.price) * Number(item.quantity);
      const discountAmount = (itemTotal * Number(item.discount || 0) / 100);
      return total + Math.round(discountAmount / 1000) * 1000;
    }, 0);
    const total = subtotal - discount;
    return isNaN(total) ? 0 : total;
  };

  const renderMobileView = () => (
    <Grid container spacing={2}>
      {invoices.map((invoice) => (
        <Grid item xs={12} key={invoice._id}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="h6" gutterBottom>
                    {invoice.customer?.name || '-'}
                  </Typography>
                  <Box display="flex" gap={1} mb={1}>
                    <Chip
                      label={getInvoiceTypeText(invoice.invoiceType)}
                      color="primary"
                      size="small"
                    />
                    <Chip
                      label={getStatusText(invoice.status)}
                      color={getStatusColor(invoice.status)}
                      size="small"
                    />
                  </Box>
                </Box>
                <Box>
                  <IconButton
                    color="primary"
                    onClick={() => navigate(`/invoices/${invoice._id}`)}
                    size="small"
                  >
                    <VisibilityIcon />
                  </IconButton>
                  <IconButton
          color="primary"
                    onClick={() => navigate(`/invoices/edit/${invoice._id}`)}
                    size="small"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDelete(invoice._id)}
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
      </Box>
              <Divider sx={{ my: 1 }} />
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">
                    Số sản phẩm:
                  </Typography>
                  <Typography variant="body1">
                    {invoice.items.length}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">
                    Tổng tiền:
                  </Typography>
                  <Typography variant="body1" color="primary" fontWeight="bold">
                    {calculateTotal(invoice.items).toLocaleString('vi-VN')} VNĐ
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">
                    Ngày xuất:
                  </Typography>
                  <Typography variant="body1">
                    {new Date(invoice.createdAt).toLocaleDateString('vi-VN')}
                  </Typography>
                </Grid>
                {invoice.status === 'debt' && invoice.debtEndDate && (
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      Hạn thanh toán:
                    </Typography>
                    <Typography variant="body1" color="error">
                      {new Date(invoice.debtEndDate).toLocaleDateString('vi-VN')}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const renderDesktopView = () => (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Khách Hàng</TableCell>
              <TableCell>Loại Hóa Đơn</TableCell>
              <TableCell>Số Sản Phẩm</TableCell>
              <TableCell>Tổng Tiền</TableCell>
              <TableCell>Trạng Thái</TableCell>
              <TableCell>Hạn Thanh Toán</TableCell>
              <TableCell>Ngày Xuất Hoá Đơn</TableCell>
              <TableCell>Thao Tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice._id}>
                <TableCell>{invoice.customer?.name || '-'}</TableCell>
                <TableCell>{getInvoiceTypeText(invoice.invoiceType)}</TableCell>
                <TableCell>{invoice.items.length}</TableCell>
                <TableCell>{calculateTotal(invoice.items).toLocaleString('vi-VN')} VNĐ</TableCell>
                <TableCell>
                  <Chip
                    label={getStatusText(invoice.status)}
                    color={getStatusColor(invoice.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {invoice.status === 'debt' && invoice.debtEndDate ? (
                    new Date(invoice.debtEndDate).toLocaleDateString('vi-VN')
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      -
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  {new Date(invoice.createdAt).toLocaleDateString('vi-VN')}
                </TableCell>
                <TableCell>
                  <IconButton
                    color="primary"
                    onClick={() => navigate(`/invoices/${invoice._id}`)}
                  >
                    <VisibilityIcon />
                  </IconButton>
                  <IconButton
                    color="primary"
                    onClick={() => navigate(`/invoices/edit/${invoice._id}`)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDelete(invoice._id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Danh Sách Hóa Đơn</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate('/invoices/new')}
        >
          Tạo Hóa Đơn Mới
        </Button>
      </Box>
      {isMobile ? renderMobileView() : renderDesktopView()}
    </Container>
  );
}

export default InvoiceList; 