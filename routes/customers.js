const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
const Invoice = require('../models/Invoice');

// Get total customers count
router.get('/count', async (req, res) => {
  try {
    const total = await Customer.countDocuments();
    res.json({ total });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all customers
router.get('/', async (req, res) => {
  try {
    const { search, page = 1, limit = 20, sort = 'name' } = req.query;
    let query = {};

    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const skip = (page - 1) * limit;
    
    // Lấy danh sách khách hàng
    const customers = await Customer.find(query)
      .select('name phone email customerType createdAt')
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Lấy thông tin hóa đơn cuối cùng cho mỗi khách hàng
    const customersWithLastInvoice = await Promise.all(
      customers.map(async (customer) => {
        const lastInvoice = await Invoice.findOne({ customer: customer._id })
          .sort({ createdAt: -1 })
          .select('invoiceCode createdAt totalAmount status')
          .lean();
        
        return {
          ...customer,
          lastInvoice: lastInvoice ? {
            invoiceCode: lastInvoice.invoiceCode,
            createdAt: lastInvoice.createdAt,
            totalAmount: lastInvoice.totalAmount,
            status: lastInvoice.status
          } : null
        };
      })
    );

    // Sắp xếp theo hóa đơn lần cuối nếu được yêu cầu
    if (sort === 'lastInvoice' || sort === '-lastInvoice') {
      customersWithLastInvoice.sort((a, b) => {
        const dateA = a.lastInvoice ? new Date(a.lastInvoice.createdAt) : new Date(0);
        const dateB = b.lastInvoice ? new Date(b.lastInvoice.createdAt) : new Date(0);
        return sort === 'lastInvoice' ? dateA - dateB : dateB - dateA;
      });
    } else {
      // Sắp xếp theo các trường khác
      customersWithLastInvoice.sort((a, b) => {
        if (sort.startsWith('-')) {
          const field = sort.substring(1);
          return b[field] > a[field] ? 1 : -1;
        }
        return a[sort] > b[sort] ? 1 : -1;
      });
    }

    const total = await Customer.countDocuments(query);

    res.json({
      customers: customersWithLastInvoice,
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

// Get one customer
router.get('/:id', async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create customer
router.post('/', async (req, res) => {
  try {
    const customer = new Customer(req.body);
    const newCustomer = await customer.save();
    res.status(201).json(newCustomer);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update customer
router.patch('/:id', async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    Object.assign(customer, req.body);
    const updatedCustomer = await customer.save();
    res.json(updatedCustomer);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete customer
router.delete('/:id', async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    await Customer.deleteOne({ _id: req.params.id });
    res.json({ message: 'Customer deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 