import { describe, it, expect, vi } from 'vitest';
import { ProblemDetailError, createProblemDetail, createErrorItem } from '../src/errors.js';

describe('ProblemDetailError', () => {
	it('should create error with problem detail', () => {
		const problem = {
			status: 400,
			title: 'Bad Request',
			detail: 'Invalid input',
		};

		const error = new ProblemDetailError(problem);

		expect(error).toBeInstanceOf(Error);
		expect(error.name).toBe('ProblemDetailError');
		expect(error.message).toBe('Invalid input');
		expect(error.problemDetail).toEqual(problem);
	});

	it('should serialize to JSON', () => {
		const problem = {
			status: 404,
			title: 'Not Found',
			detail: 'Resource not found',
			instance: '/api/users/123',
		};

		const error = new ProblemDetailError(problem);
		const json = JSON.stringify(error);
		const parsed = JSON.parse(json);

		expect(parsed.status).toBe(404);
		expect(parsed.title).toBe('Not Found');
		expect(parsed.detail).toBe('Resource not found');
		expect(parsed.instance).toBe('/api/users/123');
	});

	it('should create from Response with problem+json content-type', async () => {
		const problemData = {
			type: 'about:blank',
			status: 400,
			title: 'Bad Request',
			detail: 'Invalid request body',
		};

		const response = new Response(JSON.stringify(problemData), {
			status: 400,
			headers: { 'content-type': 'application/problem+json' },
		});

		const error = await ProblemDetailError.fromResponse(response);

		expect(error).toBeInstanceOf(ProblemDetailError);
		expect(error.problemDetail.status).toBe(400);
		expect(error.problemDetail.detail).toBe('Invalid request body');
	});

	it('should create from Response without problem+json content-type', async () => {
		const response = new Response('Not Found', {
			status: 404,
			statusText: 'Not Found',
			headers: { 'content-type': 'text/plain' },
		});

		const error = await ProblemDetailError.fromResponse(response);

		expect(error).toBeInstanceOf(ProblemDetailError);
		expect(error.problemDetail.status).toBe(404);
		expect(error.problemDetail.title).toBe('Not Found');
		expect(error.problemDetail.detail).toBe('Not Found');
	});

	it('should handle empty response body', async () => {
		const response = new Response('', {
			status: 500,
			statusText: 'Internal Server Error',
		});

		const error = await ProblemDetailError.fromResponse(response);

		expect(error.problemDetail.status).toBe(500);
		expect(error.problemDetail.detail).toBe('HTTP 500 Internal Server Error');
	});
});

describe('createProblemDetail', () => {
	it('should create badRequest', () => {
		const problem = createProblemDetail.badRequest('Missing required field');

		expect(problem.status).toBe(400);
		expect(problem.title).toBe('Bad Request');
		expect(problem.detail).toBe('Missing required field');
		expect(problem.type).toBe('about:blank');
	});

	it('should create badRequest with options', () => {
		const problem = createProblemDetail.badRequest('Invalid input', {
			instance: '/api/users',
			code: 'JENTIC-4001',
			errors: [{ detail: "Field 'name' is required", pointer: '#/name' }],
		});

		expect(problem.status).toBe(400);
		expect(problem.instance).toBe('/api/users');
		expect(problem.code).toBe('JENTIC-4001');
		expect(problem.errors).toHaveLength(1);
	});

	it('should create unauthorized', () => {
		const problem = createProblemDetail.unauthorized('Invalid credentials');

		expect(problem.status).toBe(401);
		expect(problem.title).toBe('Unauthorized');
		expect(problem.detail).toBe('Invalid credentials');
	});

	it('should create forbidden', () => {
		const problem = createProblemDetail.forbidden('Access denied');

		expect(problem.status).toBe(403);
		expect(problem.title).toBe('Forbidden');
		expect(problem.detail).toBe('Access denied');
	});

	it('should create notFound', () => {
		const problem = createProblemDetail.notFound('Resource not found');

		expect(problem.status).toBe(404);
		expect(problem.title).toBe('Not Found');
		expect(problem.detail).toBe('Resource not found');
	});

	it('should create conflict', () => {
		const problem = createProblemDetail.conflict('Resource already exists');

		expect(problem.status).toBe(409);
		expect(problem.title).toBe('Conflict');
		expect(problem.detail).toBe('Resource already exists');
	});

	it('should create validationError', () => {
		const problem = createProblemDetail.validationError('Invalid input format');

		expect(problem.status).toBe(422);
		expect(problem.title).toBe('Unprocessable Content');
		expect(problem.detail).toBe('Invalid input format');
	});

	it('should create tooManyRequests', () => {
		const problem = createProblemDetail.tooManyRequests('Rate limit exceeded');

		expect(problem.status).toBe(429);
		expect(problem.title).toBe('Too Many Requests');
		expect(problem.detail).toBe('Rate limit exceeded');
	});

	it('should create serverError', () => {
		const problem = createProblemDetail.serverError('Unexpected error');

		expect(problem.status).toBe(500);
		expect(problem.title).toBe('Internal Server Error');
		expect(problem.detail).toBe('Unexpected error');
	});

	it('should create serviceUnavailable', () => {
		const problem = createProblemDetail.serviceUnavailable('Database connection lost');

		expect(problem.status).toBe(503);
		expect(problem.title).toBe('Service Unavailable');
		expect(problem.detail).toBe('Database connection lost');
	});
});

describe('createErrorItem', () => {
	it('should create basic error item', () => {
		const error = createErrorItem("Field 'name' is required");

		expect(error.detail).toBe("Field 'name' is required");
		expect(error.pointer).toBeUndefined();
	});

	it('should create error item with pointer', () => {
		const error = createErrorItem("Field 'email' must be valid", {
			pointer: '#/email',
		});

		expect(error.detail).toBe("Field 'email' must be valid");
		expect(error.pointer).toBe('#/email');
	});

	it('should create error item with parameter', () => {
		const error = createErrorItem('Must be positive', {
			parameter: 'limit',
			code: 'VAL-001',
		});

		expect(error.detail).toBe('Must be positive');
		expect(error.parameter).toBe('limit');
		expect(error.code).toBe('VAL-001');
	});

	it('should create error item with header', () => {
		const error = createErrorItem('Authorization header malformed', {
			header: 'Authorization',
		});

		expect(error.detail).toBe('Authorization header malformed');
		expect(error.header).toBe('Authorization');
	});
});
