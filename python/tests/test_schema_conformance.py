"""
Tests to ensure Pydantic models conform to the OpenAPI schemas.
Prevents drift between implementation and specification.
"""

import json
from pathlib import Path

import pytest
import yaml
from pydantic import TypeAdapter

from jentic.problem_details.models import ErrorItem, ProblemDetail


def load_schema(name: str) -> dict:
    """Load a schema file from the schemas/ directory."""
    # From python/tests/test_schema_conformance.py -> api-problem-details/schemas/
    schema_path = Path(__file__).parent.parent.parent / "schemas" / f"{name}.yaml"
    with open(schema_path) as f:
        return yaml.safe_load(f)


def test_problem_detail_schema_conformance():
    """Verify ProblemDetail model matches problem-details.yaml schema."""
    openapi_schema = load_schema("problem-details")
    pydantic_schema = TypeAdapter(ProblemDetail).json_schema()

    # Check required fields match
    assert openapi_schema["required"] == ["detail"]
    assert "detail" in pydantic_schema["required"]

    # Check properties exist in both
    openapi_props = set(openapi_schema["properties"].keys())
    pydantic_props = set(pydantic_schema["properties"].keys())
    assert openapi_props == pydantic_props, f"Property mismatch: OpenAPI={openapi_props}, Pydantic={pydantic_props}"

    # Check specific field constraints
    # type field (has default, so not in anyOf)
    assert openapi_schema["properties"]["type"]["maxLength"] == 1024
    assert pydantic_schema["properties"]["type"]["maxLength"] == 1024
    assert openapi_schema["properties"]["type"]["default"] == "about:blank"

    # status field (optional, uses anyOf in Pydantic)
    assert openapi_schema["properties"]["status"]["minimum"] == 100
    assert openapi_schema["properties"]["status"]["maximum"] == 599
    # Pydantic puts constraints in anyOf for optional fields
    status_schema = pydantic_schema["properties"]["status"]["anyOf"][0]  # First is non-null type
    assert status_schema["minimum"] == 100
    assert status_schema["maximum"] == 599

    # detail field (required)
    assert openapi_schema["properties"]["detail"]["maxLength"] == 4096
    assert pydantic_schema["properties"]["detail"]["maxLength"] == 4096

    # instance field (optional, uses anyOf in Pydantic)
    assert openapi_schema["properties"]["instance"]["maxLength"] == 1024
    instance_schema = pydantic_schema["properties"]["instance"]["anyOf"][0]
    assert instance_schema["maxLength"] == 1024

    # code field (optional, uses anyOf in Pydantic)
    assert openapi_schema["properties"]["code"]["maxLength"] == 50
    code_schema = pydantic_schema["properties"]["code"]["anyOf"][0]
    assert code_schema["maxLength"] == 50

    # errors field (optional, uses anyOf in Pydantic)
    assert openapi_schema["properties"]["errors"]["maxItems"] == 1000
    errors_schema = pydantic_schema["properties"]["errors"]["anyOf"][0]
    assert errors_schema["maxItems"] == 1000


def test_error_item_schema_conformance():
    """Verify ErrorItem model matches error-item.yaml schema."""
    openapi_schema = load_schema("error-item")
    pydantic_schema = TypeAdapter(ErrorItem).json_schema()

    # Check required fields match
    assert openapi_schema["required"] == ["detail"]
    assert "detail" in pydantic_schema["required"]

    # Check properties exist in both
    openapi_props = set(openapi_schema["properties"].keys())
    pydantic_props = set(pydantic_schema["properties"].keys())
    assert openapi_props == pydantic_props, f"Property mismatch: OpenAPI={openapi_props}, Pydantic={pydantic_props}"

    # Check specific field constraints
    # detail field (required)
    assert openapi_schema["properties"]["detail"]["maxLength"] == 4096
    assert pydantic_schema["properties"]["detail"]["maxLength"] == 4096

    # pointer field (optional, uses anyOf in Pydantic)
    assert openapi_schema["properties"]["pointer"]["maxLength"] == 1024
    pointer_schema = pydantic_schema["properties"]["pointer"]["anyOf"][0]
    assert pointer_schema["maxLength"] == 1024

    # parameter field (optional, uses anyOf in Pydantic)
    assert openapi_schema["properties"]["parameter"]["maxLength"] == 1024
    parameter_schema = pydantic_schema["properties"]["parameter"]["anyOf"][0]
    assert parameter_schema["maxLength"] == 1024

    # header field (optional, uses anyOf in Pydantic)
    assert openapi_schema["properties"]["header"]["maxLength"] == 1024
    header_schema = pydantic_schema["properties"]["header"]["anyOf"][0]
    assert header_schema["maxLength"] == 1024

    # code field (optional, uses anyOf in Pydantic)
    assert openapi_schema["properties"]["code"]["maxLength"] == 50
    code_schema = pydantic_schema["properties"]["code"]["anyOf"][0]
    assert code_schema["maxLength"] == 50


def test_example_objects_validate_against_schemas():
    """Verify example objects from schemas validate against Pydantic models."""
    problem_details_schema = load_schema("problem-details")
    error_item_schema = load_schema("error-item")

    # Test ProblemDetail example
    problem_example = {
        "type": problem_details_schema["properties"]["type"]["example"],
        "status": problem_details_schema["properties"]["status"]["example"],
        "title": problem_details_schema["properties"]["title"]["example"],
        "detail": problem_details_schema["properties"]["detail"]["example"],
        "instance": problem_details_schema["properties"]["instance"]["example"],
        "code": problem_details_schema["properties"]["code"]["example"],
    }
    problem = ProblemDetail(**problem_example)
    assert problem.type == "about:blank"
    assert problem.status == 400
    assert problem.title == "Bad Request"

    # Test ErrorItem example
    error_example = {
        "detail": error_item_schema["properties"]["detail"]["example"],
        "pointer": error_item_schema["properties"]["pointer"]["example"],
        "parameter": error_item_schema["properties"]["parameter"]["example"],
        "header": error_item_schema["properties"]["header"]["example"],
        "code": error_item_schema["properties"]["code"]["example"],
    }
    error = ErrorItem(**error_example)
    assert error.detail == "Field 'name' must not be blank."
    assert error.pointer == "#/name"
    assert error.parameter == "limit"
