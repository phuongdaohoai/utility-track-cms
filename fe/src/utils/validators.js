/**
 * Validators Utility
 * Common validation functions
 */

export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 number
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
};

export const isValidPhoneNumber = (phone) => {
  const phoneRegex = /^(\d{3})(\d{3})(\d{4})$/;
  return phoneRegex.test(phone.replace(/\D/g, ''));
};

export default {
  isValidEmail,
  isValidPassword,
  isValidPhoneNumber,
};
