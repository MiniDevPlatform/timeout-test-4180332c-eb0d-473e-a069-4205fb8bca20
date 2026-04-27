/**
 * MiniDev ONE Template - Form Hook
 * 
 * Form state management, validation, and submission.
 */

import { useState, useCallback, useRef } from 'react';

export interface FormField {
  value: any;
  error?: string;
  touched: boolean;
  dirty: boolean;
}

export interface UseFormOptions<T extends Record<string, any>> {
  initialValues: T;
  validate?: (values: T) => Record<string, string>;
  onSubmit?: (values: T) => Promise<void> | void;
  validateOnBlur?: boolean;
  validateOnChange?: boolean;
}

export interface UseFormReturn<T extends Record<string, any>> {
  values: T;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
  handleChange: (field: string, value: any) => void;
  handleBlur: (field: string) => void;
  handleSubmit: () => Promise<void>;
  handleReset: () => void;
  setFieldValue: (field: string, value: any) => void;
  setFieldError: (field: string, error: string) => void;
  setFieldTouched: (field: string, touched?: boolean) => void;
  validateField: (field: string) => boolean;
  validateAll: () => boolean;
  register: (name: string) => {
    name: string;
    value: any;
    onChange: (e: any) => void;
    onBlur: () => void;
    error?: string;
  };
}

/**
 * Hook for form state management
 */
export function useForm<T extends Record<string, any>>(
  options: UseFormOptions<T>
): UseFormReturn<T> {
  const {
    initialValues,
    validate,
    onSubmit,
    validateOnBlur = true,
    validateOnChange = false,
  } = options;

  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isValidRef = useRef(false);

  // Calculate if form is dirty
  const isDirty = JSON.stringify(values) !== JSON.stringify(initialValues);

  // Check if form is valid
  const isValid = Object.keys(errors).length === 0 && isValidRef.current;

  // Handle field change
  const handleChange = useCallback(
    (field: string, value: any) => {
      setValues(prev => ({ ...prev, [field]: value }));

      if (validate && validateOnChange) {
        const newErrors = validate({ ...values, [field]: value });
        setErrors(prev => ({ ...prev, [field]: newErrors[field] }));
      }
    },
    [validate, validateOnChange, values]
  );

  // Handle field blur
  const handleBlur = useCallback(
    (field: string) => {
      setTouched(prev => ({ ...prev, [field]: true }));

      if (validate && validateOnBlur) {
        const newErrors = validate(values);
        if (newErrors[field]) {
          setErrors(prev => ({ ...prev, [field]: newErrors[field] }));
        } else {
          setErrors(prev => {
            const { [field]: _, ...rest } = prev;
            return rest;
          });
        }
      }
    },
    [validate, validateOnBlur, values]
  );

  // Validate single field
  const validateField = useCallback(
    (field: string): boolean => {
      if (!validate) return true;

      const newErrors = validate(values);
      if (newErrors[field]) {
        setErrors(prev => ({ ...prev, [field]: newErrors[field] }));
        return false;
      } else {
        setErrors(prev => {
          const { [field]: _, ...rest } = prev;
          return rest;
        });
        return true;
      }
    },
    [validate, values]
  );

  // Validate all fields
  const validateAll = useCallback((): boolean => {
    if (!validate) return true;

    const newErrors = validate(values);
    setErrors(newErrors);
    isValidRef.current = Object.keys(newErrors).length === 0;
    return isValidRef.current;
  }, [validate, values]);

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    // Mark all fields as touched
    const allTouched: Record<string, boolean> = {};
    Object.keys(values).forEach(key => {
      allTouched[key] = true;
    });
    setTouched(allTouched);

    // Validate
    const isValid = validateAll();
    if (!isValid) return;

    // Submit
    setIsSubmitting(true);
    try {
      await onSubmit?.(values);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validateAll, onSubmit]);

  // Handle form reset
  const handleReset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  // Set field value
  const setFieldValue = useCallback(
    (field: string, value: any) => {
      setValues(prev => ({ ...prev, [field]: value }));
    },
    []
  );

  // Set field error
  const setFieldError = useCallback(
    (field: string, error: string) => {
      setErrors(prev => ({ ...prev, [field]: error }));
    },
    []
  );

  // Set field touched
  const setFieldTouched = useCallback(
    (field: string, touchedState: boolean = true) => {
      setTouched(prev => ({ ...prev, [field]: touchedState }));
    },
    []
  );

  // Register field for use with controlled inputs
  const register = useCallback(
    (name: string) => {
      return {
        name,
        value: values[name as keyof T],
        onChange: (e: any) => {
          const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
          handleChange(name, value);
        },
        onBlur: () => handleBlur(name),
        error: touched[name] ? errors[name] : undefined,
      };
    },
    [values, errors, touched, handleChange, handleBlur]
  );

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    isDirty,
    handleChange,
    handleBlur,
    handleSubmit,
    handleReset,
    setFieldValue,
    setFieldError,
    setFieldTouched,
    validateField,
    validateAll,
    register,
  };
}

// =============================================================================
// PRESET VALIDATORS
// =============================================================================
export const validators = {
  required: (message: string = 'This field is required') => ({
    validate: (value: any) => {
      if (typeof value === 'string') return value.trim() !== '' ? null : message;
      if (Array.isArray(value)) return value.length > 0 ? null : message;
      return value != null ? null : message;
    },
  }),

  email: (message: string = 'Invalid email address') => ({
    validate: (value: string) => {
      if (!value) return null;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value) ? null : message;
    },
  }),

  minLength: (min: number, message?: string) => ({
    validate: (value: string) => {
      if (!value) return null;
      return value.length >= min ? null : message || `Minimum ${min} characters`;
    },
  }),

  maxLength: (max: number, message?: string) => ({
    validate: (value: string) => {
      if (!value) return null;
      return value.length <= max ? null : message || `Maximum ${max} characters`;
    },
  }),

  min: (min: number, message?: string) => ({
    validate: (value: number) => {
      if (value == null) return null;
      return value >= min ? null : message || `Minimum value is ${min}`;
    },
  }),

  max: (max: number, message?: string) => ({
    validate: (value: number) => {
      if (value == null) return null;
      return value <= max ? null : message || `Maximum value is ${max}`;
    },
  }),

  pattern: (regex: RegExp, message: string = 'Invalid format') => ({
    validate: (value: string) => {
      if (!value) return null;
      return regex.test(value) ? null : message;
    },
  }),

  match: (field: string, message?: string) => ({
    validate: (value: any, values: any) => {
      return value === values[field] ? null : message || `Must match ${field}`;
    },
  }),

  custom: (fn: (value: any) => boolean | string, message?: string) => ({
    validate: (value: any) => {
      const result = fn(value);
      if (typeof result === 'boolean') {
        return result ? null : message || 'Invalid value';
      }
      return result || null;
    },
  }),
};

// =============================================================================
// FORM BUILDER HELPERS
// =============================================================================
export interface FormSchema {
  [key: string]: {
    label?: string;
    placeholder?: string;
    type?: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select' | 'checkbox' | 'radio';
    validators?: Array<{ validate: (value: any, values?: any) => string | null }>;
    options?: { label: string; value: any }[];
    defaultValue?: any;
    disabled?: boolean;
    hidden?: boolean;
  };
}

export function validateSchema(
  values: Record<string, any>,
  schema: FormSchema
): Record<string, string> {
  const errors: Record<string, string> = {};

  Object.entries(schema).forEach(([field, config]) => {
    const value = values[field];
    const validators = config.validators || [];

    for (const validator of validators) {
      const error = validator.validate(value, values);
      if (error) {
        errors[field] = error;
        break;
      }
    }
  });

  return errors;
}

export default {
  useForm,
  validators,
  validateSchema,
};