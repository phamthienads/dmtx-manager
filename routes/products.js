const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// Get all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get one product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create product
router.post('/', async (req, res) => {
  try {
    const product = new Product({
      name: req.body.name,
      code: req.body.code,
      importPrice: req.body.importPrice || 0,
      retailPrice: req.body.retailPrice || 0,
      wholesalePrice: req.body.wholesalePrice || 0,
      stock: req.body.stock || 0
    });

    const newProduct = await product.save();
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update product
router.patch('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    if (req.body.name) product.name = req.body.name;
    if (req.body.code) product.code = req.body.code;
    if (req.body.importPrice !== undefined) product.importPrice = req.body.importPrice;
    if (req.body.retailPrice !== undefined) product.retailPrice = req.body.retailPrice;
    if (req.body.wholesalePrice !== undefined) product.wholesalePrice = req.body.wholesalePrice;
    if (req.body.stock !== undefined) product.stock = req.body.stock;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete product
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    await Product.deleteOne({ _id: req.params.id });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 