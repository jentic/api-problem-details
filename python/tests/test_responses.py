"""Tests for FastAPI response helpers."""
import pytest

from jentic.problem_details import (
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
)


def test_problem_detail_exception_basic():
    """Test basic ProblemDetailException creation."""
    exc = ProblemDetailException(
        status_code=400,
        detail="Invalid input",
    )

    assert exc.status_code == 400
    assert isinstance(exc.detail, dict)
    assert exc.detail["detail"] == "Invalid input"
    assert exc.detail["type"] == "about:blank"
    assert exc.detail["status"] == 400


def test_problem_detail_exception_with_errors():
    """Test ProblemDetailException with validation errors."""
    exc = ProblemDetailException(
        status_code=422,
        detail="Validation failed",
        errors=[
            {"detail": "Field 'name' is required", "pointer": "#/name"},
            {"detail": "Field 'email' is invalid", "pointer": "#/email"},
        ]
    )

    assert exc.status_code == 422
    assert len(exc.detail["errors"]) == 2
    assert exc.detail["errors"][0]["detail"] == "Field 'name' is required"


def test_problem_detail_exception_with_code():
    """Test ProblemDetailException with custom error code."""
    exc = ProblemDetailException(
        status_code=400,
        detail="Custom error",
        code="JENTIC-4001",
        instance="/v2/test"
    )

    assert exc.detail["code"] == "JENTIC-4001"
    assert exc.detail["instance"] == "/v2/test"


def test_bad_request():
    """Test BadRequest exception."""
    exc = BadRequest(detail="Missing required field")

    assert exc.status_code == 400
    assert exc.detail["title"] == "Bad Request"
    assert exc.detail["detail"] == "Missing required field"


def test_unauthorized():
    """Test Unauthorized exception."""
    exc = Unauthorized(detail="Invalid credentials")

    assert exc.status_code == 401
    assert exc.detail["title"] == "Unauthorized"


def test_forbidden():
    """Test Forbidden exception."""
    exc = Forbidden(detail="Access denied")

    assert exc.status_code == 403
    assert exc.detail["title"] == "Forbidden"


def test_not_found():
    """Test NotFound exception."""
    exc = NotFound(detail="Resource not found")

    assert exc.status_code == 404
    assert exc.detail["title"] == "Not Found"


def test_conflict():
    """Test Conflict exception."""
    exc = Conflict(detail="Resource already exists")

    assert exc.status_code == 409
    assert exc.detail["title"] == "Conflict"


def test_validation_error():
    """Test ValidationError exception."""
    exc = ValidationError(detail="Invalid input format")

    assert exc.status_code == 422
    assert exc.detail["title"] == "Unprocessable Content"


def test_too_many_requests():
    """Test TooManyRequests exception."""
    exc = TooManyRequests(detail="Rate limit exceeded")

    assert exc.status_code == 429
    assert exc.detail["title"] == "Too Many Requests"


def test_server_error():
    """Test ServerError exception."""
    exc = ServerError(detail="Unexpected error")

    assert exc.status_code == 500
    assert exc.detail["title"] == "Internal Server Error"


def test_service_unavailable():
    """Test ServiceUnavailable exception."""
    exc = ServiceUnavailable(detail="Database connection lost")

    assert exc.status_code == 503
    assert exc.detail["title"] == "Service Unavailable"


def test_custom_title_override():
    """Test that custom title can override default."""
    exc = BadRequest(detail="Test", title="Custom Bad Request")

    assert exc.detail["title"] == "Custom Bad Request"


def test_headers():
    """Test that custom headers are preserved."""
    exc = TooManyRequests(
        detail="Rate limit exceeded",
        headers={"Retry-After": "60"}
    )

    assert exc.headers == {"Retry-After": "60"}


def test_exclude_none_in_serialization():
    """Test that None values are excluded from the response."""
    exc = BadRequest(detail="Test error")

    # Should not include None fields
    assert "code" not in exc.detail
    assert "errors" not in exc.detail
    assert "instance" not in exc.detail


@pytest.mark.asyncio
async def test_exception_handler_integration():
    """Test that exception handler can be used with FastAPI (requires fastapi installed)."""
    pytest.importorskip("fastapi")

    from fastapi import Request
    from jentic.problem_details import problem_detail_exception_handler

    # Mock request
    class MockRequest:
        pass

    exc = BadRequest(detail="Test error", instance="/test")
    response = await problem_detail_exception_handler(MockRequest(), exc)

    assert response.status_code == 400
    assert response.media_type == "application/problem+json"
    assert response.body is not None
