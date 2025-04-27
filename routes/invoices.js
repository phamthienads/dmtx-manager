const express = require('express');
const router = express.Router();
const Invoice = require('../models/Invoice');
const Customer = require('../models/Customer');
const Product = require('../models/Product');

// Hàm tạo mã hóa đơn
const generateInvoiceCode = async (type = 'LE') => {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = String(now.getFullYear()).slice(-2);
  
  // Tạo mã ngẫu nhiên 5 ký tự
  const randomChars = Math.random().toString(36).substring(2, 7).toUpperCase();
  
  const code = `${day}${month}${year}${type}${randomChars}`;
  
  // Kiểm tra xem mã đã tồn tại chưa
  const existingInvoice = await Invoice.findOne({ invoiceCode: code });
  if (existingInvoice) {
    // Nếu mã đã tồn tại, tạo lại
    return generateInvoiceCode(type);
  }
  
  return code;
};

// Get total invoices count
router.get('/count', async (req, res) => {
  try {
    const total = await Invoice.countDocuments();
    res.json({ total });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all invoices with pagination and optimized populate
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, sort = '-createdAt', customer } = req.query;
    const skip = (page - 1) * limit;

    // Xây dựng query
    const query = {};
    if (customer) {
      query.customer = customer;
    }

    const [invoices, total] = await Promise.all([
      Invoice.find(query)
        .select('invoiceCode invoiceType totalAmount status createdAt customer items')
        .populate('customer', 'name phone email customerType')
        .populate('items.product', 'name code retailPrice wholesalePrice')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Invoice.countDocuments(query)
    ]);

    res.json({
      invoices,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get one invoice
router.get('/:id', async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('customer')
      .populate('items.product');
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    
    // Đảm bảo trả về đầy đủ thông tin chiết khấu
    const invoiceData = invoice.toObject();
    invoiceData.items = invoiceData.items.map(item => ({
      ...item,
      discount: item.discount || 0
    }));
    
    res.json(invoiceData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const roundMoney = (amount) => {
  return Math.round(amount / 1000) * 1000;
};

// Create invoice
router.post('/', async (req, res) => {
  try {
    const customer = await Customer.findById(req.body.customer);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    const items = await Promise.all(req.body.items.map(async (item) => {
      const product = await Product.findById(item.product);
      if (!product) throw new Error(`Product ${item.product} not found`);
      // Tính giá dựa trên loại hóa đơn (retail hoặc wholesale)
      const price = req.body.invoiceType === 'wholesale' ? product.wholesalePrice : product.retailPrice;
      return {
        product: product._id,
        quantity: item.quantity,
        price,
        discount: item.discount || 0
      };
    }));

    // Tính tổng tiền sau khi áp dụng chiết khấu
    const totalAmount = items.reduce((sum, item) => {
      const itemTotal = item.price * item.quantity;
      const discountAmount = (itemTotal * item.discount) / 100;
      return sum + roundMoney(itemTotal - discountAmount);
    }, 0);

    // Tạo mã hóa đơn
    const invoiceCode = await generateInvoiceCode(req.body.invoiceType === 'wholesale' ? 'SI' : 'LE');

    const invoice = new Invoice({
      customer: customer._id,
      invoiceType: req.body.invoiceType,
      invoiceCode,
      items,
      totalAmount,
      status: req.body.status || 'pending',
      debtStartDate: req.body.status === 'debt' ? req.body.debtStartDate : null,
      debtEndDate: req.body.status === 'debt' ? req.body.debtEndDate : null,
      createdAt: req.body.createdAt ? new Date(req.body.createdAt) : new Date()
    });

    const newInvoice = await invoice.save();
    res.status(201).json(newInvoice);
  } catch (err) {
    console.error('Error creating invoice:', err);
    res.status(400).json({ message: err.message });
  }
});

// Update invoice
router.patch('/:id', async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

    // Nếu chưa có mã hóa đơn, tạo mới
    if (!invoice.invoiceCode) {
      const newCode = await generateInvoiceCode(invoice.invoiceType === 'wholesale' ? 'SI' : 'LE');
      invoice.invoiceCode = newCode;
    }

    // Cập nhật các trường cơ bản
    if (req.body.customer) invoice.customer = req.body.customer;
    if (req.body.invoiceType) invoice.invoiceType = req.body.invoiceType;
    if (req.body.status) invoice.status = req.body.status;
    if (req.body.createdAt) invoice.createdAt = new Date(req.body.createdAt);

    // Cập nhật các sản phẩm
    if (req.body.items) {
      invoice.items = req.body.items.map(item => ({
        product: item.product,
        quantity: item.quantity,
        price: item.price,
        discount: item.discount || 0
      }));

      // Tính lại tổng tiền sau khi áp dụng chiết khấu
      invoice.totalAmount = invoice.items.reduce((sum, item) => {
        const itemTotal = item.price * item.quantity;
        const discountAmount = (itemTotal * item.discount) / 100;
        return sum + roundMoney(itemTotal - discountAmount);
      }, 0);
    }

    // Cập nhật thông tin công nợ
    if (req.body.status === 'debt') {
      invoice.debtEndDate = req.body.debtEndDate;
    } else {
      invoice.debtEndDate = null;
    }

    const updatedInvoice = await invoice.save();
    res.json(updatedInvoice);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete invoice
router.delete('/:id', async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

    await Invoice.deleteOne({ _id: req.params.id });
    res.json({ message: 'Invoice deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 