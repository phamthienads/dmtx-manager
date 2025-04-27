const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    index: true
  },
  email: {
    type: String,
    default: null,
    index: true
  },
  phone: {
    type: String,
    index: true
  },
  address: {
    type: String
  },
  taxCode: {
    type: String,
    default: null
  },
  customerType: {
    type: String,
    enum: ['retail', 'wholesale'],
    required: true,
    default: 'retail'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Thêm compound index cho tìm kiếm
customerSchema.index({ name: 'text', phone: 'text' });

module.exports = mongoose.model('Customer', customerSchema); 