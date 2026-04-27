/**
 * MiniDev ONE Template - Number Utilities
 * 
 * Number formatting, parsing, and manipulation.
 */

// =============================================================================
// NUMBER FORMATTING
// =============================================================================
export function formatNumber(num: number, decimals: number = 0): string {
  return num.toFixed(decimals);
}

export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
}

export function formatPercent(value: number, decimals: number = 0): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

export function formatFileSize(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}

export function formatCompact(num: number): string {
  const formatter = new Intl.NumberFormat('en', { notation: 'compact' });
  return formatter.format(num);
}

export function formatOrdinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${minutes}:${String(secs).padStart(2, '0')}`;
}

export function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = Math.floor(minutes % 60);

  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
}

// =============================================================================
// NUMBER PARSING
// =============================================================================
export function parseNumber(str: string, fallback: number = 0): number {
  const num = parseFloat(str);
  return isNaN(num) ? fallback : num;
}

export function parseInt(str: string, fallback: number = 0): number {
  const num = parseInt(str, 10);
  return isNaN(num) ? fallback : num;
}

export function parseCurrency(str: string): number {
  // Remove currency symbols and formatting
  const cleaned = str.replace(/[^0-9.-]/g, '');
  return parseFloat(cleaned) || 0;
}

export function parsePercent(str: string): number {
  const num = parseFloat(str.replace('%', ''));
  return isNaN(num) ? 0 : num / 100;
}

export function parseBinary(str: string): number {
  return parseInt(str, 2);
}

export function parseHex(str: string): number {
  return parseInt(str.replace(/^0x/i, ''), 16);
}

// =============================================================================
// NUMBER MANIPULATION
// =============================================================================
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function round(value: number, decimals: number = 0): number {
  const multiplier = Math.pow(10, decimals);
  return Math.round(value * multiplier) / multiplier;
}

export function floor(value: number, decimals: number = 0): number {
  const multiplier = Math.pow(10, decimals);
  return Math.floor(value * multiplier) / multiplier;
}

export function ceil(value: number, decimals: number = 0): number {
  const multiplier = Math.pow(10, decimals);
  return Math.ceil(value * multiplier) / multiplier;
}

export function truncate(value: number, decimals: number = 0): number {
  const multiplier = Math.pow(10, decimals);
  return Math.trunc(value * multiplier) / multiplier;
}

export function random(min: number = 0, max: number = 1): number {
  return Math.random() * (max - min) + min;
}

export function randomInt(min: number, max: number): number {
  return Math.floor(random(min, max + 1));
}

export function randomBoolean(probability: number = 0.5): boolean {
  return Math.random() < probability;
}

export function randomItem<T>(array: T[]): T | undefined {
  return array[Math.floor(Math.random() * array.length)];
}

export function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// =============================================================================
// NUMBER VALIDATION
// =============================================================================
export function isEven(n: number): boolean {
  return n % 2 === 0;
}

export function isOdd(n: number): boolean {
  return n % 2 !== 0;
}

export function isInteger(n: number): boolean {
  return Number.isInteger(n);
}

export function isPositive(n: number): boolean {
  return n > 0;
}

export function isNegative(n: number): boolean {
  return n < 0;
}

export function isZero(n: number): boolean {
  return n === 0;
}

export function isNaN(n: number): boolean {
  return Number.isNaN(n);
}

export function isFinite(n: number): boolean {
  return Number.isFinite(n);
}

export function isDivisible(n: number, divisor: number): boolean {
  return divisor !== 0 && n % divisor === 0;
}

// =============================================================================
// NUMBER COMPARISON
// =============================================================================
export function roughlyEqual(a: number, b: number, epsilon: number = 0.0001): boolean {
  return Math.abs(a - b) < epsilon;
}

export function sum(nums: number[]): number {
  return nums.reduce((a, b) => a + b, 0);
}

export function average(nums: number[]): number {
  return nums.length > 0 ? sum(nums) / nums.length : 0;
}

export function median(nums: number[]): number {
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

export function min(nums: number[]): number {
  return Math.min(...nums);
}

export function max(nums: number[]): number {
  return Math.max(...nums);
}

export function range(start: number, end: number, step: number = 1): number[] {
  const result: number[] = [];
  for (let i = start; i <= end; i += step) {
    result.push(i);
  }
  return result;
}

export function percentage(value: number, total: number): number {
  return total !== 0 ? value / total : 0;
}

// =============================================================================
// PERCENTAGE UTILITIES
// =============================================================================
export function percentOf(part: number, whole: number): number {
  return whole !== 0 ? (part / whole) * 100 : 0;
}

export function percentChange(oldValue: number, newValue: number): number {
  return oldValue !== 0 ? ((newValue - oldValue) / oldValue) * 100 : 0;
}

export function increaseByPercent(value: number, percent: number): number {
  return value * (1 + percent / 100);
}

export function decreaseByPercent(value: number, percent: number): number {
  return value * (1 - percent / 100);
}

export function compoundPercent(value: number, percent: number, times: number): number {
  return value * Math.pow(1 + percent / 100, times);
}

// =============================================================================
// CURRENCY UTILITIES
// =============================================================================
export function addCurrency(amount1: number, amount2: number): number {
  return round(amount1 + amount2, 2);
}

export function subtractCurrency(amount1: number, amount2: number): number {
  return round(amount1 - amount2, 2);
}

export function calculateTax(amount: number, taxRate: number): number {
  return round(amount * (taxRate / 100), 2);
}

export function calculateTip(amount: number, tipPercent: number): number {
  return round(amount * (tipPercent / 100), 2);
}

export function calculateDiscount(price: number, discountPercent: number): number {
  return round(price * (1 - discountPercent / 100), 2);
}

export function calculateMarkup(cost: number, markupPercent: number): number {
  return round(cost * (1 + markupPercent / 100), 2);
}

export function calculateMargin(price: number, cost: number): number {
  return price !== 0 ? ((price - cost) / price) * 100 : 0;
}

export function calculateProfit(price: number, cost: number): number {
  return round(price - cost, 2);
}

// =============================================================================
// EXPORTS
// =============================================================================
export default {
  formatNumber,
  formatCurrency,
  formatPercent,
  formatFileSize,
  formatCompact,
  formatOrdinal,
  formatDuration,
  formatTime,
  parseNumber,
  parseInt,
  parseCurrency,
  parsePercent,
  parseBinary,
  parseHex,
  clamp,
  round,
  floor,
  ceil,
  truncate,
  random,
  randomInt,
  randomBoolean,
  randomItem,
  shuffle,
  isEven,
  isOdd,
  isInteger,
  isPositive,
  isNegative,
  isZero,
  isNaN,
  isFinite,
  isDivisible,
  roughlyEqual,
  sum,
  average,
  median,
  min,
  max,
  range,
  percentage,
  percentOf,
  percentChange,
  increaseByPercent,
  decreaseByPercent,
  compoundPercent,
  addCurrency,
  subtractCurrency,
  calculateTax,
  calculateTip,
  calculateDiscount,
  calculateMarkup,
  calculateMargin,
  calculateProfit,
};