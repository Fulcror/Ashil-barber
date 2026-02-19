import { AppError } from "./errorHandler";

export const VALIDATION_RULES = {
  phone: {
    regex: /^[\d\s\-\+\(\)]{7,20}$/,
    maxLength: 20,
  },
  confirmationCode: {
    regex: /^[A-Z0-9]{6,8}$/,
  },
  date: {
    regex: /^\d{4}-\d{2}-\d{2}$/,
  },
  time: {
    regex: /^\d{2}:\d{2}\s(AM|PM)$/,
  },
  name: {
    maxLength: 100,
    regex: /^[a-zA-Z\s'-]{2,100}$/,
  },
};

export function validatePhone(phone) {
  if (!phone?.trim()) {
    throw new AppError("Phone number is required", 400);
  }
  if (phone.length > VALIDATION_RULES.phone.maxLength) {
    throw new AppError("Phone number too long", 400);
  }
  if (!VALIDATION_RULES.phone.regex.test(phone)) {
    throw new AppError("Invalid phone number format", 400);
  }
  return phone.trim();
}

export function validateConfirmationCode(code) {
  if (!code?.trim()) {
    throw new AppError("Confirmation code is required", 400);
  }
  const upperCode = code.toUpperCase();
  if (!VALIDATION_RULES.confirmationCode.regex.test(upperCode)) {
    throw new AppError(
      "Invalid confirmation code format (must be 6-8 alphanumeric)",
      400,
    );
  }
  return upperCode;
}

export function validateDate(date) {
  if (!date?.trim()) {
    throw new AppError("Date is required", 400);
  }
  if (!VALIDATION_RULES.date.regex.test(date)) {
    throw new AppError("Invalid date format (use YYYY-MM-DD)", 400);
  }
  const d = new Date(date);
  if (isNaN(d.getTime())) {
    throw new AppError("Invalid date", 400);
  }
  return date.trim();
}

export function validateTime(time) {
  if (!time?.trim()) {
    throw new AppError("Time is required", 400);
  }
  if (!VALIDATION_RULES.time.regex.test(time)) {
    throw new AppError("Invalid time format (use HH:MM AM/PM)", 400);
  }
  return time.trim();
}

export function validateName(name) {
  if (!name?.trim()) {
    throw new AppError("Name is required", 400);
  }
  if (name.length > VALIDATION_RULES.name.maxLength) {
    throw new AppError("Name too long", 400);
  }
  if (!VALIDATION_RULES.name.regex.test(name)) {
    throw new AppError(
      "Invalid name format (letters, spaces, hyphens, apostrophes only)",
      400,
    );
  }
  return name.trim();
}
