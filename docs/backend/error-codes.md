# Error Codes

All errors use the standard envelope:

```json
{
  "success": false,
  "message": "Validation failed",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": []
  },
  "meta": {
    "timestamp": "ISO_DATE",
    "requestId": "req_unique_id"
  }
}
```

| Code | HTTP | Meaning |
|---|---:|---|
| `AUTH_REQUIRED` | 401 | Missing/invalid access token |
| `TOKEN_EXPIRED` | 401 | Access token expired |
| `FORBIDDEN` | 403 | Role lacks permission |
| `RECORD_FORBIDDEN` | 403 | User lacks record-level access |
| `NOT_FOUND` | 404 | Record not found |
| `VALIDATION_ERROR` | 422 | Field validation failed |
| `DUPLICATE_RECORD` | 409 | Unique constraint conflict |
| `INVALID_STATE_TRANSITION` | 409 | Workflow transition not allowed |
| `BED_NOT_AVAILABLE` | 409 | Bed cannot be allocated/reserved |
| `ADMISSION_NOT_READY` | 409 | Missing prerequisites for admission |
| `ORDER_ALREADY_COMPLETED` | 409 | Order cannot be edited/completed again |
| `SIGNED_RECORD_IMMUTABLE` | 409 | Signed clinical record cannot be overwritten |
| `MEDICATION_ALREADY_ADMINISTERED` | 409 | Scheduled dose already administered |
| `HIGH_ALERT_WITNESS_REQUIRED` | 422 | Witness required for high-alert medicine |
| `FILE_TYPE_NOT_ALLOWED` | 422 | Unsupported upload MIME type |
| `FILE_TOO_LARGE` | 413 | Upload size exceeds configured limit |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

## Error Detail Examples

```json
{
  "field": "bedId",
  "message": "Selected bed is already occupied"
}
```

```json
{
  "field": "status",
  "message": "Cannot move admission from REQUESTED to ADMITTED directly"
}
```

