import { AppError } from './errorHandler.js';
import { validateEmail, validatePhone, validateDate, validateAmount, validateOrderNumber, validateRequired } from './validateInput.js';

/**
 * Validate order creation request
 */
export const validateOrder = (req, res, next) => {
  const { customer_name, customer_email, customer_phone, date_needed, time_needed, total_amount } = req.body;

  const errors = {};

  // Required fields
  const requiredValidation = validateRequired(
    ['customer_name', 'customer_email', 'customer_phone', 'date_needed', 'time_needed', 'total_amount'],
    req.body
  );

  if (!requiredValidation.valid) {
    Object.assign(errors, requiredValidation.errors);
  }

  // Validate email
  if (customer_email) {
    const emailValidation = validateEmail(customer_email);
    if (!emailValidation.valid) {
      errors.customer_email = emailValidation.error;
    } else {
      req.body.customer_email = emailValidation.value;
    }
  }

  // Validate phone
  if (customer_phone) {
    const phoneValidation = validatePhone(customer_phone);
    if (!phoneValidation.valid) {
      errors.customer_phone = phoneValidation.error;
    } else {
      req.body.customer_phone = phoneValidation.value;
    }
  }

  // Validate date
  if (date_needed) {
    const dateValidation = validateDate(date_needed);
    if (!dateValidation.valid) {
      errors.date_needed = dateValidation.error;
    }
  }

  // Validate amount
  if (total_amount !== undefined) {
    const amountValidation = validateAmount(total_amount);
    if (!amountValidation.valid) {
      errors.total_amount = amountValidation.error;
    } else {
      req.body.total_amount = amountValidation.value;
    }
  }

  // Validate time format (HH:MM)
  if (time_needed) {
    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(time_needed)) {
      errors.time_needed = 'Time must be in HH:MM format (24-hour)';
    }
  }

  if (Object.keys(errors).length > 0) {
    return next(new AppError('Validation failed', 400, 'VALIDATION_ERROR', errors));
  }

  next();
};

/**
 * Validate order update request
 */
export const validateOrderUpdate = (req, res, next) => {
  const { customer_email, customer_phone, date_needed, total_amount } = req.body;

  const errors = {};

  // Validate email if provided
  if (customer_email !== undefined) {
    const emailValidation = validateEmail(customer_email);
    if (!emailValidation.valid) {
      errors.customer_email = emailValidation.error;
    } else {
      req.body.customer_email = emailValidation.value;
    }
  }

  // Validate phone if provided
  if (customer_phone !== undefined) {
    const phoneValidation = validatePhone(customer_phone);
    if (!phoneValidation.valid) {
      errors.customer_phone = phoneValidation.error;
    } else {
      req.body.customer_phone = phoneValidation.value;
    }
  }

  // Validate date if provided
  if (date_needed !== undefined) {
    const dateValidation = validateDate(date_needed);
    if (!dateValidation.valid) {
      errors.date_needed = dateValidation.error;
    }
  }

  // Validate amount if provided
  if (total_amount !== undefined) {
    const amountValidation = validateAmount(total_amount);
    if (!amountValidation.valid) {
      errors.total_amount = amountValidation.error;
    } else {
      req.body.total_amount = amountValidation.value;
    }
  }

  if (Object.keys(errors).length > 0) {
    return next(new AppError('Validation failed', 400, 'VALIDATION_ERROR', errors));
  }

  next();
};

/**
 * Validate order number parameter
 */
export const validateOrderNumberParam = (req, res, next) => {
  const { orderNumber } = req.params;

  if (!orderNumber) {
    return next(new AppError('Order number is required', 400, 'VALIDATION_ERROR'));
  }

  const validation = validateOrderNumber(orderNumber);
  if (!validation.valid) {
    return next(new AppError(validation.error || 'Invalid order number', 400, 'VALIDATION_ERROR'));
  }

  req.params.orderNumber = validation.value;
  next();
};
