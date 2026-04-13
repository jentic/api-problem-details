"""Tests for Problem Details models."""
import pytest
from pydantic import ValidationError

from jentic.problem_details import ErrorItem, ProblemDetail


def test_problem_detail_minimal():
    """Test creating a minimal ProblemDetail with only required fields."""
    problem = ProblemDetail(detail="Something went wrong")

    assert problem.detail == "Something went wrong"
    assert problem.type == "about:blank"
    assert problem.status is None
    assert problem.title is None
    assert problem.instance is None
    assert problem.code is None
    assert problem.errors is None


def test_problem_detail_full():
    """Test creating a ProblemDetail with all fields."""
    problem = ProblemDetail(
        type="about:blank",
        status=400,
        title="Bad Request",
        detail="The request body is missing required field 'name'.",
        instance="/v2/capability-sets",
        code="JENTIC-4001",
        errors=[
            ErrorItem(
                detail="Field 'name' is required.",
                pointer="#/name"
            )
        ]
    )

    assert problem.type == "about:blank"
    assert problem.status == 400
    assert problem.title == "Bad Request"
    assert problem.detail == "The request body is missing required field 'name'."
    assert problem.instance == "/v2/capability-sets"
    assert problem.code == "JENTIC-4001"
    assert len(problem.errors) == 1
    assert problem.errors[0].detail == "Field 'name' is required."


def test_problem_detail_json_serialization():
    """Test that ProblemDetail serializes to JSON correctly."""
    problem = ProblemDetail(
        status=400,
        title="Bad Request",
        detail="Invalid input",
        instance="/test"
    )

    json_data = problem.model_dump(mode="json", exclude_none=True)

    assert json_data["type"] == "about:blank"
    assert json_data["status"] == 400
    assert json_data["title"] == "Bad Request"
    assert json_data["detail"] == "Invalid input"
    assert json_data["instance"] == "/test"
    assert "code" not in json_data  # Should be excluded when None
    assert "errors" not in json_data  # Should be excluded when None


def test_error_item_minimal():
    """Test creating an ErrorItem with only required fields."""
    error = ErrorItem(detail="Field 'name' is required")

    assert error.detail == "Field 'name' is required"
    assert error.pointer is None
    assert error.parameter is None
    assert error.header is None
    assert error.code is None


def test_error_item_with_pointer():
    """Test ErrorItem with JSON pointer."""
    error = ErrorItem(
        detail="Field 'email' must be a valid email address",
        pointer="#/email"
    )

    assert error.detail == "Field 'email' must be a valid email address"
    assert error.pointer == "#/email"


def test_error_item_with_parameter():
    """Test ErrorItem with query parameter."""
    error = ErrorItem(
        detail="Must be a positive integer between 1 and 100",
        parameter="limit"
    )

    assert error.detail == "Must be a positive integer between 1 and 100"
    assert error.parameter == "limit"


def test_error_item_with_header():
    """Test ErrorItem with request header."""
    error = ErrorItem(
        detail="Authorization header is malformed",
        header="Authorization",
        code="AUTH-001"
    )

    assert error.detail == "Authorization header is malformed"
    assert error.header == "Authorization"
    assert error.code == "AUTH-001"


def test_problem_detail_multiple_errors():
    """Test ProblemDetail with multiple validation errors."""
    problem = ProblemDetail(
        status=422,
        title="Unprocessable Content",
        detail="Multiple validation errors occurred",
        instance="/api/resources",
        errors=[
            ErrorItem(detail="Field 'name' is required", pointer="#/name"),
            ErrorItem(detail="Field 'email' must be valid", pointer="#/email"),
            ErrorItem(detail="Parameter 'limit' must be positive", parameter="limit"),
        ]
    )

    assert len(problem.errors) == 3
    assert problem.errors[0].pointer == "#/name"
    assert problem.errors[1].pointer == "#/email"
    assert problem.errors[2].parameter == "limit"


def test_problem_detail_status_code_validation():
    """Test that status code is validated within HTTP range."""
    # Valid status codes
    ProblemDetail(detail="Test", status=200)
    ProblemDetail(detail="Test", status=599)

    # Invalid status codes should raise validation error
    with pytest.raises(ValidationError):
        ProblemDetail(detail="Test", status=99)

    with pytest.raises(ValidationError):
        ProblemDetail(detail="Test", status=600)


def test_problem_detail_max_length_validation():
    """Test that max_length constraints are enforced."""
    # detail exceeds max_length
    with pytest.raises(ValidationError):
        ProblemDetail(detail="x" * 4097)

    # title exceeds max_length
    with pytest.raises(ValidationError):
        ProblemDetail(detail="Test", title="x" * 1025)

    # code exceeds max_length
    with pytest.raises(ValidationError):
        ProblemDetail(detail="Test", code="x" * 51)


def test_error_item_max_length_validation():
    """Test that ErrorItem max_length constraints are enforced."""
    # detail exceeds max_length
    with pytest.raises(ValidationError):
        ErrorItem(detail="x" * 4097)

    # pointer exceeds max_length
    with pytest.raises(ValidationError):
        ErrorItem(detail="Test", pointer="x" * 1025)
