import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
const sanitizeHtml = require('sanitize-html');
/**
 * Global Pipe to sanitize incoming data and prevent Cross-Site Scripting (XSS) attacks.
 *
 * It recursively traverses strings, arrays, and objects, stripping out any HTML tags
 * or attributes to ensure malicious scripts cannot be injected into the system.
 */
@Injectable()
export class XssSanitizerPipe implements PipeTransform {
  /**
   * Transforms and sanitizes the incoming request payload based on its metadata.
   *
   * @param {any} value - The incoming request payload or parameter.
   * @param {ArgumentMetadata} metadata - Metadata indicating if it's a body, query, param, or custom injection.
   * @returns {any} The sanitized value.
   */
  transform(value: any, metadata: ArgumentMetadata) {
    // We skip sanitization for custom decorators to avoid breaking internal NestJS context injections
    if (metadata.type !== 'custom') {
      return this.sanitize(value);
    }
    return value;
  }

  /**
   * Recursively sanitizes primitive values and complex data structures.
   *
   * @param {any} obj - The current node in the data structure being evaluated.
   * @returns {any} The clean, stripped data.
   */
  private sanitize(obj: any): any {
    if (typeof obj === 'string') {
      // Strips absolutely all HTML tags and attributes
      return sanitizeHtml(obj, {
        allowedTags: [],
        allowedAttributes: {},
      });
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.sanitize(item));
    }

    if (obj !== null && typeof obj === 'object') {
      const sanitizedObj: Record<string, any> = {};
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          sanitizedObj[key] = this.sanitize(obj[key]);
        }
      }
      return sanitizedObj;
    }

    // Returns numbers, booleans, or null as-is
    return obj;
  }
}
