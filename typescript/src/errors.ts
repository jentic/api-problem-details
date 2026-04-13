/**
 * Error utilities for creating and working with RFC 9457 Problem Details.
 */
import type { ErrorItem, ProblemDetail } from './types.js';

/**
 * Custom error class that carries RFC 9457 Problem Details data.
 *
 * Useful for throwing errors in frontend code that can be serialized
 * to problem+json format or displayed to users.
 */
export class ProblemDetailError extends Error {
	public readonly problemDetail: ProblemDetail;

	constructor(problemDetail: ProblemDetail) {
		super(problemDetail.detail);
		this.name = 'ProblemDetailError';
		this.problemDetail = problemDetail;

		// Maintains proper stack trace for where our error was thrown (only available on V8)
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, ProblemDetailError);
		}
	}

	/**
	 * Serialize to JSON (for logging or API responses).
	 */
	toJSON(): ProblemDetail {
		return this.problemDetail;
	}

	/**
	 * Create a ProblemDetailError from a fetch Response.
	 *
	 * @example
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
	 */
	static async fromResponse(response: Response): Promise<ProblemDetailError> {
		const contentType = response.headers.get('content-type') || '';

		if (contentType.includes('application/problem+json')) {
			try {
				const problemDetail = (await response.json()) as ProblemDetail;
				return new ProblemDetailError(problemDetail);
			} catch {
				// Fall through to text-based fallback if JSON parsing fails
			}
		}

		// Fallback for non-problem+json error responses or malformed JSON
		let text: string;
		try {
			text = await response.text();
		} catch {
			text = '';
		}
		return new ProblemDetailError({
			status: response.status,
			title: response.statusText,
			detail: text || `HTTP ${response.status} ${response.statusText}`,
		});
	}
}

/**
 * Factory functions for common HTTP error Problem Details.
 */
export const createProblemDetail = {
	/**
	 * 400 Bad Request — client error (malformed syntax, invalid parameters, missing required fields).
	 */
	badRequest(detail: string, options?: Partial<Omit<ProblemDetail, 'status' | 'title' | 'detail'>>): ProblemDetail {
		return {
			type: 'about:blank',
			status: 400,
			title: 'Bad Request',
			detail,
			...options,
		};
	},

	/**
	 * 401 Unauthorized — authentication is required and has failed or has not been provided.
	 */
	unauthorized(detail: string, options?: Partial<Omit<ProblemDetail, 'status' | 'title' | 'detail'>>): ProblemDetail {
		return {
			type: 'about:blank',
			status: 401,
			title: 'Unauthorized',
			detail,
			...options,
		};
	},

	/**
	 * 403 Forbidden — server understood the request but refuses to authorize it.
	 */
	forbidden(detail: string, options?: Partial<Omit<ProblemDetail, 'status' | 'title' | 'detail'>>): ProblemDetail {
		return {
			type: 'about:blank',
			status: 403,
			title: 'Forbidden',
			detail,
			...options,
		};
	},

	/**
	 * 404 Not Found — the requested resource does not exist.
	 */
	notFound(detail: string, options?: Partial<Omit<ProblemDetail, 'status' | 'title' | 'detail'>>): ProblemDetail {
		return {
			type: 'about:blank',
			status: 404,
			title: 'Not Found',
			detail,
			...options,
		};
	},

	/**
	 * 409 Conflict — request conflicts with current state (duplicate resource, concurrent modification).
	 */
	conflict(detail: string, options?: Partial<Omit<ProblemDetail, 'status' | 'title' | 'detail'>>): ProblemDetail {
		return {
			type: 'about:blank',
			status: 409,
			title: 'Conflict',
			detail,
			...options,
		};
	},

	/**
	 * 422 Unprocessable Content — request is well-formed but contains semantic errors.
	 */
	validationError(detail: string, options?: Partial<Omit<ProblemDetail, 'status' | 'title' | 'detail'>>): ProblemDetail {
		return {
			type: 'about:blank',
			status: 422,
			title: 'Validation Error',
			detail,
			...options,
		};
	},

	/**
	 * 429 Too Many Requests — rate limit exceeded.
	 */
	tooManyRequests(detail: string, options?: Partial<Omit<ProblemDetail, 'status' | 'title' | 'detail'>>): ProblemDetail {
		return {
			type: 'about:blank',
			status: 429,
			title: 'Too Many Requests',
			detail,
			...options,
		};
	},

	/**
	 * 500 Internal Server Error — unexpected server error.
	 */
	serverError(detail: string, options?: Partial<Omit<ProblemDetail, 'status' | 'title' | 'detail'>>): ProblemDetail {
		return {
			type: 'about:blank',
			status: 500,
			title: 'Internal Server Error',
			detail,
			...options,
		};
	},

	/**
	 * 503 Service Unavailable — server is temporarily unable to handle the request.
	 */
	serviceUnavailable(detail: string, options?: Partial<Omit<ProblemDetail, 'status' | 'title' | 'detail'>>): ProblemDetail {
		return {
			type: 'about:blank',
			status: 503,
			title: 'Service Unavailable',
			detail,
			...options,
		};
	},
};

/**
 * Helper to create an ErrorItem for validation errors.
 */
export function createErrorItem(detail: string, options?: Partial<Omit<ErrorItem, 'detail'>>): ErrorItem {
	return {
		detail,
		...options,
	};
}
