import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import CustomerList from './pages/CustomerList';
import CustomerForm from './pages/CustomerForm';
import CustomerDetail from './pages/CustomerDetail';
import ProductList from './pages/ProductList';
import ProductForm from './pages/ProductForm';
import InvoiceList from './pages/InvoiceList';
import InvoiceForm from './pages/InvoiceForm';
import InvoiceDetail from './pages/InvoiceDetail';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router basename="/client">
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/products" element={
            <ProtectedRoute>
              <Layout>
                <ProductList />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/products/new" element={
            <ProtectedRoute>
              <Layout>
                <ProductForm />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/products/edit/:id" element={
            <ProtectedRoute>
              <Layout>
                <ProductForm />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/customers" element={
            <ProtectedRoute>
              <Layout>
                <CustomerList />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/customers/new" element={
            <ProtectedRoute>
              <Layout>
                <CustomerForm />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/customers/edit/:id" element={
            <ProtectedRoute>
              <Layout>
                <CustomerForm />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/invoices" element={
            <ProtectedRoute>
              <Layout>
                <InvoiceList />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/invoices/new" element={
            <ProtectedRoute>
              <Layout>
                <InvoiceForm />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/invoices/edit/:id" element={
            <ProtectedRoute>
              <Layout>
                <InvoiceForm />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/invoices/:id" element={
            <ProtectedRoute>
              <Layout>
                <InvoiceDetail />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/customers/:id" element={
            <ProtectedRoute>
              <Layout>
                <CustomerDetail />
              </Layout>
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App; 