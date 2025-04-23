   // api/index.js
   const serverless = require('serverless-http');
   const express     = require('express');
   const mongoose    = require('mongoose');
   const cors        = require('cors');
   const { auth }    = require('../middleware/auth');
   const authRoutes  = require('../routes/auth');
   const productRoutes  = require('../routes/products');
   const customerRoutes = require('../routes/customers');
   const invoiceRoutes  = require('../routes/invoices');
   require('dotenv').config();

   const app = express();
   app.use(cors());
   app.use(express.json());

   mongoose.connect(
     process.env.MONGODB_URI || 'mongodb://localhost:27017/dmtx-manager',
     { useNewUrlParser: true, useUnifiedTopology: true }
   );

   app.use('/api/auth',     authRoutes);
   app.use('/api/products', auth, productRoutes);
   app.use('/api/customers', auth, customerRoutes);
   app.use('/api/invoices',  auth, invoiceRoutes);

   // bắt lỗi
   app.use((err, req, res, next) => {
     console.error(err);
     res.status(500).json({ message: 'Có lỗi xảy ra!' });
   });

   // không còn app.listen() vì Vercel sẽ tự handle
   module.exports = serverless(app);