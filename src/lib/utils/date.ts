/**
 * MiniDev ONE Template - Date & Time Utilities
 * 
 * Date formatting, parsing, and manipulation.
 */

// =============================================================================
// DATE FORMATS
// =============================================================================
export const DATE_FORMATS = {
  short: 'M/D/YY',
  medium: 'MMM D, YYYY',
  long: 'MMMM D, YYYY',
  full: 'dddd, MMMM D, YYYY',
  time: 'h:mm A',
  time24: 'HH:mm',
  datetime: 'MMM D, YYYY h:mm A',
  iso: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
  utc: 'YYYY-MM-DDTHH:mm:ss[Z]',
};

// =============================================================================
// DATE UTILITIES
// =============================================================================
export function formatDate(date: Date | number | string, format: string = DATE_FORMATS.medium): string {
  const d = new Date(date);
  
  if (isNaN(d.getTime())) return 'Invalid Date';

  const year = d.getFullYear();
  const month = d.getMonth();
  const day = d.getDate();
  const hours = d.getHours();
  const minutes = d.getMinutes();
  const seconds = d.getSeconds();
  const dayOfWeek = d.getDay();

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                  'July', 'August', 'September', 'October', 'November', 'December'];
  const monthsShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const daysShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return format
    .replace('dddd', days[dayOfWeek])
    .replace('ddd', daysShort[dayOfWeek])
    .replace('MMMM', months[month])
    .replace('MMM', monthsShort[month])
    .replace('MM', String(month + 1).padStart(2, '0'))
    .replace('M', String(month + 1))
    .replace('DDDD', String(day).padStart(2, '0'))
    .replace('DD', String(day).padStart(2, '0'))
    .replace('D', String(day))
    .replace('YYYY', String(year))
    .replace('YY', String(year).slice(-2))
    .replace('HH', String(hours).padStart(2, '0'))
    .replace('H', String(hours))
    .replace('hh', String(hours % 12 || 12).padStart(2, '0'))
    .replace('h', String(hours % 12 || 12))
    .replace('mm', String(minutes).padStart(2, '0'))
    .replace('m', String(minutes))
    .replace('ss', String(seconds).padStart(2, '0'))
    .replace('s', String(seconds))
    .replace('A', hours >= 12 ? 'PM' : 'AM')
    .replace('a', hours >= 12 ? 'pm' : 'am')
    .replace('SSS', String(d.getMilliseconds()).padStart(3, '0'))
    .replace('Z', d.toISOString().endsWith('Z') ? 'Z' : '');
}

export function formatRelativeTime(date: Date | number | string): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffDay / 365);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  if (diffWeek < 4) return `${diffWeek}w ago`;
  if (diffMonth < 12) return `${diffMonth}mo ago`;
  return `${diffYear}y ago`;
}

export function formatDuration(seconds: number, short: boolean = false): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (short) {
    if (hours > 0) return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    return `${minutes}:${String(secs).padStart(2, '0')}`;
  }

  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

  return parts.join(' ');
}

export function formatCountdown(target: Date | number | string): string {
  const d = new Date(target);
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();

  if (diffMs <= 0) return '00:00:00';

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// =============================================================================
// DATE PARSING
// =============================================================================
export function parseDate(date: string | number): Date | null {
  if (!date) return null;
  
  // Try standard parsing
  const d = new Date(date);
  if (!isNaN(d.getTime())) return d;

  // Try specific formats
  const formats = [
    /(\d{4})-(\d{2})-(\d{2})/,  // YYYY-MM-DD
    /(\d{2})\/(\d{2})\/(\d{4})/, // MM/DD/YYYY
    /(\d{2})-(\d{2})-(\d{4})/,  // MM-DD-YYYY
  ];

  for (const regex of formats) {
    const match = date.match(regex);
    if (match) {
      const [_, a, b, c] = match;
      // Determine if first part is year or month
      if (parseInt(a) > 31) {
        // YYYY-MM-DD
        return new Date(parseInt(a), parseInt(b) - 1, parseInt(c));
      } else {
        // MM/DD/YYYY or MM-DD-YYYY
        return new Date(parseInt(c), parseInt(a) - 1, parseInt(b));
      }
    }
  }

  return null;
}

export function isToday(date: Date | number | string): boolean {
  const d = new Date(date);
  const today = new Date();
  return d.toDateString() === today.toDateString();
}

export function isYesterday(date: Date | number | string): boolean {
  const d = new Date(date);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return d.toDateString() === yesterday.toDateString();
}

export function isTomorrow(date: Date | number | string): boolean {
  const d = new Date(date);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return d.toDateString() === tomorrow.toDateString();
}

export function isSameDay(a: Date | number | string, b: Date | number | string): boolean {
  const da = new Date(a);
  const db = new Date(b);
  return da.toDateString() === db.toDateString();
}

// =============================================================================
// DATE MANIPULATION
// =============================================================================
export function addDays(date: Date | number | string, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function addMonths(date: Date | number | string, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

export function addYears(date: Date | number | string, years: number): Date {
  const d = new Date(date);
  d.setFullYear(d.getFullYear() + years);
  return d;
}

export function startOfDay(date: Date | number | string): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfDay(date: Date | number | string): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function startOfWeek(date: Date | number | string, weekStartsOn: number = 0): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn;
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfWeek(date: Date | number | string, weekStartsOn: number = 0): Date {
  const d = startOfWeek(date, weekStartsOn);
  d.setDate(d.getDate() + 6);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function startOfMonth(date: Date | number | string): Date {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfMonth(date: Date | number | string): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + 1, 0);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function getDaysInMonth(date: Date | number | string): number {
  const d = new Date(date);
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
}

export function getWeekNumber(date: Date | number | string): number {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

// =============================================================================
// CALENDAR HELPERS
// =============================================================================
export interface CalendarDay {
  date: Date;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
  isPast: boolean;
  isFuture: boolean;
}

export function getCalendarDays(year: number, month: number, weekStartsOn: number = 0): CalendarDay[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDay = startOfWeek(firstDay, weekStartsOn);
  
  const days: CalendarDay[] = [];
  const today = new Date();
  
  // Get 6 weeks (42 days) for consistent grid
  for (let i = 0; i < 42; i++) {
    const date = new Date(startDay);
    date.setDate(startDay.getDate() + i);

    days.push({
      date,
      day: date.getDate(),
      isCurrentMonth: date.getMonth() === month,
      isToday: isSameDay(date, today),
      isWeekend: date.getDay() === 0 || date.getDay() === 6,
      isPast: date < today && !isSameDay(date, today),
      isFuture: date > today,
    });
  }

  return days;
}

// =============================================================================
// EXPORTS
// =============================================================================
export default {
  DATE_FORMATS,
  formatDate,
  formatRelativeTime,
  formatDuration,
  formatCountdown,
  parseDate,
  isToday,
  isYesterday,
  isTomorrow,
  isSameDay,
  addDays,
  addMonths,
  addYears,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  getDaysInMonth,
  getWeekNumber,
  getCalendarDays,
};