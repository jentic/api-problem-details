"""FastAPI response helpers for RFC 9457 Problem Details.

Provides exception classes and utilities for raising standardized error responses.
"""
from typing import Any

from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse

from .models import ErrorItem, ProblemDetail


class ProblemDetailException(HTTPException):
    """Base exception for Problem Details responses.

    Raises an HTTPException that FastAPI will serialize to application/problem+json.
    """

    def __init__(
        self,
        status_code: int,
        detail: str,
        *,
        type: str = "about:blank",
        title: str | None = None,
        instance: str | None = None,
        code: str | None = None,
        errors: list[ErrorItem | dict[str, Any]] | None = None,
        headers: dict[str, str] | None = None,
    ):
        """Create a Problem Details exception.

        Args:
            status_code: HTTP status code (e.g., 400, 404, 500)
            detail: Human-readable explanation of this specific occurrence
            type: URI identifying the problem type (default: "about:blank")
            title: Short summary of the problem type (default: standard HTTP phrase)
            instance: URI reference to this specific occurrence (e.g., request path)
            code: Provider-specific error code for taxonomy/observability
            errors: Array of granular error details (for validation errors)
            headers: Additional HTTP headers to include in the response
        """
        problem = ProblemDetail(
            type=type,
            status=status_code,
            title=title,
            detail=detail,
            instance=instance,
            code=code,
            errors=[ErrorItem(**e) if isinstance(e, dict) else e for e in errors] if errors else None,
        )
        super().__init__(
            status_code=status_code,
            detail=problem.model_dump(mode="json", exclude_none=True),
            headers=headers,
        )


# Common HTTP error shortcuts
class BadRequest(ProblemDetailException):
    """400 Bad Request — client error (malformed syntax, invalid parameters, missing required fields)."""

    def __init__(self, detail: str, **kwargs):
        super().__init__(400, detail, title=kwargs.pop("title", "Bad Request"), **kwargs)


class Unauthorized(ProblemDetailException):
    """401 Unauthorized — authentication is required and has failed or has not been provided."""

    def __init__(self, detail: str, **kwargs):
        super().__init__(401, detail, title=kwargs.pop("title", "Unauthorized"), **kwargs)


class Forbidden(ProblemDetailException):
    """403 Forbidden — server understood the request but refuses to authorize it."""

    def __init__(self, detail: str, **kwargs):
        super().__init__(403, detail, title=kwargs.pop("title", "Forbidden"), **kwargs)


class NotFound(ProblemDetailException):
    """404 Not Found — the requested resource does not exist."""

    def __init__(self, detail: str, **kwargs):
        super().__init__(404, detail, title=kwargs.pop("title", "Not Found"), **kwargs)


class Conflict(ProblemDetailException):
    """409 Conflict — request conflicts with current state (duplicate resource, concurrent modification)."""

    def __init__(self, detail: str, **kwargs):
        super().__init__(409, detail, title=kwargs.pop("title", "Conflict"), **kwargs)


class ValidationError(ProblemDetailException):
    """422 Unprocessable Content — request is well-formed but contains semantic errors."""

    def __init__(self, detail: str, **kwargs):
        super().__init__(422, detail, title=kwargs.pop("title", "Validation Error"), **kwargs)


class TooManyRequests(ProblemDetailException):
    """429 Too Many Requests — rate limit exceeded."""

    def __init__(self, detail: str, **kwargs):
        super().__init__(429, detail, title=kwargs.pop("title", "Too Many Requests"), **kwargs)


class ServerError(ProblemDetailException):
    """500 Internal Server Error — unexpected server error."""

    def __init__(self, detail: str, **kwargs):
        super().__init__(500, detail, title=kwargs.pop("title", "Internal Server Error"), **kwargs)


class ServiceUnavailable(ProblemDetailException):
    """503 Service Unavailable — server is temporarily unable to handle the request."""

    def __init__(self, detail: str, **kwargs):
        super().__init__(503, detail, title=kwargs.pop("title", "Service Unavailable"), **kwargs)


async def problem_detail_exception_handler(request: Request, exc: ProblemDetailException) -> JSONResponse:
    """FastAPI exception handler for ProblemDetailException.

    Converts ProblemDetailException to a properly formatted application/problem+json response.

    Usage:
        from fastapi import FastAPI
        from jentic.problem_details.responses import problem_detail_exception_handler, ProblemDetailException

        app = FastAPI()
        app.add_exception_handler(ProblemDetailException, problem_detail_exception_handler)
    """
    return JSONResponse(
        status_code=exc.status_code,
        content=exc.detail,
        headers=exc.headers,
        media_type="application/problem+json",
    )
