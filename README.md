# jentic-api-problem-details

Reusable [RFC 9457](https://www.rfc-editor.org/rfc/rfc9457.html) Problem Details components for all Jentic APIs.

## Purpose

All Jentic APIs use `application/problem+json` for error responses. Rather than inlining schemas and responses in every API, all Jentic OpenAPI descriptions reference this repository's `openapi-domain.yaml` directly.

## Usage

Reference components directly from your OpenAPI description:

```yaml
responses:
  '400':
    $ref: 'https://raw.githubusercontent.com/jentic/jentic-api-problem-details/main/openapi-domain.yaml#/components/responses/BadRequest'
  '401':
    $ref: 'https://raw.githubusercontent.com/jentic/jentic-api-problem-details/main/openapi-domain.yaml#/components/responses/Unauthorized'
  '422':
    $ref: 'https://raw.githubusercontent.com/jentic/jentic-api-problem-details/main/openapi-domain.yaml#/components/responses/ValidationError'
  '500':
    $ref: 'https://raw.githubusercontent.com/jentic/jentic-api-problem-details/main/openapi-domain.yaml#/components/responses/ServerError'
```

## Problem Types

Jentic uses `about:blank` as the `type` for most problem responses, per RFC 9457 guidance. When `type` is `about:blank`, the `title` SHOULD be the standard HTTP status phrase and `detail` MUST provide a human-readable explanation specific to the occurrence.

Where a specific IANA-registered problem type applies, it SHOULD be used. See the [IANA HTTP Problem Types Registry](https://www.iana.org/assignments/http-problem-types/http-problem-types.xhtml).

## Structure

```
openapi-domain.yaml        # Primary artifact — all components bundled
schemas/
  problem-details.yaml     # ProblemDetails schema
  error-item.yaml          # ErrorItem schema (errors[] array entries)
responses/
  400.yaml
  401.yaml
  403.yaml
  404.yaml
  409.yaml
  422.yaml
  429.yaml
  500.yaml
  503.yaml
headers/
  common.yaml              # Deprecation, Sunset, RateLimit headers
```

## Standards References

- [RFC 9457 — Problem Details for HTTP APIs](https://www.rfc-editor.org/rfc/rfc9457.html)
- [IANA HTTP Problem Types Registry](https://www.iana.org/assignments/http-problem-types/http-problem-types.xhtml)
- [OpenAPI Specification 3.2.0](https://spec.openapis.org/oas/v3.2.0.html)
