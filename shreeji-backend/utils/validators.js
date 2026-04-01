// utils/validators.js

const isValidPhone = (phone) => {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone);
};

const isValidAmount = (amount) => {
  const num = Number(amount);

  if (isNaN(num)) return false;
  if (num <= 0) return false;
  if (num > 100000) return false;

  return true;
};

module.exports = { isValidPhone ,isValidAmount};