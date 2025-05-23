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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert
} from '@mui/material';
import axiosInstance from '../utils/axios';

function CustomerForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    taxCode: '',
    customerType: 'wholesale'
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const fetchCustomer = useCallback(async () => {
    try {
      const response = await axiosInstance.get(`/api/customers/${id}`);
      setFormData(response.data);
    } catch (error) {
      console.error('Error fetching customer:', error);
      setError('Không thể tải thông tin khách hàng. Vui lòng thử lại sau.');
    }
  }, [id]);

  useEffect(() => {
    if (isEdit) {
      fetchCustomer();
    }
  }, [isEdit, fetchCustomer]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isEdit) {
        await axiosInstance.patch(`/api/customers/${id}`, formData);
      } else {
        await axiosInstance.post('/api/customers', formData);
      }
      navigate('/customers');
    } catch (error) {
      console.error('Error saving customer:', error);
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('Có lỗi xảy ra khi lưu thông tin khách hàng. Vui lòng thử lại.');
      }
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
            {isEdit ? 'Cập Nhật Hồ Sơ Khách Hàng' : 'Tạo Hồ Sơ Khách Hàng'}
          </Typography>
        </Box>
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
                label="Tên"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Loại Khách Hàng *</InputLabel>
                <Select
                  name="customerType"
                  value={formData.customerType}
                  onChange={handleChange}
                  required
                >
                  <MenuItem value="retail">Khách Hàng Lẻ</MenuItem>
                  <MenuItem value="wholesale">Khách Hàng Sỉ</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Số Điện Thoại"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Địa Chỉ"
                name="address"
                value={formData.address}
                onChange={handleChange}
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Mã Số Thuế"
                name="taxCode"
                value={formData.taxCode}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <Box display="flex" justifyContent="flex-end" gap={2}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/customers')}
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

export default CustomerForm; 