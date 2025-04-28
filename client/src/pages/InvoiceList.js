import React, { useState, useEffect, useCallback } from 'react';
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
  CircularProgress,
  Alert
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import axiosInstance from '../utils/axios';
import { formatMoney } from '../utils/moneyUtils';
import Pagination from '../components/Pagination';

function InvoiceList() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalInvoices, setTotalInvoices] = useState(0);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get('/api/invoices', {
        params: {
          page: page + 1,
          limit: rowsPerPage
        }
      });
      
      if (response.data && Array.isArray(response.data.invoices)) {
        setInvoices(response.data.invoices);
        setTotalInvoices(response.data.total || 0);
      } else {
        setInvoices([]);
        setTotalInvoices(0);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
      setError('Không thể tải danh sách hóa đơn. Vui lòng thử lại sau.');
      setInvoices([]);
      setTotalInvoices(0);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

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

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const renderMobileView = (invoices) => (
    <Grid container spacing={2}>
      {invoices.map((invoice) => (
        <Grid item xs={12} key={invoice._id}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography 
                    variant="h6" 
                    gutterBottom
                    sx={{ 
                      cursor: 'pointer', 
                      color: 'primary.main',
                      '&:hover': { textDecoration: 'underline' }
                    }}
                    onClick={() => navigate(`/invoices/${invoice._id}`)}
                  >
                    {invoice.invoiceCode || 'Chưa có mã'}
                  </Typography>
                  <Typography color="textSecondary" gutterBottom>
                    {invoice.customer ? invoice.customer.name : 'Khách hàng không xác định'}
                  </Typography>
                </Box>
                <Box>
                  <Chip 
                    label={getStatusText(invoice.status)} 
                    color={getStatusColor(invoice.status)} 
                    size="small" 
                    sx={{ mb: 1 }}
                  />
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
              </Box>
              <Divider sx={{ my: 1 }} />
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">
                    Loại:
                  </Typography>
                  <Typography variant="body1">
                    {getInvoiceTypeText(invoice.invoiceType)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">
                    Ngày tạo:
                  </Typography>
                  <Typography variant="body1">
                    {new Date(invoice.createdAt).toLocaleDateString('vi-VN')}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="textSecondary">
                    Tổng tiền:
                  </Typography>
                  <Typography variant="body1" color="primary">
                    {formatMoney(invoice.totalAmount)}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const renderDesktopView = (invoices) => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Mã Hóa Đơn</TableCell>
            <TableCell>Khách Hàng</TableCell>
            <TableCell>Loại</TableCell>
            <TableCell>Ngày Tạo</TableCell>
            <TableCell>Trạng Thái</TableCell>
            <TableCell align="right">Tổng Tiền</TableCell>
            <TableCell>Thao Tác</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow key={invoice._id}>
              <TableCell>
                <Typography
                  sx={{ 
                    cursor: 'pointer', 
                    color: 'primary.main',
                    '&:hover': { textDecoration: 'underline' }
                  }}
                  onClick={() => navigate(`/invoices/${invoice._id}`)}
                >
                  {invoice.invoiceCode || 'Chưa có mã'}
                </Typography>
              </TableCell>
              <TableCell>{invoice.customer ? invoice.customer.name : 'Khách hàng không xác định'}</TableCell>
              <TableCell>{getInvoiceTypeText(invoice.invoiceType)}</TableCell>
              <TableCell>{new Date(invoice.createdAt).toLocaleDateString('vi-VN')}</TableCell>
              <TableCell>
                <Chip 
                  label={getStatusText(invoice.status)} 
                  color={getStatusColor(invoice.status)} 
                  size="small" 
                />
              </TableCell>
              <TableCell align="right">{formatMoney(invoice.totalAmount)}</TableCell>
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

  const renderPagination = () => (
    <Pagination
      total={totalInvoices}
      page={page}
      rowsPerPage={rowsPerPage}
      onPageChange={handleChangePage}
      onRowsPerPageChange={handleChangeRowsPerPage}
      rowsPerPageOptions={[10, 20, 50]}
    />
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box 
        display="flex" 
        flexDirection={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between" 
        alignItems={{ xs: 'stretch', sm: 'center' }} 
        mb={3}
        gap={2}
      >
        <Typography 
          variant="h4"
          sx={{
            fontWeight: 600,
            color: 'primary.main',
            textAlign: 'center',
            fontSize: { xs: '1.5rem', sm: '2.125rem' },
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          Quản Lý Hóa Đơn
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate('/invoices/new')}
          sx={{ 
            width: { xs: '100%', sm: 'auto' },
            minWidth: { xs: '100%', sm: '200px' }
          }}
        >
          Tạo Hóa Đơn
        </Button>
      </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : isMobile ? (
        <>
          {renderMobileView(invoices)}
          {renderPagination()}
        </>
      ) : (
        <>
          {renderDesktopView(invoices)}
          {renderPagination()}
        </>
      )}
    </Container>
  );
}

export default InvoiceList; 