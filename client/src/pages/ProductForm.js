import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Grid,
  Alert,
  CircularProgress
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
  const [loading, setLoading] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState('');
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
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
      setError('Không thể tải thông tin sản phẩm. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const checkDuplicateProduct = useCallback(async (name) => {
    if (!name) return;
    try {
      const response = await axiosInstance.get('/api/products', {
        params: {
          search: name,
          limit: 1
        }
      });
      
      if (response.data.products.length > 0) {
        const existingProduct = response.data.products[0];
        if (isEdit && existingProduct._id === id) {
          setDuplicateWarning('');
          return;
        }
        setDuplicateWarning(`Cảnh báo: Đã tồn tại sản phẩm với tên "${existingProduct.name}" trong hệ thống.`);
      } else {
        setDuplicateWarning('');
      }
    } catch (error) {
      console.error('Error checking duplicate product:', error);
    }
  }, [isEdit, id]);

  useEffect(() => {
    if (isEdit) {
      fetchProduct();
    }
  }, [isEdit, fetchProduct]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.name) {
        checkDuplicateProduct(formData.name);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.name, checkDuplicateProduct]);

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
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography 
            variant="h4"
            sx={{
              fontWeight: 600,
              color: 'primary.main',
              textAlign: 'center'
            }}
          >
            {isEdit ? 'Cập Nhật Sản Phẩm' : 'Tạo Sản Phẩm Mới'}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {duplicateWarning && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {duplicateWarning}
          </Alert>
        )}

        {loading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : (
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
                    disabled={loading}
                  >
                    Hủy
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={loading}
                  >
                    {isEdit ? 'Cập Nhật' : 'Thêm Mới'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        )}
      </Paper>
    </Container>
  );
}

export default ProductForm;