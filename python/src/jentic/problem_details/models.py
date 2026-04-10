"""RFC 9457 Problem Details models for Jentic APIs.

These Pydantic models mirror the OpenAPI schemas in the parent repository.
"""
from typing import Annotated

from pydantic import BaseModel, Field, HttpUrl


class ErrorItem(BaseModel):
    """A granular error detail entry within the errors[] array of a ProblemDetails response.

    At least one of pointer, parameter, or header SHOULD be present to identify the error source.
    """

    detail: Annotated[
        str,
        Field(
            max_length=4096,
            description="A human-readable explanation of this specific error. Be precise — name the field, parameter, or header involved.",
            examples=["Field 'name' must not be blank."],
        ),
    ]

    pointer: Annotated[
        str | None,
        Field(
            default=None,
            max_length=1024,
            description="A JSON Pointer (RFC 6901) to the specific request body property that is the source of this error.",
            examples=["#/name"],
        ),
    ] = None

    parameter: Annotated[
        str | None,
        Field(
            default=None,
            max_length=1024,
            description="The name of the query or path parameter that is the source of this error.",
            examples=["limit"],
        ),
    ] = None

    header: Annotated[
        str | None,
        Field(
            default=None,
            max_length=1024,
            description="The name of the request header that is the source of this error.",
            examples=["Authorization"],
        ),
    ] = None

    code: Annotated[
        str | None,
        Field(
            default=None,
            max_length=50,
            description="An optional provider-specific code identifying this error in internal taxonomy or documentation.",
            examples=["JENTIC-V-001"],
        ),
    ] = None


class ProblemDetail(BaseModel):
    """RFC 9457 Problem Details for HTTP APIs.

    This is the standard error response format for all Jentic APIs.
    Content-Type: application/problem+json

    See: https://www.rfc-editor.org/rfc/rfc9457.html
    """

    type: Annotated[
        str,
        Field(
            default="about:blank",
            max_length=1024,
            description=(
                "A URI reference identifying the problem type. When set to 'about:blank', "
                "the title SHOULD be the standard HTTP status phrase. Use an IANA-registered "
                "type URI where one applies."
            ),
            examples=["about:blank"],
        ),
    ] = "about:blank"

    status: Annotated[
        int | None,
        Field(
            default=None,
            ge=100,
            le=599,
            description="The HTTP status code for this occurrence of the problem.",
            examples=[400],
        ),
    ] = None

    title: Annotated[
        str | None,
        Field(
            default=None,
            max_length=1024,
            description=(
                "A short, human-readable summary of the problem type. Should not change "
                "between occurrences except for localisation purposes."
            ),
            examples=["Bad Request"],
        ),
    ] = None

    detail: Annotated[
        str,
        Field(
            max_length=4096,
            description=(
                "A human-readable explanation specific to this occurrence of the problem. "
                "MUST be present. Provide actionable information where possible."
            ),
            examples=["The request body is missing required field 'name'."],
        ),
    ]

    instance: Annotated[
        str | None,
        Field(
            default=None,
            max_length=1024,
            description=(
                "A URI reference identifying the specific occurrence of the problem. "
                "Typically the request path."
            ),
            examples=["/v2/capability-sets"],
        ),
    ] = None

    code: Annotated[
        str | None,
        Field(
            default=None,
            max_length=50,
            description=(
                "An optional provider-specific code for internal error taxonomy and "
                "observability correlation."
            ),
            examples=["JENTIC-4001"],
        ),
    ] = None

    errors: Annotated[
        list[ErrorItem] | None,
        Field(
            default=None,
            max_length=1000,
            description=(
                "An array of granular error details. Use when multiple validation errors "
                "or field-level problems need to be surfaced in a single response."
            ),
        ),
    ] = None

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "type": "about:blank",
                    "status": 400,
                    "title": "Bad Request",
                    "detail": "The request body is missing one or more required fields.",
                    "instance": "/v2/capability-sets",
                    "errors": [
                        {
                            "detail": "Field 'name' is required.",
                            "pointer": "#/name",
                        }
                    ],
                }
            ]
        }
    }
