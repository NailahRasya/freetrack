/**
 * Format number or string to Rupiah currency format.
 * Example: 5000000 -> "Rp 5.000.000"
 */
export const formatRupiah = (value: number | string): string => {
  if (typeof value === "string") {
    // Remove any non-numeric characters except for formatting
    const numericValue = parseInt(value.replace(/[^0-9]/g, ""), 10);
    if (isNaN(numericValue)) return "Rp 0";
    value = numericValue;
  }

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

/**
 * Parse Rupiah string back to numeric string or number.
 * Example: "Rp 5.000.000" -> "5000000"
 */
export const parseRupiah = (value: string): string => {
  return value.replace(/[^0-9]/g, "");
};
