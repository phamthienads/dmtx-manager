const express = require('express');
const router = express.Router();
const Invoice = require('../models/Invoice');
const Customer = require('../models/Customer');
const Product = require('../models/Product');

// Get all invoices
router.get('/', async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .populate('customer')
      .populate('items.product');
    res.json(invoices);
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

    const invoice = new Invoice({
      customer: customer._id,
      invoiceType: req.body.invoiceType,
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
    res.status(400).json({ message: err.message });
  }
});

// Update invoice
router.patch('/:id', async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

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