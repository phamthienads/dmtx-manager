import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert
} from '@mui/material';
import axiosInstance from '../utils/axios';

function Login() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post('/api/auth/login', formData);
      const { token, user } = response.data;
      
      // Lưu token và thông tin user vào localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Chuyển hướng đến trang chủ
      navigate('/');
    } catch (error) {
      setError(error.response?.data?.message || 'Có lỗi xảy ra khi đăng nhập');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Đăng Nhập
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Tên đăng nhập"
            name="username"
            value={formData.username}
            onChange={handleChange}
            margin="normal"
            required
          />
          
          <TextField
            fullWidth
            label="Mật khẩu"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            margin="normal"
            required
          />

          <Box sx={{ mt: 3 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              size="large"
            >
              Đăng Nhập
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
}

export default Login; 