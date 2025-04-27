export const generateInvoiceCode = (type = 'LE') => {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = String(now.getFullYear()).slice(-2);
  
  // Tạo mã ngẫu nhiên 4 ký tự
  const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
  
  return `${day}${month}${year}${type}${randomChars}`;
}; 