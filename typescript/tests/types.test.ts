import { describe, it, expect } from 'vitest';
import { isProblemDetail, isErrorItem } from '../src/types.js';
import type { ProblemDetail, ErrorItem } from '../src/types.js';

describe('ProblemDetail type', () => {
	it('should allow creating a minimal problem detail', () => {
		const problem: ProblemDetail = {
			detail: 'Something went wrong',
		};

		expect(problem.detail).toBe('Something went wrong');
		expect(problem.type).toBeUndefined();
		expect(problem.status).toBeUndefined();
	});

	it('should allow creating a full problem detail', () => {
		const problem: ProblemDetail = {
			type: 'about:blank',
			status: 400,
			title: 'Bad Request',
			detail: "The request body is missing required field 'name'.",
			instance: '/v2/capability-sets',
			code: 'JENTIC-4001',
			errors: [
				{
					detail: "Field 'name' is required.",
					pointer: '#/name',
				},
			],
		};

		expect(problem.type).toBe('about:blank');
		expect(problem.status).toBe(400);
		expect(problem.title).toBe('Bad Request');
		expect(problem.detail).toBe("The request body is missing required field 'name'.");
		expect(problem.instance).toBe('/v2/capability-sets');
		expect(problem.code).toBe('JENTIC-4001');
		expect(problem.errors).toHaveLength(1);
		expect(problem.errors?.[0]?.detail).toBe("Field 'name' is required.");
	});

	it('should serialize to JSON correctly', () => {
		const problem: ProblemDetail = {
			type: 'about:blank',
			status: 400,
			title: 'Bad Request',
			detail: 'Invalid input',
			instance: '/test',
		};

		const json = JSON.stringify(problem);
		const parsed = JSON.parse(json);

		expect(parsed.type).toBe('about:blank');
		expect(parsed.status).toBe(400);
		expect(parsed.title).toBe('Bad Request');
		expect(parsed.detail).toBe('Invalid input');
		expect(parsed.instance).toBe('/test');
	});
});

describe('ErrorItem type', () => {
	it('should allow creating a minimal error item', () => {
		const error: ErrorItem = {
			detail: "Field 'name' is required",
		};

		expect(error.detail).toBe("Field 'name' is required");
		expect(error.pointer).toBeUndefined();
		expect(error.parameter).toBeUndefined();
		expect(error.header).toBeUndefined();
		expect(error.code).toBeUndefined();
	});

	it('should allow creating error item with pointer', () => {
		const error: ErrorItem = {
			detail: "Field 'email' must be a valid email address",
			pointer: '#/email',
		};

		expect(error.detail).toBe("Field 'email' must be a valid email address");
		expect(error.pointer).toBe('#/email');
	});

	it('should allow creating error item with parameter', () => {
		const error: ErrorItem = {
			detail: 'Must be a positive integer between 1 and 100',
			parameter: 'limit',
		};

		expect(error.detail).toBe('Must be a positive integer between 1 and 100');
		expect(error.parameter).toBe('limit');
	});

	it('should allow creating error item with header', () => {
		const error: ErrorItem = {
			detail: 'Authorization header is malformed',
			header: 'Authorization',
			code: 'AUTH-001',
		};

		expect(error.detail).toBe('Authorization header is malformed');
		expect(error.header).toBe('Authorization');
		expect(error.code).toBe('AUTH-001');
	});
});

describe('isProblemDetail', () => {
	it('should return true for valid ProblemDetail', () => {
		const problem: ProblemDetail = {
			detail: 'Test error',
			status: 400,
		};

		expect(isProblemDetail(problem)).toBe(true);
	});

	it('should return false for non-objects', () => {
		expect(isProblemDetail(null)).toBe(false);
		expect(isProblemDetail(undefined)).toBe(false);
		expect(isProblemDetail('string')).toBe(false);
		expect(isProblemDetail(123)).toBe(false);
	});

	it('should return false for objects without detail', () => {
		expect(isProblemDetail({})).toBe(false);
		expect(isProblemDetail({ status: 400 })).toBe(false);
	});

	it('should return false for objects with non-string detail', () => {
		expect(isProblemDetail({ detail: 123 })).toBe(false);
		expect(isProblemDetail({ detail: null })).toBe(false);
	});
});

describe('isErrorItem', () => {
	it('should return true for valid ErrorItem', () => {
		const error: ErrorItem = {
			detail: 'Field error',
			pointer: '#/field',
		};

		expect(isErrorItem(error)).toBe(true);
	});

	it('should return false for non-objects', () => {
		expect(isErrorItem(null)).toBe(false);
		expect(isErrorItem(undefined)).toBe(false);
		expect(isErrorItem('string')).toBe(false);
	});

	it('should return false for objects without detail', () => {
		expect(isErrorItem({})).toBe(false);
		expect(isErrorItem({ pointer: '#/test' })).toBe(false);
	});
});

describe('ProblemDetail with multiple errors', () => {
	it('should support multiple validation errors', () => {
		const problem: ProblemDetail = {
			status: 422,
			title: 'Validation Error',
			detail: 'Multiple validation errors occurred',
			instance: '/api/resources',
			errors: [
				{ detail: "Field 'name' is required", pointer: '#/name' },
				{ detail: "Field 'email' must be valid", pointer: '#/email' },
				{ detail: "Parameter 'limit' must be positive", parameter: 'limit' },
			],
		};

		expect(problem.errors).toHaveLength(3);
		expect(problem.errors?.[0]?.pointer).toBe('#/name');
		expect(problem.errors?.[1]?.pointer).toBe('#/email');
		expect(problem.errors?.[2]?.parameter).toBe('limit');
	});
});
