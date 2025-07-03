// Security utilities for input validation and sanitization

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitized?: string;
}

// Input sanitization utilities
export const sanitizeText = (input: string): string => {
  if (!input) return '';
  
  // Remove potential XSS vectors
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
};

export const sanitizeHtml = (input: string): string => {
  if (!input) return '';
  
  // Basic HTML sanitization - remove dangerous tags
  const dangerousTags = /<(script|iframe|object|embed|form|input|textarea|button|link|meta|style)[^>]*>.*?<\/\1>/gi;
  return input.replace(dangerousTags, '').trim();
};

// Validation functions
export const validateEmail = (email: string): ValidationResult => {
  const errors: string[] = [];
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email) {
    errors.push('Email is required');
  } else if (!emailRegex.test(email)) {
    errors.push('Invalid email format');
  } else if (email.length > 254) {
    errors.push('Email is too long');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitized: email.toLowerCase().trim()
  };
};

export const validateUsername = (username: string): ValidationResult => {
  const errors: string[] = [];
  const usernameRegex = /^[a-zA-Z0-9_-]+$/;
  
  if (!username) {
    errors.push('Username is required');
  } else if (username.length < 3) {
    errors.push('Username must be at least 3 characters');
  } else if (username.length > 50) {
    errors.push('Username must be less than 50 characters');
  } else if (!usernameRegex.test(username)) {
    errors.push('Username can only contain letters, numbers, hyphens, and underscores');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitized: username.trim()
  };
};

export const validatePassword = (password: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!password) {
    errors.push('Password is required');
  } else {
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateMessageContent = (content: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!content) {
    errors.push('Message content is required');
  } else if (content.length > 5000) {
    errors.push('Message is too long (max 5000 characters)');
  }
  
  const sanitized = sanitizeText(content);
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitized
  };
};

// Rate limiting utilities
export const createRateLimitKey = (identifier: string, action: string): string => {
  return `${identifier}:${action}`;
};

export const isRateLimited = async (identifier: string, action: string, maxAttempts: number, windowMinutes: number): Promise<boolean> => {
  // This would typically be implemented with Redis or a database
  // For now, we'll use localStorage for client-side rate limiting
  const key = createRateLimitKey(identifier, action);
  const stored = localStorage.getItem(key);
  
  if (!stored) {
    localStorage.setItem(key, JSON.stringify({
      attempts: 1,
      windowStart: Date.now()
    }));
    return false;
  }
  
  const data = JSON.parse(stored);
  const windowStart = data.windowStart;
  const windowEnd = windowStart + (windowMinutes * 60 * 1000);
  
  if (Date.now() > windowEnd) {
    // Reset window
    localStorage.setItem(key, JSON.stringify({
      attempts: 1,
      windowStart: Date.now()
    }));
    return false;
  }
  
  if (data.attempts >= maxAttempts) {
    return true;
  }
  
  // Increment attempts
  localStorage.setItem(key, JSON.stringify({
    attempts: data.attempts + 1,
    windowStart: windowStart
  }));
  
  return false;
};

// Content filtering for inappropriate content
export const containsInappropriateContent = (content: string): boolean => {
  const inappropriatePatterns = [
    // Basic profanity filter - in production, use a more comprehensive service
    /\b(spam|scam|phishing)\b/i,
    // Add more patterns as needed
  ];
  
  return inappropriatePatterns.some(pattern => pattern.test(content));
};

// Session security utilities
export const generateSecureToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

export const isTokenExpired = (expiresAt: string): boolean => {
  return new Date(expiresAt) < new Date();
};