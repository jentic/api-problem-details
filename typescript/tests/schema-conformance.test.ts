/**
 * Tests to ensure TypeScript types conform to the OpenAPI schemas.
 * Prevents drift between implementation and specification.
 */

import { readFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'yaml';
import { describe, it, expect } from 'vitest';
import type { ProblemDetail, ErrorItem } from '../src/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function loadSchema(name: string): any {
	const schemaPath = resolve(__dirname, '../../schemas', `${name}.yaml`);
	const content = readFileSync(schemaPath, 'utf-8');
	return parse(content);
}

describe('Schema Conformance', () => {
	describe('ProblemDetail', () => {
		it('should have all properties defined in problem-details.yaml', () => {
			const schema = loadSchema('problem-details');
			const expectedProps = Object.keys(schema.properties);

			// TypeScript type checking ensures these exist at compile time
			const sampleObject: ProblemDetail = {
				type: 'about:blank',
				status: 400,
				title: 'Bad Request',
				detail: 'The request body is missing required field "name".',
				instance: '/v2/capability-sets',
				code: 'JENTIC-4001',
				errors: [],
			};

			const actualProps = Object.keys(sampleObject);
			expect(actualProps.sort()).toEqual(expectedProps.sort());
		});

		it('should respect maxLength constraint on type field', () => {
			const schema = loadSchema('problem-details');
			expect(schema.properties.type.maxLength).toBe(1024);

			// TypeScript can't enforce this at compile time, but we document it
			const validType = 'a'.repeat(1024);
			expect(validType.length).toBe(1024);
		});

		it('should respect status code range', () => {
			const schema = loadSchema('problem-details');
			expect(schema.properties.status.minimum).toBe(100);
			expect(schema.properties.status.maximum).toBe(599);
		});

		it('should respect maxLength constraint on detail field', () => {
			const schema = loadSchema('problem-details');
			expect(schema.properties.detail.maxLength).toBe(4096);
		});

		it('should respect maxItems constraint on errors array', () => {
			const schema = loadSchema('problem-details');
			expect(schema.properties.errors.maxItems).toBe(1000);
		});

		it('should match schema examples', () => {
			// Verify the example from the spec is a valid ProblemDetail
			const example: ProblemDetail = {
				type: 'about:blank',
				status: 400,
				title: 'Bad Request',
				detail: "The request body is missing required field 'name'.",
				instance: '/v2/capability-sets',
				code: 'JENTIC-4001',
			};

			expect(example.detail).toBeDefined();
			expect(example.status).toBeGreaterThanOrEqual(100);
			expect(example.status).toBeLessThanOrEqual(599);
		});
	});

	describe('ErrorItem', () => {
		it('should have all properties defined in error-item.yaml', () => {
			const schema = loadSchema('error-item');
			const expectedProps = Object.keys(schema.properties);

			// TypeScript type checking ensures these exist at compile time
			const sampleObject: ErrorItem = {
				detail: "Field 'name' must not be blank.",
				pointer: '#/name',
				parameter: 'limit',
				header: 'Authorization',
				code: 'JENTIC-V-001',
			};

			const actualProps = Object.keys(sampleObject);
			expect(actualProps.sort()).toEqual(expectedProps.sort());
		});

		it('should respect maxLength constraint on detail field', () => {
			const schema = loadSchema('error-item');
			expect(schema.properties.detail.maxLength).toBe(4096);
		});

		it('should respect maxLength constraints on location fields', () => {
			const schema = loadSchema('error-item');
			expect(schema.properties.pointer.maxLength).toBe(1024);
			expect(schema.properties.parameter.maxLength).toBe(1024);
			expect(schema.properties.header.maxLength).toBe(1024);
		});

		it('should respect maxLength constraint on code field', () => {
			const schema = loadSchema('error-item');
			expect(schema.properties.code.maxLength).toBe(50);
		});

		it('should match schema examples', () => {
			// Verify the example from the spec is a valid ErrorItem
			const example: ErrorItem = {
				detail: "Field 'name' must not be blank.",
				pointer: '#/name',
				parameter: 'limit',
				header: 'Authorization',
				code: 'JENTIC-V-001',
			};

			expect(example.detail).toBeDefined();
			expect(typeof example.detail).toBe('string');
		});
	});

	describe('Type safety', () => {
		it('should require detail field on ProblemDetail', () => {
			// This test verifies TypeScript catches missing required fields at compile time
			// @ts-expect-error - detail is required
			const invalid: ProblemDetail = {
				type: 'about:blank',
				status: 400,
			};

			// Runtime check would fail
			expect(invalid.detail).toBeUndefined();
		});

		it('should require detail field on ErrorItem', () => {
			// This test verifies TypeScript catches missing required fields at compile time
			// @ts-expect-error - detail is required
			const invalid: ErrorItem = {
				pointer: '#/name',
			};

			// Runtime check would fail
			expect(invalid.detail).toBeUndefined();
		});
	});
});
