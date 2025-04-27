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
  Card,
  CardContent,
  Grid,
  useMediaQuery,
  useTheme,
  Divider,
  TextField
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import axiosInstance from '../utils/axios';
import { formatMoney } from '../utils/moneyUtils';

function ProductList() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axiosInstance.get('/api/products');
      console.log('Products data:', response.data);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

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
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderMobileView = () => (
    <Grid container spacing={2}>
      {filteredProducts.map((product) => (
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
                    {product.importPrice ? formatMoney(product.importPrice) : '0'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">
                    Giá bán lẻ:
                  </Typography>
                  <Typography variant="body1">
                    {product.retailPrice ? formatMoney(product.retailPrice) : '0'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">
                    Giá bán sỉ:
                  </Typography>
                  <Typography variant="body1">
                    {product.wholesalePrice ? formatMoney(product.wholesalePrice) : '0'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">
                    Tồn kho:
                  </Typography>
                  <Typography variant="body1">
                    {product.stock || 0}
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

  const renderDesktopView = () => (
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
            {filteredProducts.map((product) => (
              <TableRow key={product._id}>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.code || '-'}</TableCell>
                <TableCell>{product.importPrice ? formatMoney(product.importPrice) : '0'}</TableCell>
                <TableCell>{product.retailPrice ? formatMoney(product.retailPrice) : '0'}</TableCell>
                <TableCell>{product.wholesalePrice ? formatMoney(product.wholesalePrice) : '0'}</TableCell>
                <TableCell>{product.stock}</TableCell>
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

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Danh Sách Sản Phẩm</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate('/products/new')}
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
      {isMobile ? renderMobileView() : renderDesktopView()}
    </Container>
  );
}

export default ProductList; 