const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  invoiceCode: {
    type: String,
    unique: true,
    sparse: true
  },
  invoiceType: {
    type: String,
    enum: ['retail', 'wholesale', 'ecommerce'],
    required: true,
    default: 'retail'
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['paid', 'debt'],
    default: 'paid'
  },
  debtEndDate: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Invoice', invoiceSchema); 