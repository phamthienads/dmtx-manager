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
  Card,
  CardContent,
  Grid,
  useMediaQuery,
  useTheme,
  Divider,
  TextField,
  CircularProgress,
  Alert
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import axiosInstance from '../utils/axios';
import { formatMoney } from '../utils/moneyUtils';
import Pagination from '../components/Pagination';

function ProductList() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get('/api/products', {
        params: {
          page: page + 1,
          limit: rowsPerPage,
          search: searchTerm
        }
      });
      
      if (response.data && Array.isArray(response.data.products)) {
        setProducts(response.data.products);
        setTotalProducts(response.data.pagination.total || 0);
      } else {
        setProducts([]);
        setTotalProducts(0);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.');
      setProducts([]);
      setTotalProducts(0);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchTerm]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      try {
        await axiosInstance.delete(`/api/products/${id}`);
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedProducts = products;

  const renderMobileView = (products) => (
    <Grid container spacing={2}>
      {products.map((product) => (
        <Grid item xs={12} key={product._id}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="h6" gutterBottom>
                    {product.name}
                  </Typography>
                  <Typography color="textSecondary" gutterBottom>
                    Mã: {product.code || '-'}
                  </Typography>
                </Box>
                <Box>
                  <IconButton
                    color="primary"
                    onClick={() => navigate(`/products/edit/${product._id}`)}
                    size="small"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDelete(product._id)}
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
                    Giá nhập:
                  </Typography>
                  <Typography variant="body1">
                    {product.importPrice ? formatMoney(product.importPrice) : '-'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">
                    Giá bán lẻ:
                  </Typography>
                  <Typography variant="body1">
                    {product.retailPrice ? formatMoney(product.retailPrice) : '-'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">
                    Giá bán sỉ:
                  </Typography>
                  <Typography variant="body1">
                    {product.wholesalePrice ? formatMoney(product.wholesalePrice) : '-'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">
                    Tồn kho:
                  </Typography>
                  <Typography variant="body1">
                    {product.stock || '-'}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="textSecondary">
                    Tổng tiền hàng:
                  </Typography>
                  <Typography variant="body1" color="primary">
                    {formatMoney((product.importPrice || 0) * (product.stock || 0))}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const renderDesktopView = (products) => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Tên Sản Phẩm</TableCell>
            <TableCell>Mã Sản Phẩm</TableCell>
            <TableCell>Giá Nhập</TableCell>
            <TableCell>Giá Bán Lẻ</TableCell>
            <TableCell>Giá Bán Sỉ</TableCell>
            <TableCell>Tồn Kho</TableCell>
            <TableCell>Tổng Tiền Hàng</TableCell>
            <TableCell>Thao Tác</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product._id}>
              <TableCell>{product.name}</TableCell>
              <TableCell>{product.code || '-'}</TableCell>
              <TableCell>{product.importPrice ? formatMoney(product.importPrice) : '-'}</TableCell>
              <TableCell>{product.retailPrice ? formatMoney(product.retailPrice) : '-'}</TableCell>
              <TableCell>{product.wholesalePrice ? formatMoney(product.wholesalePrice) : '-'}</TableCell>
              <TableCell>{product.stock || '-'}</TableCell>
              <TableCell>{formatMoney(product.importPrice * product.stock)}</TableCell>
              <TableCell>
                <IconButton
                  color="primary"
                  onClick={() => navigate(`/products/edit/${product._id}`)}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  color="error"
                  onClick={() => handleDelete(product._id)}
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
      total={totalProducts}
      page={page}
      rowsPerPage={rowsPerPage}
      onPageChange={handleChangePage}
      onRowsPerPageChange={handleChangeRowsPerPage}
      rowsPerPageOptions={[20, 50, 100]}
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
          Quản Lý Sản Phẩm
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate('/products/new')}
          sx={{ 
            width: { xs: '100%', sm: 'auto' },
            minWidth: { xs: '100%', sm: '200px' }
          }}
        >
          Thêm Sản Phẩm
        </Button>
      </Box>
      <Box mb={3}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Tìm kiếm sản phẩm..."
          value={searchTerm}
          onChange={handleSearch}
          sx={{ mb: 2 }}
        />
      </Box>
      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      ) : isMobile ? (
        <>
          {renderMobileView(paginatedProducts)}
          {renderPagination()}
        </>
      ) : (
        <>
          {renderDesktopView(paginatedProducts)}
          {renderPagination()}
        </>
      )}
    </Container>
  );
}

export default ProductList; 