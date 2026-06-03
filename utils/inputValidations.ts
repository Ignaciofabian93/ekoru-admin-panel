export const isValidEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isMinLength = (value: string, min: number) => value.length >= min;

/** Trims and collapses internal whitespace. Use right before submitting free-text fields. */
export const sanitizeOnSubmit = (value: string) => value.trim().replace(/\s+/g, " ");
