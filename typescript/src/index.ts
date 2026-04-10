/**
 * @jentic/problem-details
 *
 * RFC 9457 Problem Details types and utilities for Jentic APIs.
 *
 * @example
 * ```typescript
 * import { createProblemDetail, ProblemDetailError } from '@jentic/problem-details';
 *
 * // Create a problem detail
 * const problem = createProblemDetail.badRequest('Missing required field', {
 *   instance: '/api/users',
 *   errors: [
 *     { detail: "Field 'name' is required", pointer: '#/name' }
 *   ]
 * });
 *
 * // Handle errors from fetch
 * try {
 *   const response = await fetch('/api/users');
 *   if (!response.ok) {
 *     throw await ProblemDetailError.fromResponse(response);
 *   }
 * } catch (err) {
 *   if (err instanceof ProblemDetailError) {
 *     console.log(err.problemDetail);
 *   }
 * }
 * ```
 *
 * @see https://www.rfc-editor.org/rfc/rfc9457.html
 */

export type { ProblemDetail, ErrorItem } from './types.js';
export { isProblemDetail, isErrorItem } from './types.js';
export { ProblemDetailError, createProblemDetail, createErrorItem } from './errors.js';
