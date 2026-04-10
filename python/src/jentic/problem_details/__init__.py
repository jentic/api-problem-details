"""RFC 9457 Problem Details models for Jentic APIs.

This package provides Pydantic models and FastAPI utilities for standardized
error responses following RFC 9457 (Problem Details for HTTP APIs).

Basic usage:
    from jentic.problem_details import ProblemDetail, BadRequest

    # Raise an error in FastAPI
    raise BadRequest(
        detail="Missing required field 'name'",
        instance="/v2/capability-sets",
        errors=[{"detail": "Field 'name' is required", "pointer": "#/name"}]
    )

FastAPI integration:
    from fastapi import FastAPI
    from jentic.problem_details import ProblemDetailException, problem_detail_exception_handler

    app = FastAPI()
    app.add_exception_handler(ProblemDetailException, problem_detail_exception_handler)
"""

__version__ = "1.0.0"

from .models import ErrorItem, ProblemDetail
from .responses import (
    BadRequest,
    Conflict,
    Forbidden,
    NotFound,
    ProblemDetailException,
    ServerError,
    ServiceUnavailable,
    TooManyRequests,
    Unauthorized,
    ValidationError,
    problem_detail_exception_handler,
)

__all__ = [
    # Models
    "ProblemDetail",
    "ErrorItem",
    # Exceptions
    "ProblemDetailException",
    "BadRequest",
    "Unauthorized",
    "Forbidden",
    "NotFound",
    "Conflict",
    "ValidationError",
    "TooManyRequests",
    "ServerError",
    "ServiceUnavailable",
    # Utilities
    "problem_detail_exception_handler",
]
