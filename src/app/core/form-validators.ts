import {
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';

export function trimmedRequiredValidator(
  control: AbstractControl<string | null>
): ValidationErrors | null {
  const value = control.value;

  if (typeof value !== 'string') {
    return value ? null : { required: true };
  }

  return value.trim() ? null : { required: true };
}

export function strongPasswordValidator(minLength = 8): ValidatorFn {
  return (control: AbstractControl<string | null>): ValidationErrors | null => {
    const value = control.value ?? '';

    if (!value) {
      return null;
    }

    const trimmed = value.trim();
    const errors: ValidationErrors = {};

    if (trimmed.length < minLength) {
      errors['minlength'] = {
        requiredLength: minLength,
        actualLength: trimmed.length,
      };
    }

    if (!/[A-Za-z]/.test(trimmed)) {
      errors['letter'] = true;
    }

    if (!/\d/.test(trimmed)) {
      errors['number'] = true;
    }

    if (/\s/.test(value)) {
      errors['whitespace'] = true;
    }

    return Object.keys(errors).length > 0 ? errors : null;
  };
}

export function fieldsMatchValidator(
  firstKey: string,
  secondKey: string,
  errorKey = 'fieldsMismatch'
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const first = control.get(firstKey);
    const second = control.get(secondKey);

    if (!first || !second) {
      return null;
    }

    return first.value === second.value ? null : { [errorKey]: true };
  };
}

export function httpUrlValidator(
  control: AbstractControl<string | null>
): ValidationErrors | null {
  const rawValue = control.value?.trim();

  if (!rawValue) {
    return null;
  }

  try {
    const parsed = new URL(rawValue);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
      ? null
      : { invalidUrl: true };
  } catch {
    return { invalidUrl: true };
  }
}
