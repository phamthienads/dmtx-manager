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
  TextField,
  InputAdornment,
  Card,
  CardContent,
  Grid,
  useMediaQuery,
  useTheme,
  Divider,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon, Visibility as VisibilityIcon, Search as SearchIcon, ArrowUpward as ArrowUpwardIcon, ArrowDownward as ArrowDownwardIcon } from '@mui/icons-material';
import axiosInstance from '../utils/axios';
import Pagination from '../components/Pagination';

function CustomerList() {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [sortOrder, setSortOrder] = useState('name');
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const fetchCustomers = useCallback(async () => {
    try {
      const response = await axiosInstance.get(`/api/customers`, {
        params: {
          search: searchTerm,
          page: page + 1,
          limit: rowsPerPage,
          sort: sortOrder
        }
      });
      
      if (response.data && Array.isArray(response.data.customers)) {
        setCustomers(response.data.customers);
        setTotalCustomers(response.data.total || 0);
      } else {
        console.error('Invalid customers data:', response.data);
        setCustomers([]);
        setTotalCustomers(0);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      setCustomers([]);
      setTotalCustomers(0);
    }
  }, [page, rowsPerPage, searchTerm, sortOrder]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setPage(0);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa khách hàng này?')) {
      try {
        await axiosInstance.delete(`/api/customers/${id}`);
        fetchCustomers();
      } catch (error) {
        console.error('Error deleting customer:', error);
      }
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

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSort = () => {
    setSortOrder(sortOrder === 'lastInvoice' ? '-lastInvoice' : 'lastInvoice');
  };

  const renderMobileView = () => (
    <Grid container spacing={2}>
      {customers.map((customer) => (
        <Grid item xs={12} key={customer._id}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography 
                    variant="h6" 
                    gutterBottom
                    sx={{ 
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      '&:hover': {
                        color: 'primary.main'
                      }
                    }}
                    onClick={() => navigate(`/customers/${customer._id}`)}
                  >
                    {customer.name}
                  </Typography>
                  <Chip
                    label={getCustomerTypeText(customer.customerType)}
                    color={getCustomerTypeColor(customer.customerType)}
                    size="small"
                    sx={{ mb: 1 }}
                  />
                </Box>
                <Box>
                  <IconButton
                    color="primary"
                    onClick={() => navigate(`/customers/${customer._id}`)}
                    size="small"
                  >
                    <VisibilityIcon />
                  </IconButton>
                  <IconButton
                    color="primary"
                    onClick={() => navigate(`/customers/edit/${customer._id}`)}
                    size="small"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDelete(customer._id)}
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Grid container spacing={1}>
                <Grid item xs={12}>
                  <Typography variant="body2" color="textSecondary">
                    Số điện thoại:
                  </Typography>
                  <Typography variant="body1">
                    {customer.phone || '-'}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="textSecondary">
                    Địa chỉ:
                  </Typography>
                  <Typography variant="body1">
                    {customer.address || '-'}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="textSecondary">
                    Hóa đơn lần cuối:
                  </Typography>
                  {customer.lastInvoice ? (
                    <Chip
                      label={new Date(customer.lastInvoice.createdAt).toLocaleDateString('vi-VN')}
                      color={
                        new Date(customer.lastInvoice.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) 
                          ? 'success' 
                          : new Date(customer.lastInvoice.createdAt) > new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
                            ? 'warning'
                            : 'error'
                      }
                      size="small"
                      sx={{ mt: 0.5, fontWeight: 'medium' }}
                    />
                  ) : (
                    <Typography variant="body1">-</Typography>
                  )}
                </Grid>
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
            <TableCell>Tên</TableCell>
            <TableCell>Loại Khách Hàng</TableCell>
            <TableCell>Số Điện Thoại</TableCell>
            <TableCell>Địa Chỉ</TableCell>
            <TableCell>
              <Box display="flex" alignItems="center" sx={{ cursor: 'pointer' }} onClick={handleSort}>
                Hóa Đơn Lần Cuối
                {sortOrder === 'lastInvoice' ? <ArrowUpwardIcon fontSize="small" /> : 
                 sortOrder === '-lastInvoice' ? <ArrowDownwardIcon fontSize="small" /> : null}
              </Box>
            </TableCell>
            <TableCell>Thao Tác</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {customers.map((customer) => (
            <TableRow key={customer._id}>
              <TableCell>
                <Typography
                  sx={{ 
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    '&:hover': {
                      color: 'primary.main'
                    }
                  }}
                  onClick={() => navigate(`/customers/${customer._id}`)}
                >
                  {customer.name}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip
                  label={getCustomerTypeText(customer.customerType)}
                  color={getCustomerTypeColor(customer.customerType)}
                  size="small"
                />
              </TableCell>
              <TableCell>{customer.phone || '-'}</TableCell>
              <TableCell>{customer.address || '-'}</TableCell>
              <TableCell>
                {customer.lastInvoice ? (
                  <Chip
                    label={new Date(customer.lastInvoice.createdAt).toLocaleDateString('vi-VN')}
                    color={
                      new Date(customer.lastInvoice.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) 
                        ? 'success' 
                        : new Date(customer.lastInvoice.createdAt) > new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
                          ? 'warning'
                          : 'error'
                    }
                    size="small"
                    sx={{ fontWeight: 'medium' }}
                  />
                ) : '-'}
              </TableCell>
              <TableCell>
                <IconButton
                  color="primary"
                  onClick={() => navigate(`/customers/${customer._id}`)}
                >
                  <VisibilityIcon />
                </IconButton>
                <IconButton
                  color="primary"
                  onClick={() => navigate(`/customers/edit/${customer._id}`)}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  color="error"
                  onClick={() => handleDelete(customer._id)}
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
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
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
          Quản Lý Khách Hàng
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate('/customers/new')}
          sx={{ 
            width: { xs: '100%', sm: 'auto' },
            minWidth: { xs: '100%', sm: '200px' }
          }}
        >
          Thêm Khách Hàng
        </Button>
      </Box>

      <Box mb={3}>
        <TextField
          fullWidth
          placeholder="Tìm kiếm theo tên hoặc số điện thoại..."
          value={searchTerm}
          onChange={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {isMobile ? renderMobileView() : renderDesktopView()}

      <Pagination
        total={totalCustomers}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[20, 50, 100]}
      />
    </Container>
  );
}

export default CustomerList;