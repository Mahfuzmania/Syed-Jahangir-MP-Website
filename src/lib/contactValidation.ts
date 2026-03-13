export function normalizeBanglaDigits(value: string) {
  const banglaDigits = "০১২৩৪৫৬৭৮৯";
  return value.replace(/[০-৯]/g, (digit) => String(banglaDigits.indexOf(digit)));
}

export function normalizePhoneInput(value: string) {
  return normalizeBanglaDigits(value).replace(/[\s-]/g, "");
}

export function toCanonicalBdPhone(value: string) {
  const phone = normalizePhoneInput(value);
  if (phone.startsWith("+880")) {
    return phone;
  }
  if (phone.startsWith("880")) {
    return `+${phone}`;
  }
  if (phone.startsWith("01")) {
    return `+88${phone}`;
  }
  return phone;
}

export function isValidBdPhone(value: string) {
  const phone = normalizePhoneInput(value);
  return /^(?:\+?88)?01[3-9]\d{8}$/.test(phone);
}

export function isValidEmailFormat(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

export function validateWriteToMpInput(input: {
  phone?: string;
  email?: string;
  category?: string;
  unionWard?: string;
  area?: string;
  message?: string;
  consentGiven?: boolean;
}) {
  const errors: string[] = [];
  const normalizedEmail = input.email ? normalizeBanglaDigits(input.email).trim() : "";
  const normalizedCategory = input.category?.trim() || "";
  const normalizedUnionWard = input.unionWard?.trim() || "";
  const trimmedArea = input.area?.trim() || "";
  const trimmedMessage = input.message?.trim() || "";

  if (!input.phone || !isValidBdPhone(input.phone)) {
    errors.push("Please provide a valid Bangladeshi mobile number.");
  }

  if (normalizedEmail && !isValidEmailFormat(normalizedEmail)) {
    errors.push("Please provide a valid email address.");
  }

  if (normalizedCategory.length === 0) {
    errors.push("Please select a category.");
  }

  if (normalizedUnionWard.length < 2) {
    errors.push("Please provide a valid union/ward.");
  }

  if (trimmedArea.length < 3) {
    errors.push("Please provide a valid area/address.");
  }

  if (trimmedMessage.length < 10) {
    errors.push("Please provide a detailed message (minimum 10 characters).");
  }

  if (!input.consentGiven) {
    errors.push("Consent is required.");
  }

  return errors;
}
