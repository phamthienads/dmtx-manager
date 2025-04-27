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
  TableRow,
  useMediaQuery,
  useTheme,
  Card,
  CardContent,
  Divider,
  Stepper,
  Step,
  StepLabel,
  Autocomplete
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import axiosInstance from '../utils/axios';
import { calculateItemTotal, calculateInvoiceTotal, formatMoney } from '../utils/moneyUtils';

function InvoiceForm() {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    customer: '',
    invoiceType: 'retail',
    status: 'paid',
    items: [{ product: '', quantity: 1, price: 0, discount: 0 }],
    debtStartDate: '',
    debtEndDate: '',
    createdAt: new Date().toISOString().split('T')[0]
  });
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [activeStep, setActiveStep] = useState(0);

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
      if (response.data && Array.isArray(response.data)) {
        setCustomers(response.data);
      } else if (response.data && response.data.customers && Array.isArray(response.data.customers)) {
        setCustomers(response.data.customers);
      } else {
        console.error('Invalid customers data:', response.data);
        setCustomers([]);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      setCustomers([]);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axiosInstance.get('/api/products', {
        params: {
          limit: 1000 // Lấy tất cả sản phẩm
        }
      });
      
      if (response.data && response.data.products && Array.isArray(response.data.products)) {
        setProducts(response.data.products);
      } else {
        console.error('Invalid products data:', response.data);
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    }
  };

  const fetchInvoice = async () => {
    try {
      const response = await axiosInstance.get(`/api/invoices/${id}`);
      if (!response.data) {
        console.error('Invalid invoice data:', response.data);
        return;
      }
      
      const invoiceData = response.data;
      
      // Kiểm tra và xử lý dữ liệu customer
      const customerId = typeof invoiceData.customer === 'object' 
        ? invoiceData.customer._id 
        : invoiceData.customer;
        
      // Kiểm tra và xử lý dữ liệu items
      const items = invoiceData.items.map(item => {
        const productId = typeof item.product === 'object'
          ? item.product._id
          : item.product;
          
        return {
          product: productId,
          quantity: Number(item.quantity) || 1,
          price: Number(item.price) || 0,
          discount: Number(item.discount) || 0
        };
      });
      
      setFormData({
        customer: customerId,
        invoiceType: invoiceData.invoiceType || 'retail',
        status: invoiceData.status || 'paid',
        invoiceCode: invoiceData.invoiceCode || '',
        items: items.length > 0 ? items : [{ product: '', quantity: 1, price: 0, discount: 0 }],
        debtStartDate: invoiceData.debtStartDate || '',
        debtEndDate: invoiceData.debtEndDate ? new Date(invoiceData.debtEndDate).toISOString().split('T')[0] : '',
        createdAt: invoiceData.createdAt ? new Date(invoiceData.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
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
    return discountAmount;
  };

  // Tính tổng giá trị chiết khấu
  const calculateTotalDiscount = () => {
    return formData.items.reduce((total, item) => {
      return total + calculateItemDiscount(item);
    }, 0);
  };

  // Tính tổng tiền sau chiết khấu
  const calculateTotal = () => {
    return calculateInvoiceTotal(formData.items);
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
        items,
        createdAt: formData.createdAt
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

  const renderCustomerInfo = () => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Thông tin khách hàng
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Mã hóa đơn"
              value={formData.invoiceCode || '-'}
              InputProps={{
                readOnly: true,
                disabled: true
              }}
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Autocomplete
              value={customers.find(c => c._id === formData.customer) || null}
              onChange={(event, newValue) => {
                const customerId = newValue?._id || '';
                setFormData(prev => ({
                  ...prev,
                  customer: customerId,
                  invoiceType: newValue?.customerType || 'retail'
                }));
              }}
              options={customers}
              getOptionLabel={(option) => option.name || ''}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Chọn khách hàng"
                  variant="outlined"
                  required
                />
              )}
              isOptionEqualToValue={(option, value) => option._id === value._id}
              noOptionsText="Không tìm thấy khách hàng"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Loại hóa đơn</InputLabel>
              <Select
                name="invoiceType"
                value={formData.invoiceType}
                onChange={handleChange}
                label="Loại hóa đơn"
              >
                <MenuItem value="retail">Bán lẻ</MenuItem>
                <MenuItem value="wholesale">Bán sỉ</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Ngày xuất hóa đơn"
              type="date"
              name="createdAt"
              value={formData.createdAt}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  const renderItemsList = () => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Danh sách sản phẩm</Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={addItem}
            size={isMobile ? "small" : "medium"}
          >
            Thêm sản phẩm
          </Button>
        </Box>
        {isMobile ? (
          <Grid container spacing={2}>
            {formData.items.map((item, index) => (
              <Grid item xs={12} key={index}>
                <Card variant="outlined">
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Typography variant="subtitle1">Sản phẩm {index + 1}</Typography>
                      <IconButton
                        color="error"
                        onClick={() => removeItem(index)}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Autocomplete
                          value={products.find(p => p._id === item.product) || null}
                          onChange={(event, newValue) => {
                            handleItemChange(index, 'product', newValue?._id || '');
                          }}
                          options={products}
                          getOptionLabel={(option) => option.name || ''}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Chọn sản phẩm"
                              variant="outlined"
                              size="small"
                              fullWidth
                            />
                          )}
                          isOptionEqualToValue={(option, value) => option._id === value._id}
                          noOptionsText="Không tìm thấy sản phẩm"
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="Số lượng"
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="Giá"
                          type="number"
                          value={item.price}
                          onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Chiết khấu (%)"
                          type="number"
                          value={item.discount}
                          onChange={(e) => handleItemChange(index, 'discount', e.target.value)}
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">
                          Thành tiền: {formatMoney(calculateItemTotal(item))}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Sản phẩm</TableCell>
                  <TableCell align="right">Số lượng</TableCell>
                  <TableCell align="right">Đơn giá</TableCell>
                  <TableCell align="right">Chiết khấu (%)</TableCell>
                  <TableCell align="right">Thành tiền</TableCell>
                  <TableCell align="right">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {formData.items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Autocomplete
                        value={products.find(p => p._id === item.product) || null}
                        onChange={(event, newValue) => {
                          handleItemChange(index, 'product', newValue?._id || '');
                        }}
                        options={products}
                        getOptionLabel={(option) => option.name || ''}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Chọn sản phẩm"
                            variant="outlined"
                            size="small"
                          />
                        )}
                        isOptionEqualToValue={(option, value) => option._id === value._id}
                        noOptionsText="Không tìm thấy sản phẩm"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <TextField
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        size="small"
                        sx={{ width: '80px' }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <TextField
                        type="number"
                        value={item.price}
                        onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                        size="small"
                        sx={{ width: '120px' }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <TextField
                        type="number"
                        value={item.discount}
                        onChange={(e) => handleItemChange(index, 'discount', e.target.value)}
                        size="small"
                        sx={{ width: '80px' }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      {formatMoney(calculateItemTotal(item))}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton onClick={() => removeItem(index)} color="error">
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>
    </Card>
  );

  const renderPaymentInfo = () => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Thông tin thanh toán
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Trạng thái</InputLabel>
              <Select
                name="status"
                value={formData.status}
                onChange={handleChange}
                label="Trạng thái"
              >
                <MenuItem value="paid">Đã thanh toán</MenuItem>
                <MenuItem value="debt">Công nợ</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          {formData.status === 'debt' && (
            <>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Ngày bắt đầu"
                  type="date"
                  name="debtStartDate"
                  value={formData.debtStartDate}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  disabled
                  size="medium"
                  sx={{
                    '& .MuiInputBase-input': {
                      fontSize: '1rem',
                      padding: '16px 20px',
                      height: 'auto'
                    },
                    '& .MuiOutlinedInput-root': {
                      height: 'auto'
                    },
                    '& .MuiInputBase-root': {
                      height: '56px'
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Hạn thanh toán"
                  type="date"
                  name="debtEndDate"
                  value={formData.debtEndDate}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  size="medium"
                  sx={{
                    '& .MuiInputBase-input': {
                      fontSize: '1rem',
                      padding: '16px 20px',
                      height: 'auto'
                    },
                    '& .MuiOutlinedInput-root': {
                      height: 'auto'
                    },
                    '& .MuiInputBase-root': {
                      height: '56px'
                    }
                  }}
                />
              </Grid>
            </>
          )}
        </Grid>
      </CardContent>
    </Card>
  );

  const renderSummary = () => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Tổng kết
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body1">
              Tổng tiền: {formatMoney(calculateSubtotal())}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body1">
              Chiết khấu: {formatMoney(calculateTotalDiscount())}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h6" color="primary">
              Thành tiền: {formatMoney(calculateTotal())}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography 
          variant={isMobile ? "h5" : "h4"} 
          sx={{ 
            fontWeight: 600,
            color: 'primary.main',
            textAlign: isMobile ? 'center' : 'left',
            width: isMobile ? '100%' : 'auto',
            fontSize: isMobile ? '1.25rem' : '1.5rem',
            padding: isMobile ? '8px 0' : '0'
          }}
        >
          {isEdit ? 'Chỉnh sửa hóa đơn' : 'Tạo hóa đơn mới'}
        </Typography>
        {!isMobile && (
          <Button
            variant="outlined"
            onClick={() => navigate('/invoices')}
            sx={{
              minWidth: '120px',
              height: '40px'
            }}
          >
            Quay lại
          </Button>
        )}
      </Box>

      {isMobile && (
        <Box display="flex" justifyContent="center" mb={2}>
          <Button
            variant="outlined"
            onClick={() => navigate('/invoices')}
            size="small"
            sx={{
              width: '100%',
              maxWidth: '200px',
              height: '36px',
              fontSize: '0.875rem'
            }}
          >
            Quay lại
          </Button>
        </Box>
      )}

      {isMobile ? (
        <Stepper activeStep={activeStep} orientation="vertical">
          <Step>
            <StepLabel 
              sx={{ 
                '& .MuiStepLabel-label': { 
                  fontSize: isMobile ? '0.875rem' : '1rem',
                  padding: isMobile ? '8px 0' : '0'
                }
              }}
            >
              Thông tin khách hàng
            </StepLabel>
            {renderCustomerInfo()}
          </Step>
          <Step>
            <StepLabel 
              sx={{ 
                '& .MuiStepLabel-label': { 
                  fontSize: isMobile ? '0.875rem' : '1rem',
                  padding: isMobile ? '8px 0' : '0'
                }
              }}
            >
              sản phẩm
            </StepLabel>
            {renderItemsList()}
          </Step>
          <Step>
            <StepLabel 
              sx={{ 
                '& .MuiStepLabel-label': { 
                  fontSize: isMobile ? '0.875rem' : '1rem',
                  padding: isMobile ? '8px 0' : '0'
                }
              }}
            >
              Thông tin thanh toán
            </StepLabel>
            {renderPaymentInfo()}
          </Step>
          <Step>
            <StepLabel 
              sx={{ 
                '& .MuiStepLabel-label': { 
                  fontSize: isMobile ? '0.875rem' : '1rem',
                  padding: isMobile ? '8px 0' : '0'
                }
              }}
            >
              Tổng kết
            </StepLabel>
            {renderSummary()}
          </Step>
        </Stepper>
      ) : (
        <>
          {renderCustomerInfo()}
          {renderItemsList()}
          {renderPaymentInfo()}
          {renderSummary()}
        </>
      )}

      <Box display="flex" justifyContent="flex-end" mt={3}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          size={isMobile ? "small" : "medium"}
          fullWidth={isMobile}
        >
          {isEdit ? 'Cập nhật' : 'Tạo hóa đơn'}
        </Button>
      </Box>
    </Container>
  );
}

export default InvoiceForm; 