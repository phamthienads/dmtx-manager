const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { auth, isAdmin } = require('./middleware/auth');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const customerRoutes = require('./routes/customers');
const invoiceRoutes = require('./routes/invoices');
require('dotenv').config();
const NodeCache = require('node-cache');

const app = express();
const cache = new NodeCache();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 50,
  minPoolSize: 10,
  socketTimeoutMS: 45000,
  family: 4,
  serverSelectionTimeoutMS: 5000,
  heartbeatFrequencyMS: 10000,
  autoIndex: true,
  autoCreate: true
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB:', err));

// Enable query caching and optimization
mongoose.set('debug', process.env.NODE_ENV === 'development');

// Cache configuration
const cacheConfig = {
  ttl: 60 * 60 * 1000, // 1 hour
  max: 100 // maximum number of items in cache
};

// Add cache middleware for frequently accessed routes
app.use('/api/customers/count', (req, res, next) => {
  const cacheKey = 'customers_count';
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    return res.json(cachedData);
  }
  next();
});

app.use('/api/products/count', (req, res, next) => {
  const cacheKey = 'products_count';
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    return res.json(cachedData);
  }
  next();
});

app.use('/api/invoices/count', (req, res, next) => {
  const cacheKey = 'invoices_count';
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    return res.json(cachedData);
  }
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', auth, productRoutes);
app.use('/api/customers', auth, customerRoutes);
app.use('/api/invoices', auth, invoiceRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Có lỗi xảy ra!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 