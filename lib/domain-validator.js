// List of common business email domains that are NOT allowed for brand registration
const CONSUMER_EMAIL_DOMAINS = [
  "gmail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
  "aol.com",
  "icloud.com",
  "protonmail.com",
  "mail.com",
  "yandex.com",
  "zoho.com",
]

export function validateBrandEmail(email) {
  if (!email || typeof email !== "string") {
    return { isValid: false, error: "Email is required" }
  }

  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { isValid: false, error: "Invalid email format" }
  }

  const domain = email.toLowerCase().split("@")[1]

  if (CONSUMER_EMAIL_DOMAINS.includes(domain)) {
    return {
      isValid: false,
      error: "Please use a business email address. Consumer email domains are not allowed for brand accounts.",
    }
  }

  return { isValid: true }
}

export function isBusinessEmail(email) {
  const validation = validateBrandEmail(email)
  return validation.isValid
}
