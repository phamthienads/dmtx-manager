// Hàm làm tròn số tiền theo quy tắc chuẩn
export const roundMoney = (amount) => {
  // Làm tròn đến hàng nghìn
  return Math.round(amount / 1000) * 1000;
};

// Hàm định dạng số tiền theo chuẩn Việt Nam
export const formatMoney = (amount) => {
  if (!amount || isNaN(amount)) return '0 đ';
  return roundMoney(amount).toLocaleString('vi-VN') + ' đ';
};

// Hàm tính tổng tiền cho một sản phẩm (đã bao gồm chiết khấu)
export const calculateItemTotal = (item) => {
  if (!item || !item.price || !item.quantity) return 0;
  
  const itemTotal = Number(item.price) * Number(item.quantity);
  if (isNaN(itemTotal)) return 0;
  
  const discountAmount = (itemTotal * Number(item.discount || 0) / 100);
  const total = itemTotal - discountAmount;
  
  return roundMoney(total);
};

// Hàm tính tổng tiền cho toàn bộ hóa đơn
export const calculateInvoiceTotal = (items) => {
  if (!Array.isArray(items)) return 0;
  
  return items.reduce((sum, item) => {
    return sum + calculateItemTotal(item);
  }, 0);
}; 