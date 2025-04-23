import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Grid,
  Alert
} from '@mui/material';
import axiosInstance from '../utils/axios';

function ProductForm() {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    importPrice: '',
    retailPrice: '',
    wholesalePrice: '',
    stock: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  useEffect(() => {
    if (isEdit) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await axiosInstance.get(`/api/products/${id}`);
      setFormData({
        ...response.data,
        importPrice: response.data.importPrice !== null ? response.data.importPrice : '',
        retailPrice: response.data.retailPrice !== null ? response.data.retailPrice : '',
        wholesalePrice: response.data.wholesalePrice !== null ? response.data.wholesalePrice : '',
        stock: response.data.stock || ''
      });
    } catch (error) {
      console.error('Error fetching product:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) {
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        importPrice: formData.importPrice ? Number(formData.importPrice) : null,
        retailPrice: formData.retailPrice ? Number(formData.retailPrice) : null,
        wholesalePrice: formData.wholesalePrice ? Number(formData.wholesalePrice) : null,
        stock: formData.stock ? Number(formData.stock) : 0
      };

      if (isEdit) {
        await axiosInstance.patch(`/api/products/${id}`, data);
      } else {
        await axiosInstance.post('/api/products', data);
      }
      navigate('/products');
    } catch (error) {
      if (error.response?.data?.error?.includes('code')) {
        setError(`Mã sản phẩm "${formData.code}" đã tồn tại trong hệ thống. Vui lòng chọn mã khác.`);
      } else if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('Có lỗi xảy ra khi lưu sản phẩm. Vui lòng thử lại.');
      }
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          {isEdit ? 'Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tên Sản Phẩm"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Mã Sản Phẩm"
                name="code"
                value={formData.code}
                onChange={handleChange}
                error={error?.includes('Mã sản phẩm')}
                helperText={error?.includes('Mã sản phẩm') ? error : ''}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Giá Nhập"
                name="importPrice"
                type="number"
                value={formData.importPrice}
                onChange={handleChange}
                InputProps={{
                  endAdornment: 'VNĐ'
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Giá Bán Lẻ"
                name="retailPrice"
                type="number"
                value={formData.retailPrice}
                onChange={handleChange}
                InputProps={{
                  endAdornment: 'VNĐ'
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Giá Bán Sỉ"
                name="wholesalePrice"
                type="number"
                value={formData.wholesalePrice}
                onChange={handleChange}
                InputProps={{
                  endAdornment: 'VNĐ'
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tồn Kho"
                name="stock"
                type="number"
                value={formData.stock}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <Box display="flex" justifyContent="flex-end" gap={2}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/products')}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                >
                  {isEdit ? 'Cập Nhật' : 'Thêm Mới'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
}

export default ProductForm;