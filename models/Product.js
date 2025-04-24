const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  code: {
    type: String,
    sparse: true
  },
  importPrice: {
    type: Number,
    default: 0
  },
  retailPrice: {
    type: Number,
    default: 0
  },
  wholesalePrice: {
    type: Number,
    default: 0
  },
  stock: {
    type: Number,
    default: 0
  },
  totalImportAmount: {
    type: Number,
    default: 0
  },
  totalStockAmount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware để tự động tính toán tổng tiền khi có thay đổi
productSchema.pre('save', function(next) {
  // Tổng tiền hàng = giá nhập * số lượng tồn kho
  this.totalImportAmount = this.importPrice * this.stock;
  // Tổng tiền tồn kho = giá bán lẻ * số lượng tồn kho
  this.totalStockAmount = this.retailPrice * this.stock;
  next();
});

// Thêm virtual để tính toán tổng tiền khi truy vấn
productSchema.virtual('calculatedTotalImportAmount').get(function() {
  return this.importPrice * this.stock;
});

productSchema.virtual('calculatedTotalStockAmount').get(function() {
  return this.retailPrice * this.stock;
});

// Đảm bảo virtual fields được trả về khi chuyển đổi sang JSON
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', productSchema); 