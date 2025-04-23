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
  Box
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import axiosInstance from '../utils/axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

function ProductList() {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axiosInstance.get('/api/products');
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
                <TableCell>{product.importPrice.toLocaleString('vi-VN')} VNĐ</TableCell>
                <TableCell>{product.retailPrice.toLocaleString('vi-VN')} VNĐ</TableCell>
                <TableCell>{product.wholesalePrice.toLocaleString('vi-VN')} VNĐ</TableCell>
                <TableCell>{product.stock}</TableCell>
                <TableCell>{(product.importPrice * product.stock).toLocaleString('vi-VN')} VNĐ</TableCell>
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
    </Container>
  );
}

export default ProductList; 