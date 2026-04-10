# jentic-api-problem-details

Reusable [RFC 9457](https://www.rfc-editor.org/rfc/rfc9457.html) Problem Details components for all Jentic APIs.

## Purpose

All Jentic APIs use `application/problem+json` for error responses. This repository provides:

1. **OpenAPI schemas and response definitions** — for referencing in API specifications
2. **Python package** (`jentic-problem-details`) — Pydantic models and FastAPI utilities
3. **TypeScript package** (`@jentic/problem-details`) — Type definitions and utilities for frontend applications

Rather than inlining schemas and responses in every API, all Jentic OpenAPI descriptions reference this repository's components directly.

## Usage

### OpenAPI Specifications

Reference components directly from your OpenAPI description:

```yaml
responses:
  '400':
    $ref: 'https://raw.githubusercontent.com/jentic/api-problem-details/refs/heads/main/responses/400-bad-request.yaml'
  '401':
    $ref: 'https://raw.githubusercontent.com/jentic/api-problem-details/refs/heads/main/responses/401-unauthorized.yaml'
  '403':
    $ref: 'https://raw.githubusercontent.com/jentic/api-problem-details/refs/heads/main/responses/403-forbidden.yaml'
  '404':
    $ref: 'https://raw.githubusercontent.com/jentic/api-problem-details/refs/heads/main/responses/404-not-found.yaml'
  '409':
    $ref: 'https://raw.githubusercontent.com/jentic/api-problem-details/refs/heads/main/responses/409-conflict.yaml'
  '422':
    $ref: 'https://raw.githubusercontent.com/jentic/api-problem-details/refs/heads/main/responses/422-validation-error.yaml'
  '429':
    $ref: 'https://raw.githubusercontent.com/jentic/api-problem-details/refs/heads/main/responses/429-too-many-requests.yaml'
  '500':
    $ref: 'https://raw.githubusercontent.com/jentic/api-problem-details/refs/heads/main/responses/500-server-error.yaml'
  '503':
    $ref: 'https://raw.githubusercontent.com/jentic/api-problem-details/refs/heads/main/responses/503-service-unavailable.yaml'
```

### Python / FastAPI

Install the package:

```bash
pip install jentic-problem-details
```

Use in your FastAPI application:

```python
from fastapi import FastAPI
from jentic.problem_details import (
    BadRequest,
    NotFound,
    ProblemDetailException,
    problem_detail_exception_handler,
)

app = FastAPI()
app.add_exception_handler(ProblemDetailException, problem_detail_exception_handler)

@app.get("/users/{user_id}")
async def get_user(user_id: str):
    user = await db.get_user(user_id)
    if not user:
        raise NotFound(
            detail=f"User '{user_id}' not found",
            instance=f"/users/{user_id}"
        )
    return user

@app.post("/users")
async def create_user(request: Request):
    data = await request.json()
    
    errors = []
    if not data.get("name"):
        errors.append({"detail": "Field 'name' is required", "pointer": "#/name"})
    if not data.get("email"):
        errors.append({"detail": "Field 'email' is required", "pointer": "#/email"})
    
    if errors:
        raise BadRequest(
            detail="The request body is missing required fields",
            instance="/users",
            errors=errors
        )
    
    return await db.create_user(data)
```

See the [Python package README](./python/README.md) for complete documentation.

### TypeScript / JavaScript

Install the package:

```bash
npm install @jentic/problem-details
```

Use in your application:

```typescript
import { createProblemDetail, ProblemDetailError } from '@jentic/problem-details';

// Create a problem detail
const problem = createProblemDetail.notFound('User not found', {
	instance: '/api/users/123',
});

// Handle errors from fetch
try {
	const response = await fetch('/api/users/123');
	if (!response.ok) {
		throw await ProblemDetailError.fromResponse(response);
	}
	return await response.json();
} catch (err) {
	if (err instanceof ProblemDetailError) {
		console.error('API Error:', err.problemDetail);
		// Access structured error data
		if (err.problemDetail.errors) {
			err.problemDetail.errors.forEach(error => {
				console.log(`${error.pointer}: ${error.detail}`);
			});
		}
	}
}
```

See the [TypeScript package README](./typescript/README.md) for complete documentation.

## Problem Types

Jentic uses `about:blank` as the `type` for most problem responses, per RFC 9457 guidance. When `type` is `about:blank`, the `title` SHOULD be the standard HTTP status phrase and `detail` MUST provide a human-readable explanation specific to the occurrence.

Where a specific IANA-registered problem type applies, it SHOULD be used. See the [IANA HTTP Problem Types Registry](https://www.iana.org/assignments/http-problem-types/http-problem-types.xhtml).

## Packages

| Package | Language | Status | Installation |
|---------|----------|--------|--------------|
| [`jentic-problem-details`](./python) | Python | ✅ Available | `pip install jentic-problem-details` |
| [`@jentic/problem-details`](./typescript) | TypeScript | ✅ Available | `npm install @jentic/problem-details` |

## Repository Structure

```
openapi-domain.yaml        # Primary artifact — all components bundled
schemas/
  problem-details.yaml     # ProblemDetails schema
  error-item.yaml          # ErrorItem schema (errors[] array entries)
responses/
  400-bad-request.yaml
  401-unauthorized.yaml
  403-forbidden.yaml
  404-not-found.yaml
  409-conflict.yaml
  422-validation-error.yaml
  429-too-many-requests.yaml
  500-server-error.yaml
  503-service-unavailable.yaml
python/                    # Python package (jentic-problem-details)
  src/jentic/problem_details/
  tests/
  pyproject.toml
  README.md
typescript/                # TypeScript package (@jentic/problem-details)
  src/
  tests/
  package.json
  tsconfig.json
  README.md
LICENSE                    # Apache 2.0 License
NOTICE                     # Copyright and attribution notices
```

## Standards References

- [RFC 9457 — Problem Details for HTTP APIs](https://www.rfc-editor.org/rfc/rfc9457.html)
- [IANA HTTP Problem Types Registry](https://www.iana.org/assignments/http-problem-types/http-problem-types.xhtml)
- [OpenAPI Specification 3.2.0](https://spec.openapis.org/oas/v3.2.0.html)
