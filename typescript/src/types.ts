/**
 * RFC 9457 Problem Details for HTTP APIs.
 *
 * This is the standard error response format for all Jentic APIs.
 * Content-Type: application/problem+json
 *
 * @see https://www.rfc-editor.org/rfc/rfc9457.html
 */
export interface ProblemDetail {
	/**
	 * A URI reference identifying the problem type. When set to "about:blank",
	 * the title SHOULD be the standard HTTP status phrase. Use an IANA-registered
	 * type URI where one applies.
	 *
	 * @default "about:blank"
	 * @maxLength 1024
	 * @example "about:blank"
	 */
	type?: string;

	/**
	 * The HTTP status code for this occurrence of the problem.
	 *
	 * @minimum 100
	 * @maximum 599
	 * @example 400
	 */
	status?: number;

	/**
	 * A short, human-readable summary of the problem type. Should not change
	 * between occurrences except for localisation purposes.
	 *
	 * @maxLength 1024
	 * @example "Bad Request"
	 */
	title?: string;

	/**
	 * A human-readable explanation specific to this occurrence of the problem.
	 * MUST be present. Provide actionable information where possible.
	 *
	 * @maxLength 4096
	 * @example "The request body is missing required field 'name'."
	 */
	detail: string;

	/**
	 * A URI reference identifying the specific occurrence of the problem.
	 * Typically the request path.
	 *
	 * @maxLength 1024
	 * @example "/v2/capability-sets"
	 */
	instance?: string;

	/**
	 * An optional provider-specific code for internal error taxonomy and
	 * observability correlation.
	 *
	 * @maxLength 50
	 * @example "JENTIC-4001"
	 */
	code?: string;

	/**
	 * An array of granular error details. Use when multiple validation errors
	 * or field-level problems need to be surfaced in a single response.
	 *
	 * @maxItems 1000
	 */
	errors?: ErrorItem[];
}

/**
 * A granular error detail entry within the errors[] array of a ProblemDetail response.
 *
 * At least one of pointer, parameter, or header SHOULD be present to identify the error source.
 */
export interface ErrorItem {
	/**
	 * A human-readable explanation of this specific error. Be precise —
	 * name the field, parameter, or header involved.
	 *
	 * @maxLength 4096
	 * @example "Field 'name' must not be blank."
	 */
	detail: string;

	/**
	 * A JSON Pointer (RFC 6901) to the specific request body property
	 * that is the source of this error.
	 *
	 * @maxLength 1024
	 * @example "#/name"
	 */
	pointer?: string;

	/**
	 * The name of the query or path parameter that is the source of this error.
	 *
	 * @maxLength 1024
	 * @example "limit"
	 */
	parameter?: string;

	/**
	 * The name of the request header that is the source of this error.
	 *
	 * @maxLength 1024
	 * @example "Authorization"
	 */
	header?: string;

	/**
	 * An optional provider-specific code identifying this error in internal
	 * taxonomy or documentation.
	 *
	 * @maxLength 50
	 * @example "JENTIC-V-001"
	 */
	code?: string;
}

/**
 * Type guard to check if an object is a ProblemDetail.
 */
export function isProblemDetail(obj: unknown): obj is ProblemDetail {
	return (
		typeof obj === 'object' &&
		obj !== null &&
		'detail' in obj &&
		typeof (obj as ProblemDetail).detail === 'string'
	);
}

/**
 * Type guard to check if an object is an ErrorItem.
 */
export function isErrorItem(obj: unknown): obj is ErrorItem {
	return (
		typeof obj === 'object' &&
		obj !== null &&
		'detail' in obj &&
		typeof (obj as ErrorItem).detail === 'string'
	);
}
