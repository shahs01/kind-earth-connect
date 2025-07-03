import { useState, useCallback } from 'react';
import { 
  validateEmail, 
  validateUsername, 
  validatePassword, 
  validateMessageContent,
  ValidationResult 
} from '@/utils/security';

export const useSecurityValidation = () => {
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});

  const validateField = useCallback((fieldName: string, value: string, validationType: 'email' | 'username' | 'password' | 'message'): boolean => {
    let result: ValidationResult;

    switch (validationType) {
      case 'email':
        result = validateEmail(value);
        break;
      case 'username':
        result = validateUsername(value);
        break;
      case 'password':
        result = validatePassword(value);
        break;
      case 'message':
        result = validateMessageContent(value);
        break;
      default:
        result = { isValid: true, errors: [] };
    }

    setValidationErrors(prev => ({
      ...prev,
      [fieldName]: result.errors
    }));

    return result.isValid;
  }, []);

  const clearFieldErrors = useCallback((fieldName: string) => {
    setValidationErrors(prev => {
      const updated = { ...prev };
      delete updated[fieldName];
      return updated;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setValidationErrors({});
  }, []);

  const hasErrors = useCallback((fieldName?: string) => {
    if (fieldName) {
      return validationErrors[fieldName]?.length > 0;
    }
    return Object.keys(validationErrors).length > 0;
  }, [validationErrors]);

  const getFieldErrors = useCallback((fieldName: string) => {
    return validationErrors[fieldName] || [];
  }, [validationErrors]);

  return {
    validationErrors,
    validateField,
    clearFieldErrors,
    clearAllErrors,
    hasErrors,
    getFieldErrors
  };
};