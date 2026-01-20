export const digitsOnly = (value) => String(value ?? "").replace(/\D/g, "");

export const formatIndianPhoneForInput = (value) => {
  const raw = String(value ?? "").trim();
  if (!raw) return "";

  const digits = digitsOnly(raw);

  // If stored as 91XXXXXXXXXX, show only local 10 digits.
  if (digits.length === 12 && digits.startsWith("91")) {
    return digits.slice(2);
  }

  return digits || raw;
};

export const validateIndianMobile10 = (value) => {
  const raw = String(value ?? "").trim();
  const digits = digitsOnly(raw);

  if (!digits) return "Phone number is required";

  if (digits.length !== 10) {
    if (digits.length === 12 && digits.startsWith("91")) {
      return "Enter 10-digit phone number without +91/91";
    }
    return "Phone number must be exactly 10 digits";
  }

  return null;
};

export const validatePincode6 = (value) => {
  const raw = String(value ?? "").trim();
  const digits = digitsOnly(raw);

  if (!digits) return "Pincode is required";
  if (digits.length !== 6) return "Pincode must be exactly 6 digits";

  return null;
};
