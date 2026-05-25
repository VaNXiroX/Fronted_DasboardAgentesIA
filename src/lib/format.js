// Money formatter: $#,### MXN
export const formatMXN = (amount) => {
  if (amount == null || isNaN(amount)) return '$0 MXN';
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  }).format(amount);
};

// Short date: "24 May 2026"
export const formatDateShort = (dateStr) => {
  if (!dateStr) return 'Sin fecha';
  try {
    const d = new Date(dateStr + (dateStr.length === 10 ? 'T12:00:00' : ''));
    return new Intl.DateTimeFormat('es-MX', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateStr;
  }
};

// Month label: "Ene 2025"
export const formatMonthLabel = (yearMonth) => {
  if (!yearMonth) return '';
  const [year, month] = yearMonth.split('-');
  const d = new Date(Number(year), Number(month) - 1, 1);
  return new Intl.DateTimeFormat('es-MX', { month: 'short', year: '2-digit' }).format(d);
};

// "Desde Ene 2025"
export const formatSinceDate = (dateStr) => {
  if (!dateStr) return 'Sin fecha';
  try {
    const d = new Date(dateStr + (dateStr.length === 10 ? 'T12:00:00' : ''));
    const label = new Intl.DateTimeFormat('es-MX', { month: 'short', year: 'numeric' }).format(d);
    return `Desde ${label}`;
  } catch {
    return dateStr;
  }
};

// Current month as "YYYY-MM"
export const currentYearMonth = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
};

// Parse "YYYY-MM" to Date (first of month)
export const parseYearMonth = (ym) => {
  const [y, m] = ym.split('-');
  return new Date(Number(y), Number(m) - 1, 1);
};

// Generate array of "YYYY-MM" strings from startDate to current month (inclusive)
export const generateMonthRange = (startDate) => {
  if (!startDate) return [];
  const start = new Date(startDate + (startDate.length === 10 ? 'T12:00:00' : ''));
  const now = new Date();
  const months = [];
  const cur = new Date(start.getFullYear(), start.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth(), 1);
  while (cur <= end) {
    const y = cur.getFullYear();
    const m = String(cur.getMonth() + 1).padStart(2, '0');
    months.push(`${y}-${m}`);
    cur.setMonth(cur.getMonth() + 1);
  }
  return months;
};

// Initials from name (up to 2 chars)
export const getInitials = (name = '') => {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
};

// Slug from name
export const slugify = (name = '') =>
  name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
