import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Divider,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  useMediaQuery,
  useTheme,
  IconButton
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Edit as EditIcon, Print as PrintIcon } from '@mui/icons-material';
import axiosInstance from '../utils/axios';
import { formatMoney, calculateItemTotal, roundMoney } from '../utils/moneyUtils';

function InvoiceDetail() {
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const fetchInvoice = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get(`/api/invoices/${id}`);
      setInvoice(response.data);
    } catch (error) {
      console.error('Error fetching invoice:', error);
      setError('Không thể tải thông tin hóa đơn. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const logoUrl = `${window.location.origin}/logo.png`;

    // Tải logo trước khi in
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const logoDataUrl = canvas.toDataURL('image/png');

      printWindow.document.write(`
        <html>
          <head>
            <title>HÓA ĐƠN BÁN HÀNG</title>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Lexend:wght@400;500;600;700&family=Merriweather:wght@400;700&family=Lora:wght@400;500;600;700&display=swap');
              @page {
                size: A4;
                margin: 1cm;
              }
              body {
                font-family: 'Lexend', sans-serif;
                margin: 0;
                padding: 20px;
              }
              .header {
                display: flex;
                align-items: flex-start;
                margin-bottom: 30px;
              }
              .logo {
                width: 200px;
                margin-right: 50px;
              }
              .company-info {
                flex-grow: 1;
                text-align: left;
                font-size: 14px;
                line-height: 1.5;
              }
              .company-name {
                font-size: 24px;
                font-weight: bold;
                margin: 0 0 10px 0;
              }
              .invoice-title {
                text-align: center;
                font-size: 24px;
                font-weight: bold;
                margin: 20px 0 5px 0;
              }
              .invoice-date {
                text-align: center;
                margin-bottom: 20px;
                font-size: 14px;
              }
              .customer-info {
                margin-bottom: 20px;
                font-size: 14px;
              }
              .customer-info div {
                font-family: 'Merriweather', serif;
                font-size: 21px;
                font-weight: 700;
              }
              .header {
                display: flex;
                align-items: flex-start;
                margin-bottom: 30px;
              }
              .logo {
                width: 200px;
                margin-right: 50px;
              }
              .company-info {
                flex-grow: 1;
                text-align: left;
                font-size: 14px;
                line-height: 1.5;
              }
              .company-name {
                font-size: 24px;
                font-weight: bold;
                margin: 0 0 10px 0;
              }
              .invoice-title {
                text-align: center;
                font-size: 24px;
                font-weight: bold;
                margin: 20px 0 5px 0;
              }
              .invoice-date {
                text-align: center;
                margin-bottom: 20px;
                font-size: 14px;
              }
              .customer-info {
                margin-bottom: 20px;
                font-size: 14px;
              }
              .customer-info h3 {
                margin: 0 0 5px 0;
                font-size: 16px;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
                table-layout: fixed;
              }
              th, td {
                border: 1px solid #ddd;
                padding: 8px;
                text-align: left;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
              }
              th {
                background-color: #f2f2f2;
                font-weight: 600;
                white-space: nowrap;
                overflow: visible;
                height: auto;
                padding: 12px 8px;
                font-size: 15px;
                text-transform: uppercase;
                text-align: center;
              }
              td {
                font-size: 17px;
                padding: 10px 8px;
              }
              /* Định nghĩa độ rộng cột */
              th:nth-child(1), td:nth-child(1) { width: 8%; }  /* STT */
              th:nth-child(2), td:nth-child(2) { width: 32%; } /* Tên sản phẩm */
              th:nth-child(3), td:nth-child(3) { width: 18%; } /* Đơn giá */
              th:nth-child(4), td:nth-child(4) { width: 12%; } /* Số lượng */
              th:nth-child(5), td:nth-child(5) { width: 12%; } /* Chiết khấu */
              th:nth-child(6), td:nth-child(6) { width: 18%; } /* Thành tiền */
              /* Căn phải cho các cột số trong phần nội dung */
              td:nth-child(3),
              td:nth-child(5),
              td:nth-child(6) {
                text-align: right;
              }
              /* Căn giữa cho cột số thứ tự và số lượng */
              td:nth-child(1),
              td:nth-child(4) {
                text-align: center;
              }
              .total {
                text-align: right;
                font-weight: bold;
                margin-top: 20px;
                font-family: 'Lora', serif;
                font-size: 18px;
                color: #ff0000;
              }
              .signatures {
                display: flex;
                justify-content: space-between;
                margin-top: 50px;
                padding: 0 50px;
              }
              .signature-box {
                text-align: center;
                width: 200px;
              }
              .signature-line {
                border-top: 1px solid #000;
                margin-top: 50px;
                width: 100%;
              }
              .signature-title {
                margin-top: 10px;
                font-weight: bold;
                font-size: 14px;
              }
              .footer {
                margin-top: 40px;
                text-align: center;
                font-size: 12px;
              }
              /* Cho phép xuống dòng ở cột tên sản phẩm */
              th:nth-child(2), td:nth-child(2) {
                white-space: normal;
                word-wrap: break-word;
                min-height: 40px;
                vertical-align: top;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <img src="${logoDataUrl}" alt="Logo" class="logo">
              <div class="company-info">
                <div class="company-name">Điện Máy Thiên Xuân</div>
                <div>Địa Chỉ: 130/33A Phú Định, P. 16, Q. 8</div>
                <div>Kho Hàng: 79 Đường Số 10, P. An Lạc, Q. Bình Tân</div>
                <div>SĐT: 0392.829.827 (Zalo) - 0987.098.033</div>
                <div>Website: www.dienmaythienxuan.vn</div>
              </div>
            </div>
            
            <div class="invoice-title">HÓA ĐƠN BÁN HÀNG</div>
            <div class="invoice-date">Ngày: ${new Date(invoice.createdAt).toLocaleDateString('vi-VN')}</div>
            
            <div class="customer-info">
              <div>Người Mua: ${invoice.customer ? invoice.customer.name : 'Khách hàng không xác định'}</div>
            </div>
            
            <table>
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Tên sản phẩm</th>
                  <th>Đơn Giá</th>
                  <th>SL</th>
                  <th>CK %</th>
                  <th>Thành Tiền</th>
                </tr>
              </thead>
              <tbody>
                ${invoice.items.map((item, index) => {
                  const itemTotal = item.price * item.quantity;
                  const discountAmount = (itemTotal * (item.discount || 0)) / 100;
                  const finalTotal = itemTotal - discountAmount;
                  
                  return `
                    <tr>
                      <td>${index + 1}</td>
                      <td>${item.product ? item.product.name : 'Sản phẩm không xác định'}</td>
                      <td>${formatMoney(item.price)}</td>
                      <td>${item.quantity}</td>
                      <td>${item.discount || 0}%</td>
                      <td>${formatMoney(finalTotal)}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
            
            <div class="total">
              <div>TỔNG TIỀN THANH TOÁN: ${formatMoney(invoice.totalAmount)}</div>
            </div>
            
            <div class="signatures">
              <div class="signature-box">
                <div class="signature-line"></div>
                <div class="signature-title">Người Mua</div>
              </div>
              <div class="signature-box">
                <div class="signature-line"></div>
                <div class="signature-title">Người Bán</div>
              </div>
            </div>
            
            <div class="footer">
              <p>Cảm ơn quý khách đã mua hàng!</p>
            </div>
          </body>
        </html>
      `);
      
      printWindow.document.close();
      printWindow.focus();
      
      // Đợi tất cả tài nguyên tải xong trước khi in
      printWindow.onload = function() {
        printWindow.print();
        printWindow.close();
      };
    };
    
    img.src = logoUrl;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'debt':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'paid':
        return 'Đã Thanh Toán';
      case 'debt':
        return 'Công Nợ';
      default:
        return status;
    }
  };

  const getInvoiceTypeText = (type) => {
    switch (type) {
      case 'retail':
        return 'Lẻ';
      case 'wholesale':
        return 'Sỉ';
      default:
        return type;
    }
  };

  const calculateItemDiscount = (item) => {
    if (!item || !item.price || !item.quantity) return 0;
    const itemTotal = Number(item.price) * Number(item.quantity);
    return roundMoney((itemTotal * Number(item.discount || 0)) / 100);
  };

  const calculateTotalDiscount = () => {
    if (!invoice || !invoice.items) return 0;
    return invoice.items.reduce((total, item) => total + calculateItemDiscount(item), 0);
  };

  const calculateTotal = () => {
    if (!invoice) return 0;
    return invoice.totalAmount;
  };

  const renderMobileView = () => (
    <Box>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 2,
        position: 'sticky',
        top: 0,
        backgroundColor: 'background.paper',
        zIndex: 1,
        py: 1
      }}>
        <IconButton 
          onClick={() => navigate('/invoices')}
          sx={{ color: 'text.secondary' }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Box>
          <IconButton 
            onClick={() => navigate(`/invoices/edit/${id}`)}
            sx={{ mr: 1 }}
          >
            <EditIcon />
          </IconButton>
          <IconButton 
            onClick={handlePrint}
            color="primary"
          >
            <PrintIcon />
          </IconButton>
        </Box>
      </Box>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" sx={{ fontSize: '1.1rem' }}>
              {invoice.invoiceCode || 'Chưa có mã'}
            </Typography>
            <Chip
              label={getStatusText(invoice.status)}
              color={getStatusColor(invoice.status)}
              size="small"
            />
          </Box>
          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography variant="body2" color="text.secondary">
              Loại:
            </Typography>
            <Typography variant="body2">
              {getInvoiceTypeText(invoice.invoiceType)}
            </Typography>
          </Box>
          <Box display="flex" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">
              Ngày tạo:
            </Typography>
            <Typography variant="body2">
              {new Date(invoice.createdAt).toLocaleDateString('vi-VN')}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="subtitle1" sx={{ mb: 1, fontSize: '1rem' }}>
            {invoice.customer ? invoice.customer.name : 'Khách hàng không xác định'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {invoice.customer ? invoice.customer.phone : '-'}
          </Typography>
        </CardContent>
      </Card>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="subtitle1" sx={{ mb: 2, fontSize: '1rem' }}>
            Danh sách sản phẩm
          </Typography>
          {invoice.items.map((item, index) => (
            <Box 
              key={index} 
              sx={{ 
                mb: 2, 
                pb: 2, 
                borderBottom: index < invoice.items.length - 1 ? '1px solid #eee' : 'none',
                '&:last-child': { mb: 0, pb: 0, borderBottom: 'none' }
              }}
            >
              <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                <Typography variant="body1" sx={{ fontWeight: 500, flex: 1, mr: 1 }}>
                  {item.product ? item.product.name : 'Sản phẩm không xác định'}
                </Typography>
                <Typography variant="body2" color="primary" sx={{ fontWeight: 500 }}>
                  {formatMoney(calculateItemTotal(item))}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" color="text.secondary" component="span">
                    {formatMoney(item.price)} × {item.quantity}
                  </Typography>
                  {item.discount > 0 && (
                    <Typography 
                      variant="body2" 
                      color="error" 
                      component="span" 
                      sx={{ ml: 1 }}
                    >
                      (-{item.discount}%)
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>
          ))}
          <Divider sx={{ my: 2 }} />
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Tổng tiền
            </Typography>
            <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
              {formatMoney(invoice.totalAmount)}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>Đang tải thông tin hóa đơn...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        <Button 
          variant="contained" 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/invoices')}
        >
          Quay lại danh sách
        </Button>
      </Container>
    );
  }

  if (!invoice) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>Không tìm thấy thông tin hóa đơn</Alert>
        <Button 
          variant="contained" 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/invoices')}
        >
          Quay lại danh sách
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        {isMobile ? (
          renderMobileView()
        ) : (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
              <Button 
                variant="text" 
                startIcon={<ArrowBackIcon />} 
                onClick={() => navigate('/invoices')}
                sx={{ color: 'text.secondary' }}
              >
                Quay lại danh sách
              </Button>
              <Box>
                <Button 
                  variant="outlined" 
                  startIcon={<EditIcon />} 
                  onClick={() => navigate(`/invoices/edit/${id}`)}
                  sx={{ mr: 1 }}
                >
                  Chỉnh sửa
                </Button>
                <Button 
                  variant="contained" 
                  startIcon={<PrintIcon />} 
                  onClick={handlePrint}
                >
                  In hóa đơn
                </Button>
              </Box>
            </Box>

            <Box sx={{ 
              mb: 4,
              pb: 3,
              borderBottom: '1px solid',
              borderColor: 'divider'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 600,
                    color: 'primary.main',
                    mr: 2
                  }}
                >
                  #{invoice.invoiceCode || 'Chưa có mã'}
                </Typography>
                <Chip 
                  label={getStatusText(invoice.status)} 
                  color={getStatusColor(invoice.status)} 
                  sx={{ mr: 1 }} 
                />
                <Chip 
                  label={getInvoiceTypeText(invoice.invoiceType)} 
                  variant="outlined" 
                />
              </Box>
              <Typography variant="body2" color="text.secondary">
                Ngày tạo: {new Date(invoice.createdAt).toLocaleDateString('vi-VN')}
              </Typography>
            </Box>

            <Grid container spacing={4} sx={{ mb: 4 }}>
              <Grid item xs={12} md={6}>
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 3,
                    height: '100%',
                    backgroundColor: 'background.default'
                  }}
                >
                  <Typography 
                    variant="h6" 
                    gutterBottom
                    sx={{ 
                      fontWeight: 600,
                      color: 'primary.main',
                      mb: 2
                    }}
                  >
                    Thông tin khách hàng
                  </Typography>
                  <Box sx={{ '& > *:not(:last-child)': { mb: 1.5 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ minWidth: 120 }}
                      >
                        Tên khách hàng:
                      </Typography>
                      <Typography variant="body1">
                        {invoice.customer ? invoice.customer.name : 'Khách hàng không xác định'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ minWidth: 120 }}
                      >
                        Số điện thoại:
                      </Typography>
                      <Typography variant="body1">
                        {invoice.customer ? invoice.customer.phone : '-'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ minWidth: 120 }}
                      >
                        Email:
                      </Typography>
                      <Typography variant="body1">
                        {invoice.customer ? invoice.customer.email : '-'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ minWidth: 120 }}
                      >
                        Địa chỉ:
                      </Typography>
                      <Typography variant="body1">
                        {invoice.customer ? invoice.customer.address : '-'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ minWidth: 120 }}
                      >
                        Loại khách hàng:
                      </Typography>
                      <Chip 
                        label={invoice.customer ? (invoice.customer.customerType === 'retail' ? 'Khách lẻ' : 'Khách sỉ') : '-'}
                        size="small"
                        color={invoice.customer?.customerType === 'wholesale' ? 'primary' : 'default'}
                      />
                    </Box>
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 3,
                    height: '100%',
                    backgroundColor: 'background.default'
                  }}
                >
                  <Typography 
                    variant="h6" 
                    gutterBottom
                    sx={{ 
                      fontWeight: 600,
                      color: 'primary.main',
                      mb: 2
                    }}
                  >
                    Thông tin thanh toán
                  </Typography>
                  <Box sx={{ '& > *:not(:last-child)': { mb: 1.5 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ minWidth: 120 }}
                      >
                        Trạng thái:
                      </Typography>
                      <Chip 
                        label={getStatusText(invoice.status)}
                        color={getStatusColor(invoice.status)}
                        size="small"
                      />
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ minWidth: 120 }}
                      >
                        Loại hóa đơn:
                      </Typography>
                      <Typography variant="body1">
                        {getInvoiceTypeText(invoice.invoiceType)}
                      </Typography>
                    </Box>
                    {invoice.status === 'debt' && invoice.debtEndDate && (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography 
                          variant="body2" 
                          color="text.secondary" 
                          sx={{ minWidth: 120 }}
                        >
                          Hạn thanh toán:
                        </Typography>
                        <Typography variant="body1">
                          {new Date(invoice.debtEndDate).toLocaleDateString('vi-VN')}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Paper>
              </Grid>
            </Grid>

            <Typography 
              variant="h6" 
              gutterBottom
              sx={{ 
                fontWeight: 600,
                color: 'primary.main',
                mb: 2
              }}
            >
              Chi tiết sản phẩm
            </Typography>
            <TableContainer 
              component={Paper} 
              variant="outlined"
              sx={{ 
                mb: 4,
                backgroundColor: 'background.default'
              }}
            >
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>STT</TableCell>
                    <TableCell>Tên sản phẩm</TableCell>
                    <TableCell>Mã sản phẩm</TableCell>
                    <TableCell align="right">Đơn giá</TableCell>
                    <TableCell align="right">Số lượng</TableCell>
                    <TableCell align="right">Chiết khấu</TableCell>
                    <TableCell align="right">Thành tiền</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {invoice.items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{item.product ? item.product.name : 'Sản phẩm không xác định'}</TableCell>
                      <TableCell>{item.product ? item.product.code : '-'}</TableCell>
                      <TableCell align="right">{formatMoney(item.price)}</TableCell>
                      <TableCell align="right">{item.quantity}</TableCell>
                      <TableCell align="right">{item.discount || 0}%</TableCell>
                      <TableCell align="right">{formatMoney(calculateItemTotal(item))}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Paper 
                variant="outlined"
                sx={{ 
                  p: 3, 
                  width: 300,
                  backgroundColor: 'background.default'
                }}
              >
                <Box sx={{ '& > *:not(:last-child)': { mb: 1.5 } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Tổng tiền hàng:
                    </Typography>
                    <Typography variant="body1">
                      {formatMoney(calculateTotal())}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Tổng chiết khấu:
                    </Typography>
                    <Typography variant="body1" color="error.main">
                      - {formatMoney(calculateTotalDiscount())}
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 1.5 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Tổng cộng:
                    </Typography>
                    <Typography variant="h6" color="primary.main" sx={{ fontWeight: 600 }}>
                      {formatMoney(calculateTotal())}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Box>
          </>
        )}
      </Paper>
    </Container>
  );
}

export default InvoiceDetail; 