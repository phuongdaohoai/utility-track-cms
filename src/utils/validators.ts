export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const isValidPassword = (password: string): boolean => {
  // At least 8 characters, 1 uppercase, 1 number
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/
  return passwordRegex.test(password)
}

export const isValidPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^(\d{3})(\d{3})(\d{4})$/
  return phoneRegex.test(phone.replace(/\D/g, ''))
}

export default {
  isValidEmail,
  isValidPassword,
  isValidPhoneNumber,
}
