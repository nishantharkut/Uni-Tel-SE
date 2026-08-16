import { useState, useCallback } from 'react';

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export function useFormValidation<T extends Record<string, any>>(
  initialValues: T,
  validators: Record<keyof T, (value: any, allValues: T) => string | null>
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  const validateField = useCallback(
    (field: keyof T, value: any) => {
      const validator = validators[field];
      if (!validator) return null;

      const error = validator(value, values);
      return error;
    },
    [validators, values]
  );

  const validateAll = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof T, string>> = {};
    let isValid = true;

    Object.keys(validators).forEach((field) => {
      const fieldKey = field as keyof T;
      const error = validateField(fieldKey, values[fieldKey]);
      if (error) {
        newErrors[fieldKey] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [values, validators, validateField]);

  const setValue = useCallback(
    (field: keyof T, value: any, validate = true) => {
      setValues((prev) => ({ ...prev, [field]: value }));

      if (validate && touched[field]) {
        const error = validateField(field, value);
        setErrors((prev) => ({
          ...prev,
          [field]: error || undefined,
        }));
      }
    },
    [touched, validateField]
  );

  const setFieldTouched = useCallback((field: keyof T) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field, values[field]);
    setErrors((prev) => ({
      ...prev,
      [field]: error || undefined,
    }));
  }, [values, validateField]);

  const reset = useCallback((newValues?: T) => {
    setValues(newValues || initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  const getFieldError = useCallback(
    (field: keyof T): string | undefined => {
      return errors[field];
    },
    [errors]
  );

  const hasError = useCallback(
    (field: keyof T): boolean => {
      return !!errors[field];
    },
    [errors]
  );

  return {
    values,
    errors,
    touched,
    setValue,
    setFieldTouched,
    validateAll,
    reset,
    getFieldError,
    hasError,
    isValid: Object.keys(errors).length === 0,
  };
}






