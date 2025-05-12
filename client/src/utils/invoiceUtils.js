export const generateInvoiceCode = (type = 'LE', date = new Date()) => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear()).slice(-2);
  
  // Tạo mã ngẫu nhiên 4 ký tự
  const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
  
  return `${day}${month}${year}${type}${randomChars}`;
}; 