# @jentic/problem-details (TypeScript)

RFC 9457 Problem Details types for Jentic APIs.

## Installation

```bash
npm install @jentic/problem-details
```

## Quick Start

### Type Definitions

```typescript
import type { ProblemDetail, ErrorItem } from '@jentic/problem-details';

// Use as response types
interface ApiError extends ProblemDetail {
	// Add custom fields if needed
}

// Type-safe error handling
function handleError(error: ProblemDetail) {
	console.log(`${error.status}: ${error.title}`);
	console.log(error.detail);
	
	if (error.errors) {
		error.errors.forEach(err => {
			if (err.pointer) {
				console.log(`  - ${err.pointer}: ${err.detail}`);
			}
		});
	}
}
```

### Creating Problem Details

```typescript
import { createProblemDetail, createErrorItem } from '@jentic/problem-details';

// Simple error
const notFound = createProblemDetail.notFound('User not found', {
	instance: '/api/users/123',
});

// Validation error with multiple fields
const validation = createProblemDetail.validationError(
	'Multiple validation errors occurred',
	{
		instance: '/api/users',
		errors: [
			createErrorItem("Field 'name' is required", { pointer: '#/name' }),
			createErrorItem("Field 'email' must be valid", { pointer: '#/email' }),
		],
	}
);
```

### Error Handling with Fetch

```typescript
import { ProblemDetailError } from '@jentic/problem-details';

async function fetchUser(id: string) {
	const response = await fetch(`/api/users/${id}`);
	
	if (!response.ok) {
		throw await ProblemDetailError.fromResponse(response);
	}
	
	return response.json();
}

// Usage
try {
	const user = await fetchUser('123');
} catch (err) {
	if (err instanceof ProblemDetailError) {
		console.error('API Error:', err.problemDetail);
		
		// Access structured error data
		if (err.problemDetail.status === 404) {
			console.log('User not found');
		}
		
		// Show validation errors to user
		if (err.problemDetail.errors) {
			err.problemDetail.errors.forEach(error => {
				console.log(`${error.pointer}: ${error.detail}`);
			});
		}
	} else {
		console.error('Unexpected error:', err);
	}
}
```

### Type Guards

```typescript
import { isProblemDetail, isErrorItem } from '@jentic/problem-details';

// Check if response is a ProblemDetail
const response = await fetch('/api/users');
const data = await response.json();

if (isProblemDetail(data)) {
	console.error('API returned error:', data.detail);
	
	if (data.errors && data.errors.every(isErrorItem)) {
		// TypeScript knows these are ErrorItems
		data.errors.forEach(err => console.log(err.detail));
	}
}
```

### React Example

```tsx
import { useState } from 'react';
import { ProblemDetailError, type ProblemDetail } from '@jentic/problem-details';

function UserForm() {
	const [error, setError] = useState<ProblemDetail | null>(null);

	async function handleSubmit(data: FormData) {
		try {
			const response = await fetch('/api/users', {
				method: 'POST',
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				throw await ProblemDetailError.fromResponse(response);
			}

			// Success
		} catch (err) {
			if (err instanceof ProblemDetailError) {
				setError(err.problemDetail);
			}
		}
	}

	return (
		<form onSubmit={handleSubmit}>
			{error && (
				<div className="error">
					<h3>{error.title}</h3>
					<p>{error.detail}</p>
					{error.errors && (
						<ul>
							{error.errors.map((err, i) => (
								<li key={i}>
									{err.pointer && <strong>{err.pointer}:</strong>} {err.detail}
								</li>
							))}
						</ul>
					)}
				</div>
			)}
			{/* Form fields */}
		</form>
	);
}
```

## API Reference

### Types

#### `ProblemDetail`

```typescript
interface ProblemDetail {
	type?: string;        // URI identifying problem type (default: "about:blank")
	status?: number;      // HTTP status code
	title?: string;       // Short summary of the problem
	detail: string;       // Human-readable explanation (required)
	instance?: string;    // URI reference to this occurrence
	code?: string;        // Provider-specific error code
	errors?: ErrorItem[]; // Array of granular error details
}
```

#### `ErrorItem`

```typescript
interface ErrorItem {
	detail: string;    // Human-readable error explanation (required)
	pointer?: string;  // JSON Pointer to request body property
	parameter?: string;// Query/path parameter name
	header?: string;   // Request header name
	code?: string;     // Provider-specific code
}
```

### Functions

#### `createProblemDetail`

Factory functions for common HTTP errors:

- `createProblemDetail.badRequest(detail, options?)` — 400
- `createProblemDetail.unauthorized(detail, options?)` — 401
- `createProblemDetail.forbidden(detail, options?)` — 403
- `createProblemDetail.notFound(detail, options?)` — 404
- `createProblemDetail.conflict(detail, options?)` — 409
- `createProblemDetail.validationError(detail, options?)` — 422
- `createProblemDetail.tooManyRequests(detail, options?)` — 429
- `createProblemDetail.serverError(detail, options?)` — 500
- `createProblemDetail.serviceUnavailable(detail, options?)` — 503

#### `createErrorItem(detail, options?)`

Helper to create validation error items.

#### `isProblemDetail(obj)`

Type guard to check if an object is a `ProblemDetail`.

#### `isErrorItem(obj)`

Type guard to check if an object is an `ErrorItem`.

### Classes

#### `ProblemDetailError extends Error`

Custom error class carrying RFC 9457 Problem Details data.

**Constructor:**
```typescript
new ProblemDetailError(problemDetail: ProblemDetail)
```

**Properties:**
- `problemDetail: ProblemDetail` — The problem detail data

**Static Methods:**
- `ProblemDetailError.fromResponse(response: Response): Promise<ProblemDetailError>` — Create from a fetch Response

**Methods:**
- `toJSON(): ProblemDetail` — Serialize to JSON

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Type checking
npm run typecheck

# Coverage
npm run test:coverage
```

## Standards

- [RFC 9457 — Problem Details for HTTP APIs](https://www.rfc-editor.org/rfc/rfc9457.html)
- [IANA HTTP Problem Types Registry](https://www.iana.org/assignments/http-problem-types/http-problem-types.xhtml)

## License

Apache-2.0
