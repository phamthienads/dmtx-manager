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
  Divider
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Edit as EditIcon, Print as PrintIcon } from '@mui/icons-material';
import axiosInstance from '../utils/axios';
import { formatMoney, calculateItemTotal } from '../utils/moneyUtils';

function InvoiceDetail() {
  const [invoice, setInvoice] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const fetchInvoice = async () => {
    try {
      const response = await axiosInstance.get(`/api/invoices/${id}`);
      setInvoice(response.data);
    } catch (error) {
      console.error('Error fetching invoice:', error);
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
            <title>Hóa Đơn Bán Hàng</title>
            <style>
              @page {
                size: A4;
                margin: 1cm;
              }
              body {
                font-family: Arial, sans-serif;
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
              table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
              }
              th, td {
                border: 1px solid #000;
                padding: 8px;
                text-align: center;
                font-size: 14px;
              }
              th {
                background-color: #fff;
              }
              .total-row {
                font-weight: bold;
                color: red;
                text-align: right;
                padding: 10px 0;
                border-top: 1px solid #000;
              }
              .signature-section {
                display: flex;
                justify-content: space-between;
                margin-top: 40px;
                text-align: center;
                font-size: 14px;
              }
              .thank-you {
                text-align: center;
                font-style: italic;
                margin-top: 30px;
                border-top: 1px solid #000;
                padding-top: 10px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="logo">
                <img src="${logoDataUrl}" alt="Logo" style="width: 150px;">
              </div>
              <div class="company-info">
                <div class="company-name">Điện Máy Thiên Xuân</div>
                <p>Địa Chỉ: 130/33A Phú Định, P. 16, Q. 8</p>
                <p>Kho Hàng: 79 Đường Số 10, P. An Lạc, Q. Bình Tân</p>
                <p>SĐT: 0392.829.827 (Zalo) - 0987.098.033</p>
                <p>Website: www.dienmaythienxuan.vn</p>
              </div>
            </div>

            <div class="invoice-title">
              HOÁ ĐƠN BÁN HÀNG
            </div>

            <div class="invoice-date">
              Ngày: ${new Date().toLocaleDateString('vi-VN')}
            </div>

            <div class="customer-info">
              <strong>Khách Hàng:</strong> ${invoice.customer.name}
            </div>

            <table>
              <thead>
                <tr>
                  <th style="width: 50px;">STT</th>
                  <th style="width: 40%;">Sản Phẩm</th>
                  <th style="width: 80px;">SL</th>
                  <th>Đơn Giá</th>
                  <th>% CK</th>
                  <th>Thành Tiền</th>
                </tr>
              </thead>
              <tbody>
                ${invoice.items.map((item, index) => `
                  <tr>
                    <td>${index + 1}</td>
                    <td style="text-align: left;">${item.product.name}</td>
                    <td>${item.quantity}</td>
                    <td>${formatMoney(item.price)}</td>
                    <td>${item.discount}%</td>
                    <td>${formatMoney(calculateItemTotal(item.price, item.quantity, item.discount))}</td>
                  </tr>
                `).join('')}
                ${[...Array(Math.max(0, 10 - invoice.items.length))].map((_, i) => `
                  <tr>
                    <td>${invoice.items.length + i + 1}</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div class="total-row">
              TỔNG TIỀN THANH TOÁN: ${formatMoney(invoice.totalAmount)}
            </div>

            <div class="signature-section">
              <div>
                <p><strong>Người Mua Hàng</strong></p>
                <p style="margin-top: 60px;"></p>
              </div>
              <div>
                <p><strong>Người Bán Hàng</strong></p>
                <p style="margin-top: 60px;"></p>
              </div>
            </div>

            <div class="thank-you">
              Cảm ơn quý khách đã mua hàng!
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
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
        return 'Hóa Đơn Bán Lẻ';
      case 'wholesale':
        return 'Hóa Đơn Bán Sỉ';
      default:
        return type;
    }
  };

  // Tính giá trị chiết khấu cho một sản phẩm
  const calculateItemDiscount = (item) => {
    const itemTotal = Number(item.price) * Number(item.quantity);
    if (isNaN(itemTotal)) return 0;
    const discountAmount = (itemTotal * Number(item.discount || 0) / 100);
    return calculateItemTotal(discountAmount, 1, 0);
  };

  // Tính tổng giá trị chiết khấu
  const calculateTotalDiscount = () => {
    return invoice.items.reduce((total, item) => {
      return total + calculateItemDiscount(item);
    }, 0);
  };

  // Tính tổng tiền sau chiết khấu
  const calculateTotal = () => {
    const subtotal = invoice.items.reduce((total, item) => {
      const itemTotal = Number(item.price) * Number(item.quantity);
      return total + (isNaN(itemTotal) ? 0 : itemTotal);
    }, 0);
    const discount = calculateTotalDiscount();
    const total = subtotal - discount;
    return isNaN(total) ? 0 : total;
  };

  if (!invoice) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography>Đang tải...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/invoices')}
        >
          Quay lại
        </Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={<PrintIcon />}
          onClick={handlePrint}
        >
          Xuất Hóa Đơn
        </Button>
      </Box>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Thông Tin Hóa Đơn
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1" color="text.secondary">
              Khách Hàng
            </Typography>
            <Typography variant="body1" gutterBottom>
              {invoice.customer.name}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1" color="text.secondary">
              Loại Hóa Đơn
            </Typography>
            <Typography variant="body1" gutterBottom>
              {getInvoiceTypeText(invoice.invoiceType)}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1" color="text.secondary">
              Trạng Thái
            </Typography>
            <Chip
              label={getStatusText(invoice.status)}
              color={getStatusColor(invoice.status)}
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1" color="text.secondary">
              Ngày Xuất Hoá Đơn
            </Typography>
            <Typography variant="body1" gutterBottom>
              {new Date(invoice.createdAt).toLocaleDateString('vi-VN')}
            </Typography>
          </Grid>
          {invoice.status === 'debt' && (
            <>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" color="text.secondary">
                  Hạn Thanh Toán
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {new Date(invoice.debtEndDate).toLocaleDateString('vi-VN')}
                </Typography>
              </Grid>
            </>
          )}
        </Grid>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Chi Tiết Sản Phẩm
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Sản Phẩm</TableCell>
                <TableCell>Số Lượng</TableCell>
                <TableCell>Đơn Giá</TableCell>
                <TableCell>Chiết Khấu</TableCell>
                <TableCell>Thành Tiền</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invoice.items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.product.name}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{formatMoney(item.price)}</TableCell>
                  <TableCell>{item.discount}%</TableCell>
                  <TableCell>
                    {formatMoney(calculateItemTotal(item.price, item.quantity, item.discount))}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Box display="flex" justifyContent="flex-end" mt={3}>
          <Typography variant="h6">
            Tổng Tiền: {formatMoney(invoice.totalAmount)}
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}

export default InvoiceDetail; 