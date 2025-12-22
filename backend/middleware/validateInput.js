import validator from 'validator';

/**
 * Remove HTML tags from string
 */
function removeHtmlTags(str) {
  return str.replace(/<[^>]*>/g, '');
}

/**
 * Escape HTML special characters
 */
function escapeHtml(str) {
  const htmlEscapes = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  return str.replace(/[&<>"'/]/g, char => htmlEscapes[char]);
}

/**
 * Sanitize string input to prevent XSS
 */
export function sanitizeString(input) {
  if (typeof input !== 'string') return input;
  // Remove HTML tags and escape special characters
  return escapeHtml(removeHtmlTags(input));
}

/**
 * Sanitize object recursively
 */
export function sanitizeObject(obj) {
  if (obj === null || obj === undefined) return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }
  
  if (typeof obj === 'object') {
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObject(value);
    }
    return sanitized;
  }
  
  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }
  
  return obj;
}

/**
 * Validate and sanitize request body
 */
export const validateInput = (req, res, next) => {
  // Sanitize all string inputs in body
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  // Sanitize query parameters in-place (read-only in Express 5)
  if (req.query) {
    for (const key of Object.keys(req.query)) {
      if (typeof req.query[key] === 'string') {
        req.query[key] = sanitizeString(req.query[key]);
      }
    }
  }

  // Sanitize params in-place (read-only in Express 5)
  if (req.params) {
    for (const key of Object.keys(req.params)) {
      if (typeof req.params[key] === 'string') {
        req.params[key] = sanitizeString(req.params[key]);
      }
    }
  }

  next();
};

/**
 * Validate email format
 */
export function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email is required and must be a string' };
  }
  
  try {
    const sanitized = validator.normalizeEmail(email);
    if (!sanitized || !validator.isEmail(sanitized)) {
      return { valid: false, error: 'Invalid email format' };
    }
    return { valid: true, value: sanitized };
  } catch (error) {
    // Fallback to basic regex if validator fails
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const normalized = email.trim().toLowerCase();
    if (!emailRegex.test(normalized)) {
      return { valid: false, error: 'Invalid email format' };
    }
    return { valid: true, value: normalized };
  }
}

/**
 * Validate phone number (E.164 format)
 */
export function validatePhone(phone) {
  if (!phone || typeof phone !== 'string') {
    return { valid: false, error: 'Phone number is required and must be a string' };
  }
  
  // Remove common formatting characters
  const cleaned = phone.replace(/[\s\-\(\)\.]/g, '');
  
  try {
    // Try validator.js first
    if (validator.isMobilePhone(cleaned, 'any', { strictMode: false })) {
      // Convert to E.164 if needed
      if (!cleaned.startsWith('+')) {
        const e164 = cleaned.startsWith('1') ? `+${cleaned}` : `+1${cleaned}`;
        return { valid: true, value: e164 };
      }
      return { valid: true, value: cleaned };
    }
  } catch (error) {
    // Fallback to regex validation
  }
  
  // Check if it starts with + (E.164 format)
  if (cleaned.startsWith('+')) {
    const e164Regex = /^\+[1-9]\d{1,14}$/;
    if (e164Regex.test(cleaned)) {
      return { valid: true, value: cleaned };
    }
  }
  
  // US format: 10 digits (with or without leading 1)
  const usFormatRegex = /^1?[2-9]\d{2}[2-9]\d{2}\d{4}$/;
  if (usFormatRegex.test(cleaned)) {
    const e164 = cleaned.startsWith('1') ? `+${cleaned}` : `+1${cleaned}`;
    return { valid: true, value: e164 };
  }
  
  return { valid: false, error: 'Invalid phone number format. Please use E.164 format (e.g., +1234567890)' };
}

/**
 * Validate date (not in past, within 90 days)
 */
export function validateDate(dateString) {
  if (!dateString || typeof dateString !== 'string') {
    return { valid: false, error: 'Date is required and must be a string' };
  }
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return { valid: false, error: 'Invalid date format' };
  }
  
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const dateOnly = new Date(date);
  dateOnly.setHours(0, 0, 0, 0);
  
  if (dateOnly < now) {
    return { valid: false, error: 'Date cannot be in the past' };
  }
  
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 90);
  
  if (dateOnly > maxDate) {
    return { valid: false, error: 'Date cannot be more than 90 days in the future' };
  }
  
  return { valid: true, value: dateString };
}

/**
 * Validate amount (positive number, max $1000)
 */
export function validateAmount(amount) {
  if (amount === null || amount === undefined) {
    return { valid: false, error: 'Amount is required' };
  }
  
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) {
    return { valid: false, error: 'Amount must be a valid number' };
  }
  
  if (numAmount <= 0) {
    return { valid: false, error: 'Amount must be greater than 0' };
  }
  
  if (numAmount > 1000) {
    return { valid: false, error: 'Amount cannot exceed $1000' };
  }
  
  return { valid: true, value: numAmount };
}

/**
 * Validate order number format (ORD-YYYYMMDD-XXXXXX)
 */
export function validateOrderNumber(orderNumber) {
  if (!orderNumber || typeof orderNumber !== 'string') {
    return { valid: false, error: 'Order number is required and must be a string' };
  }
  
  const pattern = /^ORD-[A-Z0-9]+-[A-Z0-9]+$/i;
  if (!pattern.test(orderNumber)) {
    return { valid: false, error: 'Invalid order number format' };
  }
  
  return { valid: true, value: orderNumber.toUpperCase() };
}

/**
 * Validate required fields
 */
export function validateRequired(fields, data) {
  const errors = {};
  
  for (const field of fields) {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      errors[field] = `${field} is required`;
    }
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Middleware to validate request body against schema
 */
export const validateBody = (schema) => {
  return (req, res, next) => {
    const validation = schema(req.body);
    
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Request validation failed',
          details: validation.errors || validation.error,
        },
      });
    }
    
    // Replace body with validated/sanitized values
    if (validation.value) {
      req.body = validation.value;
    }
    
    next();
  };
};
