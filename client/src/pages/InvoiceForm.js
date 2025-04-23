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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import axiosInstance from '../utils/axios';

function InvoiceForm() {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    customer: '',
    invoiceType: 'retail',
    items: [{ product: '', quantity: 1, price: 0, discount: 0 }],
    status: 'paid',
    debtStartDate: new Date().toISOString().split('T')[0],
    debtEndDate: ''
  });
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  useEffect(() => {
    fetchCustomers();
    fetchProducts();
    if (isEdit) {
      fetchInvoice();
    }
  }, [id]);

  const fetchCustomers = async () => {
    try {
      const response = await axiosInstance.get('/api/customers');
      setCustomers(response.data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axiosInstance.get('/api/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchInvoice = async () => {
    try {
      const response = await axiosInstance.get(`/api/invoices/${id}`);
      setFormData({
        customer: response.data.customer._id,
        invoiceType: response.data.invoiceType,
        items: response.data.items.map(item => ({
          product: item.product._id,
          quantity: item.quantity,
          price: item.price,
          discount: item.discount || 0
        })),
        status: response.data.status,
        debtStartDate: response.data.debtStartDate || new Date().toISOString().split('T')[0],
        debtEndDate: response.data.debtEndDate ? new Date(response.data.debtEndDate).toISOString().split('T')[0] : ''
      });
    } catch (error) {
      console.error('Error fetching invoice:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Nếu thay đổi khách hàng, tự động cập nhật loại hóa đơn
    if (name === 'customer') {
      const selectedCustomer = customers.find(c => c._id === value);
      if (selectedCustomer) {
        setFormData(prev => ({
          ...prev,
          invoiceType: selectedCustomer.customerType
        }));
      }
    }

    // Nếu thay đổi loại hóa đơn, cập nhật lại giá cho tất cả sản phẩm
    if (name === 'invoiceType') {
      const newItems = formData.items.map(item => {
        if (item.product) {
          const selectedProduct = products.find(p => p._id === item.product);
          if (selectedProduct) {
            return {
              ...item,
              price: value === 'wholesale' ? selectedProduct.wholesalePrice : selectedProduct.retailPrice
            };
          }
        }
        return item;
      });
      setFormData(prev => ({
        ...prev,
        items: newItems
      }));
    }

    // Nếu thay đổi trạng thái thành công nợ, tự động lấy ngày hiện tại làm ngày bắt đầu
    if (name === 'status' && value === 'debt') {
      setFormData(prev => ({
        ...prev,
        debtStartDate: new Date().toISOString().split('T')[0]
      }));
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    
    // Xử lý giá trị null/undefined cho các trường số
    if (field === 'quantity' || field === 'price' || field === 'discount') {
      const numValue = value === '' ? 0 : Number(value);
      newItems[index][field] = isNaN(numValue) ? 0 : numValue;
    } else {
      newItems[index][field] = value;
    }
    
    // Nếu thay đổi sản phẩm, tự động điền giá mặc định
    if (field === 'product') {
      const selectedProduct = products.find(p => p._id === value);
      if (selectedProduct) {
        const price = formData.invoiceType === 'wholesale' 
          ? selectedProduct.wholesalePrice 
          : selectedProduct.retailPrice;
        newItems[index].price = price || 0;
      } else {
        newItems[index].price = 0;
      }
    }
    
    setFormData({
      ...formData,
      items: newItems
    });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { product: '', quantity: 1, price: 0, discount: 0 }]
    });
  };

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      items: newItems
    });
  };

  // Tính tổng tiền trước chiết khấu
  const calculateSubtotal = () => {
    return formData.items.reduce((total, item) => {
      const itemTotal = Number(item.price) * Number(item.quantity);
      return total + (isNaN(itemTotal) ? 0 : itemTotal);
    }, 0);
  };

  // Tính giá trị chiết khấu cho một sản phẩm
  const calculateItemDiscount = (item) => {
    const itemTotal = Number(item.price) * Number(item.quantity);
    if (isNaN(itemTotal)) return 0;
    const discountAmount = (itemTotal * Number(item.discount || 0) / 100);
    // Làm tròn đến ngàn
    return Math.round(discountAmount / 1000) * 1000;
  };

  // Tính tổng giá trị chiết khấu
  const calculateTotalDiscount = () => {
    return formData.items.reduce((total, item) => {
      return total + calculateItemDiscount(item);
    }, 0);
  };

  // Tính tổng tiền sau chiết khấu
  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateTotalDiscount();
    const total = subtotal - discount;
    return isNaN(total) ? 0 : total;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Kiểm tra dữ liệu trước khi gửi
      if (!formData.customer) {
        alert('Vui lòng chọn khách hàng');
        return;
      }

      if (formData.items.some(item => !item.product)) {
        alert('Vui lòng chọn đầy đủ sản phẩm');
        return;
      }

      if (formData.items.some(item => !item.quantity || item.quantity < 1)) {
        alert('Vui lòng nhập số lượng hợp lệ');
        return;
      }

      if (formData.items.some(item => !item.price || item.price < 0)) {
        alert('Vui lòng nhập giá hợp lệ');
        return;
      }

      if (formData.status === 'debt' && !formData.debtEndDate) {
        alert('Vui lòng nhập Hạn Thanh Toán');
        return;
      }

      // Chuẩn bị dữ liệu gửi lên server
      const items = formData.items.map(item => ({
        product: item.product,
        quantity: Number(item.quantity) || 0,
        price: Number(item.price) || 0,
        discount: Number(item.discount) || 0
      }));

      const data = {
        customer: formData.customer,
        invoiceType: formData.invoiceType,
        status: formData.status,
        items
      };

      // Thêm thông tin công nợ nếu là hóa đơn công nợ
      if (formData.status === 'debt') {
        data.debtStartDate = formData.debtStartDate;
        data.debtEndDate = formData.debtEndDate;
      }

      if (isEdit) {
        await axiosInstance.patch(`/api/invoices/${id}`, data);
      } else {
        await axiosInstance.post('/api/invoices', data);
      }
      navigate('/invoices');
    } catch (error) {
      console.error('Error saving invoice:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        alert(`Lỗi: ${error.response.data.message || 'Có lỗi xảy ra khi lưu hóa đơn'}`);
      } else {
        alert('Có lỗi xảy ra khi lưu hóa đơn. Vui lòng thử lại.');
      }
    }
  };

  const getInvoiceTypeText = (type) => {
    switch (type) {
      case 'retail':
        return 'Hóa Đơn Bán Lẻ';
      case 'wholesale':
        return 'Hóa Đơn Bán Sỉ';
      default:
        return type;
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          {isEdit ? 'Sửa Hóa Đơn' : 'Tạo Hóa Đơn Mới'}
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Khách Hàng *</InputLabel>
                <Select
                  name="customer"
                  value={formData.customer}
                  onChange={handleChange}
                  required
                >
                  {customers.map((customer) => (
                    <MenuItem key={customer._id} value={customer._id}>
                      {customer.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Loại Hóa Đơn *</InputLabel>
                <Select
                  name="invoiceType"
                  value={formData.invoiceType}
                  onChange={handleChange}
                  required
                >
                  <MenuItem value="retail">Hóa Đơn Bán Lẻ</MenuItem>
                  <MenuItem value="wholesale">Hóa Đơn Bán Sỉ</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Sản Phẩm</Typography>
                <Button
                  startIcon={<AddIcon />}
                  onClick={addItem}
                  variant="outlined"
                >
                  Thêm Sản Phẩm
                </Button>
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Sản Phẩm</TableCell>
                      <TableCell>Số Lượng *</TableCell>
                      <TableCell>Giá *</TableCell>
                      <TableCell>Chiết Khấu</TableCell>
                      <TableCell>Thành Tiền</TableCell>
                      <TableCell>Thao Tác</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {formData.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <FormControl fullWidth>
                            <Select
                              value={item.product}
                              onChange={(e) => handleItemChange(index, 'product', e.target.value)}
                              required
                            >
                              {products.map((product) => (
                                <MenuItem key={product._id} value={product._id}>
                                  {product.name}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </TableCell>
                        <TableCell>
                          <TextField
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                            required
                            inputProps={{ min: 1 }}
                            error={!item.quantity || item.quantity < 1}
                            helperText={!item.quantity || item.quantity < 1 ? 'Số lượng không hợp lệ' : ''}
                            size="small"
                            sx={{ width: '80px' }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            type="number"
                            value={item.price}
                            onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                            InputProps={{
                              endAdornment: 'VNĐ'
                            }}
                            error={item.price < 0}
                            helperText={item.price < 0 ? 'Giá không hợp lệ' : ''}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            type="number"
                            value={item.discount}
                            onChange={(e) => handleItemChange(index, 'discount', e.target.value)}
                            InputProps={{
                              endAdornment: '%'
                            }}
                            helperText={`${calculateItemDiscount(item).toLocaleString('vi-VN')} VNĐ`}
                            inputProps={{ min: 0, max: 100 }}
                            size="small"
                            sx={{ width: '80px' }}
                          />
                        </TableCell>
                        <TableCell>
                          {((Number(item.price) * Number(item.quantity)) - calculateItemDiscount(item)).toLocaleString('vi-VN')} VNĐ
                        </TableCell>
                        <TableCell>
                          <IconButton
                            color="error"
                            onClick={() => removeItem(index)}
                            disabled={formData.items.length === 1}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
            <Grid item xs={12}>
              <Box display="flex" justifyContent="flex-end" gap={2}>
                <Typography variant="subtitle1">
                  Tổng tiền: {calculateSubtotal().toLocaleString('vi-VN')} VNĐ
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box display="flex" justifyContent="flex-end" gap={2}>
                <Typography variant="subtitle1">
                  Tổng chiết khấu: {calculateTotalDiscount().toLocaleString('vi-VN')} VNĐ
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box display="flex" justifyContent="flex-end" gap={2}>
                <Typography variant="h6">
                  Thành tiền: {calculateTotal().toLocaleString('vi-VN')} VNĐ
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Trạng Thái *</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                >
                  <MenuItem value="paid">Đã Thanh Toán</MenuItem>
                  <MenuItem value="debt">Công Nợ</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {formData.status === 'debt' && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Công Nợ Từ Ngày"
                    name="debtStartDate"
                    type="date"
                    value={formData.debtStartDate}
                    onChange={handleChange}
                    required
                    InputLabelProps={{
                      shrink: true,
                    }}
                    disabled
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Công Nợ Đến Ngày"
                    name="debtEndDate"
                    type="date"
                    value={formData.debtEndDate}
                    onChange={handleChange}
                    required
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>
              </>
            )}
            <Grid item xs={12}>
              <Box display="flex" justifyContent="flex-end" gap={2}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/invoices')}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                >
                  {isEdit ? 'Cập Nhật' : 'Tạo Mới'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
}

export default InvoiceForm; 