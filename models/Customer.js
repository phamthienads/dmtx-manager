const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    unique: true,
    sparse: true
  },
  phone: {
    type: String
  },
  address: {
    type: String
  },
  taxCode: {
    type: String,
    unique: true,
    sparse: true
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

module.exports = mongoose.model('Customer', customerSchema); 