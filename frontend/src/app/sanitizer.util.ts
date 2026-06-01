export function sanitizeString(value: string): string {
  let sanitized = value.trim();

  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');

  const sqlPatterns = [
    /(\b)(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|TRUNCATE|EXEC|UNION|CAST|CONVERT|DECLARE|WAITFOR)\b/gi,
    /(--|;|\/\*|\*\/|xp_)/gi,
    /(\bOR\b|\bAND\b)\s+[\w'"]+\s*=\s*[\w'"]+/gi,
  ];

  sqlPatterns.forEach((pattern) => {
    sanitized = sanitized.replace(pattern, '');
  });

  return sanitized;
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}