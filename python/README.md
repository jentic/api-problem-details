# jentic-problem-details (Python)

RFC 9457 Problem Details models for Jentic APIs.

## Installation

```bash
pip install jentic-problem-details
```

For FastAPI integration:
```bash
pip install jentic-problem-details[fastapi]
```

## Quick Start

### Basic Usage

```python
from jentic.problem_details import ProblemDetail, ErrorItem

# Create a problem detail response
problem = ProblemDetail(
    status=400,
    title="Bad Request",
    detail="The request body is missing required field 'name'.",
    instance="/v2/capability-sets",
    errors=[
        ErrorItem(
            detail="Field 'name' is required.",
            pointer="#/name"
        )
    ]
)

print(problem.model_dump_json(exclude_none=True))
```

### FastAPI Integration

```python
from fastapi import FastAPI, Request
from jentic.problem_details import (
    BadRequest,
    NotFound,
    ProblemDetailException,
    problem_detail_exception_handler,
)

app = FastAPI()

# Register the exception handler
app.add_exception_handler(ProblemDetailException, problem_detail_exception_handler)

@app.get("/users/{user_id}")
async def get_user(user_id: str):
    # Input validation
    if not user_id:
        raise BadRequest(
            detail="User ID is required",
            instance="/users",
            code="JENTIC-4001"
        )
    
    # Resource not found
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
    
    # Validation with multiple errors
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
    
    user = await db.create_user(data)
    return user
```

### Response Format

All exceptions produce responses with `Content-Type: application/problem+json`:

```json
{
  "type": "about:blank",
  "status": 400,
  "title": "Bad Request",
  "detail": "The request body is missing required fields",
  "instance": "/users",
  "errors": [
    {
      "detail": "Field 'name' is required",
      "pointer": "#/name"
    }
  ]
}
```

## Available Exceptions

| Exception | Status | Description |
|-----------|--------|-------------|
| `BadRequest` | 400 | Client error (malformed syntax, invalid parameters) |
| `Unauthorized` | 401 | Authentication required or failed |
| `Forbidden` | 403 | Server refuses to authorize the request |
| `NotFound` | 404 | Resource does not exist |
| `Conflict` | 409 | Request conflicts with current state |
| `ValidationError` | 422 | Request is well-formed but semantically invalid |
| `TooManyRequests` | 429 | Rate limit exceeded |
| `ServerError` | 500 | Unexpected server error |
| `ServiceUnavailable` | 503 | Server temporarily unable to handle request |

All exceptions extend `ProblemDetailException` which accepts:

- `detail` (required): Human-readable explanation
- `type`: URI identifying the problem type (default: "about:blank")
- `title`: Short summary (default: standard HTTP phrase)
- `instance`: Request path or URI reference
- `code`: Provider-specific error code
- `errors`: List of `ErrorItem` for granular validation errors
- `headers`: Additional HTTP headers

## Error Items

For validation errors with multiple fields, use the `errors` array:

```python
from jentic.problem_details import ValidationError, ErrorItem

raise ValidationError(
    detail="Multiple validation errors occurred",
    instance="/api/resources",
    errors=[
        ErrorItem(detail="Must be a positive integer", parameter="limit"),
        ErrorItem(detail="Must be 'asc' or 'desc'", parameter="order"),
        ErrorItem(detail="Must be a valid email", pointer="#/email"),
        ErrorItem(detail="Authorization header is malformed", header="Authorization"),
    ]
)
```

## Development

```bash
# Install dependencies
pip install -e ".[dev]"

# Run tests
pytest

# Type checking
mypy src/
```

## Standards

- [RFC 9457 — Problem Details for HTTP APIs](https://www.rfc-editor.org/rfc/rfc9457.html)
- [IANA HTTP Problem Types Registry](https://www.iana.org/assignments/http-problem-types/http-problem-types.xhtml)

## License

jentic-problem-details is licensed under [Apache 2.0 license](https://github.com/jentic/api-problem-details/blob/main/LICENSE).
jentic-problem-details comes with an explicit [NOTICE](https://github.com/jentic/api-problem-details/blob/main/NOTICE) file
containing additional legal notices and information.
