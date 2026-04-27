/**
 * MiniDev ONE Template - String Utilities
 * 
 * String manipulation, formatting, and validation.
 */

// =============================================================================
// STRING FORMATTING
// =============================================================================
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function titleCase(str: string): string {
  return str
    .toLowerCase()
    .split(/[\s_-]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function sentenceCase(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function camelCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase());
}

export function snakeCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toLowerCase();
}

export function kebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

export function pascalCase(str: string): string {
  return str
    .replace(/[-_\s]+(.)/g, (_, chr) => chr.toUpperCase())
    .replace(/^(.)/, (_, chr) => chr.toUpperCase());
}

export function truncate(str: string, length: number, suffix: string = '...'): string {
  if (str.length <= length) return str;
  return str.slice(0, length - suffix.length) + suffix;
}

export function padStart(str: string | number, length: number, char: string = ' '): string {
  return String(str).padStart(length, char);
}

export function padEnd(str: string | number, length: number, char: string = ' '): string {
  return String(str).padEnd(length, char);
}

// =============================================================================
// STRING MANIPULATION
// =============================================================================
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function escapeHtml(str: string): string {
  const entities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return str.replace(/[&<>"']/g, char => entities[char]);
}

export function unescapeHtml(str: string): string {
  const entities: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
  };
  return str.replace(/&amp;|&lt;|&gt;|&quot;|&#39;/g, entity => entities[entity] || entity);
}

export function stripHtml(str: string): string {
  return str.replace(/<[^>]*>/g, '');
}

export function stripTags(str: string): string {
  return str.replace(/<[^>]*>/g, '');
}

export function highlight(str: string, query: string, className: string = 'highlight'): string {
  if (!query) return str;
  const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
  return str.replace(regex, `<${className}>$1</${className}>`);
}

export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function randomString(length: number = 8, charset: string = 'alphanumeric'): string {
  const charsets: Record<string, string> = {
    alphanumeric: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
    alpha: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
    numeric: '0123456789',
    hex: '0123456789abcdef',
    alphaNumeric: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
  };

  const chars = charsets[charset] || charsets.alphanumeric;
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function initials(str: string, maxLength: number = 2): string {
  return str
    .split(/\s+/)
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, maxLength);
}

export function pluralize(count: number, singular: string, plural?: string): string {
  if (count === 1) return `${count} ${singular}`;
  return `${count} ${plural || singular + 's'}`;
}

export function quote(str: string, char: string = '"'): string {
  return char + str + char;
}

// =============================================================================
// STRING VALIDATION
// =============================================================================
export function isEmail(str: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(str);
}

export function isUrl(str: string): boolean {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

export function isPhone(str: string): boolean {
  const phoneRegex = /^[\d\s\-+()]+$/;
  return phoneRegex.test(str) && str.replace(/\D/g, '').length >= 10;
}

export function isSlug(str: string): boolean {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(str);
}

export function isNumeric(str: string): boolean {
  return /^\d+$/.test(str);
}

export function isAlpha(str: string): boolean {
  return /^[a-zA-Z]+$/.test(str);
}

export function isAlphanumeric(str: string): boolean {
  return /^[a-zA-Z0-9]+$/.test(str);
}

export function isEmpty(str: string | null | undefined): boolean {
  return !str || str.trim().length === 0;
}

export function hasUpperCase(str: string): boolean {
  return /[A-Z]/.test(str);
}

export function hasLowerCase(str: string): boolean {
  return /[a-z]/.test(str);
}

export function hasNumber(str: string): boolean {
  return /\d/.test(str);
}

export function hasSpecialChar(str: string): boolean {
  return /[!@#$%^&*(),.?":{}|<>]/.test(str);
}

// =============================================================================
// STRING SEARCH
// =============================================================================
export function contains(str: string, search: string, caseSensitive: boolean = true): boolean {
  if (caseSensitive) return str.includes(search);
  return str.toLowerCase().includes(search.toLowerCase());
}

export function startsWith(str: string, search: string, caseSensitive: boolean = true): boolean {
  if (caseSensitive) return str.startsWith(search);
  return str.toLowerCase().startsWith(search.toLowerCase());
}

export function endsWith(str: string, search: string, caseSensitive: boolean = true): boolean {
  if (caseSensitive) return str.endsWith(search);
  return str.toLowerCase().endsWith(search.toLowerCase());
}

export function fuzzyMatch(str: string, query: string): boolean {
  const strLower = str.toLowerCase();
  const queryLower = query.toLowerCase();
  
  let queryIndex = 0;
  for (let i = 0; i < strLower.length && queryIndex < queryLower.length; i++) {
    if (strLower[i] === queryLower[queryIndex]) {
      queryIndex++;
    }
  }
  
  return queryIndex === queryLower.length;
}

export function wordCount(str: string): number {
  return str.trim().split(/\s+/).filter(Boolean).length;
}

export function charCount(str: string, includeSpaces: boolean = true): number {
  return includeSpaces ? str.length : str.replace(/\s/g, '').length;
}

// =============================================================================
// STRING EXTRACTION
// =============================================================================
export function extractEmails(str: string): string[] {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  return str.match(emailRegex) || [];
}

export function extractUrls(str: string): string[] {
  const urlRegex = /https?:\/\/[^\s]+/g;
  return str.match(urlRegex) || [];
}

export function extractNumbers(str: string): number[] {
  const numRegex = /-?\d+\.?\d*/g;
  return (str.match(numRegex) || []).map(Number);
}

export function extractHashtags(str: string): string[] {
  const tagRegex = /#[\w]+/g;
  return (str.match(tagRegex) || []).map(tag => tag.slice(1));
}

export function extractMentions(str: string): string[] {
  const mentionRegex = /@[\w]+/g;
  return (str.match(mentionRegex) || []).map(mention => mention.slice(1));
}

// =============================================================================
// WORD UTILITIES
// =============================================================================
export function words(str: string): string[] {
  return str.trim().split(/\s+/).filter(Boolean);
}

export function unwords(arr: string[]): string {
  return arr.filter(Boolean).join(' ');
}

export function reverseWords(str: string): string {
  return str.split(/\s+/).reverse().join(' ');
}

export function reverseChars(str: string): string {
  return str.split('').reverse().join('');
}

export function shuffle(str: string): string {
  const arr = str.split('');
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.join('');
}

// =============================================================================
// EXPORTS
// =============================================================================
export default {
  capitalize,
  titleCase,
  sentenceCase,
  camelCase,
  snakeCase,
  kebabCase,
  pascalCase,
  truncate,
  padStart,
  padEnd,
  slugify,
  escapeHtml,
  unescapeHtml,
  stripHtml,
  stripTags,
  highlight,
  escapeRegex,
  randomString,
  initials,
  pluralize,
  quote,
  isEmail,
  isUrl,
  isPhone,
  isSlug,
  isNumeric,
  isAlpha,
  isAlphanumeric,
  isEmpty,
  hasUpperCase,
  hasLowerCase,
  hasNumber,
  hasSpecialChar,
  contains,
  startsWith,
  endsWith,
  fuzzyMatch,
  wordCount,
  charCount,
  extractEmails,
  extractUrls,
  extractNumbers,
  extractHashtags,
  extractMentions,
  words,
  unwords,
  reverseWords,
  reverseChars,
  shuffle,
};