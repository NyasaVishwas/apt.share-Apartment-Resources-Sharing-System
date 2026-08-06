/**
 * Indian Localization Formatters for apt.share
 * Supports INR currency formatting (en-IN lakh/crore digit grouping),
 * Indian date display (DD Mon YYYY), and IST time formatting.
 */

/**
 * Format a currency value in INR using Indian number grouping (lakh/crore).
 * @param {number} amount - Amount in Rupees (or paise if isPaise = true)
 * @param {object} options - { isPaise: false, compact: false }
 */
export const formatINR = (amount, options = {}) => {
  const { isPaise = false, compact = false } = options;
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '₹0';
  }

  const valueInRupees = isPaise ? amount / 100 : amount;

  if (compact && valueInRupees >= 100000) {
    if (valueInRupees >= 10000000) {
      const croreVal = (valueInRupees / 10000000).toFixed(2).replace(/\.00$/, '');
      return `₹${croreVal} Cr`;
    }
    const lakhVal = (valueInRupees / 100000).toFixed(2).replace(/\.00$/, '');
    return `₹${lakhVal} Lakh`;
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(valueInRupees);
};

/**
 * Format date as "DD Mon YYYY" (e.g., "8 Aug 2026")
 */
export const formatIndianDate = (dateInput) => {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '';

  return new Intl.NumberFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  }).format(date);
};

/**
 * Format date & time as "DD Mon YYYY, h:mm A" (e.g., "8 Aug 2026, 6:00 PM")
 */
export const formatIndianDateTime = (dateInput) => {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '';

  const dateStr = date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  });

  const timeStr = date.toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata',
  });

  return `${dateStr}, ${timeStr}`;
};
