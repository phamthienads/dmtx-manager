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
  Divider,
  TableSortLabel
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import axiosInstance from '../utils/axios';
import { formatMoney, calculateInvoiceTotal } from '../utils/moneyUtils';

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
      // Sắp xếp theo ngày tạo giảm dần (mới nhất lên đầu)
      const sortedInvoices = response.data.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      setInvoices(sortedInvoices);
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
        return 'Lẻ';
      case 'wholesale':
        return 'Sỉ';
      default:
        return type;
    }
  };

  // Tính tổng tiền sau chiết khấu
  const calculateTotal = (items) => {
    return calculateInvoiceTotal(items);
  };

  const renderMobileView = () => (
    <Box>
      {invoices.map((invoice) => (
        <Card key={invoice._id} sx={{ mb: 2 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle1" fontWeight="bold">
                {invoice.customer.name}
              </Typography>
              <Chip
                label={getStatusText(invoice.status)}
                color={getStatusColor(invoice.status)}
                size="small"
              />
            </Box>
            <Typography variant="body2" color="text.secondary">
              Mã HĐ: {invoice.invoiceCode || '-'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Loại: {getInvoiceTypeText(invoice.invoiceType)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Ngày: {new Date(invoice.createdAt).toLocaleDateString('vi-VN')}
            </Typography>
            <Typography variant="body2" fontWeight="bold">
              Tổng: {formatMoney(invoice.totalAmount)}
            </Typography>
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
          </CardContent>
        </Card>
      ))}
    </Box>
  );

  const renderDesktopView = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Mã HĐ</TableCell>
            <TableCell>Khách Hàng</TableCell>
            <TableCell>Loại HĐ</TableCell>
            <TableCell>Ngày Tạo</TableCell>
            <TableCell>Tổng Tiền</TableCell>
            <TableCell>Trạng Thái</TableCell>
            <TableCell>Thao Tác</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow key={invoice._id}>
              <TableCell>{invoice.invoiceCode || '-'}</TableCell>
              <TableCell>{invoice.customer.name}</TableCell>
              <TableCell>{getInvoiceTypeText(invoice.invoiceType)}</TableCell>
              <TableCell>{new Date(invoice.createdAt).toLocaleDateString('vi-VN')}</TableCell>
              <TableCell>{formatMoney(invoice.totalAmount)}</TableCell>
              <TableCell>
                <Chip
                  label={getStatusText(invoice.status)}
                  color={getStatusColor(invoice.status)}
                  size="small"
                />
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