# Workshop Tracker API Contract 

**Base URL:** `http://localhost:3000/api/v1`  
**Version:** 1.0.0  
**Auth:** Cookie-based (credentials required on all protected routes)

---

## General Rules

- All request and response bodies are `application/json`
- All timestamps are ISO 8601 with timezone: `2025-01-15T10:30:00Z`
- All IDs are UUIDs: `uuid_generate_v4()` format
- Rate limit: **100 requests per 15 minutes** per IP. Exceeding this returns `429`
- CORS origin allowed: `http://localhost:5173`

---

## Standard Response Envelope

**Success**
```json
{
  "status": "success",
  "data": { }
}
```

**Error**
```json
{
  "status": "error",
  "message": "Human-readable error description"
}
```

---

## Status Codes

| Code | Meaning |
|------|---------|
| `200` | OK — request succeeded |
| `201` | Created — resource created successfully |
| `400` | Bad Request — validation failed or missing fields |
| `401` | Unauthorized — not logged in |
| `403` | Forbidden — logged in but not allowed |
| `404` | Not Found — resource does not exist |
| `409` | Conflict — duplicate resource (e.g. phone number) |
| `429` | Too Many Requests — rate limit exceeded |
| `500` | Internal Server Error |

---

## Health

### `GET /health`

Check that the API is running. No auth required.

**Response `200`**
```json
{
  "status": "success",
  "message": "API is running smoothly"
}
```

---

## Auth

### `POST /auth/register`

Register a new artisan account.

**Request Body**
```json
{
  "name": "Amara Diallo",
  "workshop_name": "Diallo Tailors",
  "phone": "+237612345678",
  "password": "securepassword123",
  "workshop_type": "TAILOR"
}
```

| Field | Type | Rules |
|-------|------|-------|
| `name` | string | Required |
| `workshop_name` | string | Required |
| `phone` | string | Required, unique |
| `password` | string | Required, min 8 characters |
| `workshop_type` | string | Required — must be `TAILOR`, `WELDER`, or `CARPENTER` |

**Response `201`**
```json
{
  "status": "success",
  "data": {
    "id": "a1b2c3d4-...",
    "name": "Amara Diallo",
    "workshop_name": "Diallo Tailors",
    "phone": "+237612345678",
    "workshop_type": "TAILOR",
    "created_at": "2025-01-15T10:30:00Z"
  }
}
```

**Errors**
- `400` — missing or invalid fields, invalid `workshop_type`
- `409` — phone number already registered

---

### `POST /auth/login`

Log in and receive a session cookie.

> ⚠️ Rate limited: 100 requests per 15 minutes per IP.

**Request Body**
```json
{
  "phone": "+237612345678",
  "password": "securepassword123"
}
```

**Response `200`**
```json
{
  "status": "success",
  "data": {
    "id": "a1b2c3d4-...",
    "name": "Amara Diallo",
    "workshop_name": "Diallo Tailors",
    "workshop_type": "TAILOR"
  }
}
```

Sets a `HttpOnly` session cookie on success.

**Errors**
- `400` — missing fields
- `401` — incorrect phone or password
- `429` — too many login attempts

---

### `POST /auth/logout`

Log out and clear the session cookie. Requires auth.

**Response `200`**
```json
{
  "status": "success",
  "message": "Logged out successfully"
}
```

---

## Customers

All customer routes are scoped to the logged-in user. One artisan cannot access another's customers.

### `GET /customers`

List all customers belonging to the logged-in artisan.

**Query Parameters**

| Param | Type | Description |
|-------|------|-------------|
| `cursor` | UUID | ID of the last customer from the previous page |
| `limit` | integer | Number of results to return (default: `20`, max: `100`) |

**Response `200`**
```json
{
  "status": "success",
  "data": [
    {
      "id": "b2c3d4e5-...",
      "name": "Fatima Bah",
      "phone": "+237698765432",
      "created_at": "2025-01-10T08:00:00Z"
    }
  ],
  "pagination": {
    "next_cursor": "b2c3d4e5-...",
    "has_more": true
  }
}
```

> When `has_more` is `false`, there are no further pages. Pass `next_cursor` as `cursor` in the next request to continue.

---

### `POST /customers`

Create a new customer.

**Request Body**
```json
{
  "name": "Fatima Bah",
  "phone": "+237698765432"
}
```

| Field | Type | Rules |
|-------|------|-------|
| `name` | string | Required |
| `phone` | string | Required, unique per artisan |

**Response `201`**
```json
{
  "status": "success",
  "data": {
    "id": "b2c3d4e5-...",
    "user_id": "a1b2c3d4-...",
    "name": "Fatima Bah",
    "phone": "+237698765432",
    "created_at": "2025-01-10T08:00:00Z"
  }
}
```

**Errors**
- `400` — missing fields
- `409` — this phone number already exists for one of your customers

---

### `GET /customers/:id`

Get a single customer by ID.

**Response `200`**
```json
{
  "status": "success",
  "data": {
    "id": "b2c3d4e5-...",
    "name": "Fatima Bah",
    "phone": "+237698765432",
    "created_at": "2025-01-10T08:00:00Z"
  }
}
```

**Errors**
- `404` — customer not found or belongs to another artisan

---

### `PATCH /customers/:id`

Update a customer's name or phone.

**Request Body** *(all fields optional)*
```json
{
  "name": "Fatima Bah-Kouyaté",
  "phone": "+237698000000"
}
```

**Response `200`**
```json
{
  "status": "success",
  "data": {
    "id": "b2c3d4e5-...",
    "name": "Fatima Bah-Kouyaté",
    "phone": "+237698000000",
    "updated_at": "2025-01-16T09:00:00Z"
  }
}
```

**Errors**
- `404` — customer not found
- `409` — updated phone conflicts with an existing customer

---

### `DELETE /customers/:id`

Delete a customer. This will **fail** if the customer has existing orders (`ON DELETE RESTRICT`).

**Response `200`**
```json
{
  "status": "success",
  "message": "Customer deleted"
}
```

**Errors**
- `404` — customer not found
- `409` — customer has orders and cannot be deleted

---

## Orders

All order routes are scoped to the logged-in artisan.

### `GET /orders`

List all orders. Supports filtering, sorting, and pagination for the dashboard.

**Query Parameters**

| Param | Type | Description |
|-------|------|-------------|
| `status` | string | Filter by status: `PENDING`, `IN_PROGRESS`, `READY`, `DELIVERED`, `CANCELLED` |
| `customer_id` | UUID | Filter by customer |
| `due_before` | ISO 8601 | Filter orders due before this date |
| `due_after` | ISO 8601 | Filter orders due after this date |
| `sort` | string | `due_date` or `created_at` (default: `created_at`) |
| `order` | string | `asc` or `desc` (default: `desc`) |
| `cursor` | UUID | ID of the last order from the previous page |
| `limit` | integer | Number of results to return (default: `20`, max: `100`) |

**Response `200`**
```json
{
  "status": "success",
  "data": [
    {
      "id": "c3d4e5f6-...",
      "order_number": "ORD-20250115-0001",
      "customer": {
        "id": "b2c3d4e5-...",
        "name": "Fatima Bah"
      },
      "description": "Wedding dress alteration",
      "status": "IN_PROGRESS",
      "total_price": "45000.00",
      "deposit_paid": "20000.00",
      "balance_due": "25000.00",
      "due_date": "2025-01-20T00:00:00Z",
      "created_at": "2025-01-10T08:00:00Z"
    }
  ],
  "pagination": {
    "next_cursor": "c3d4e5f6-...",
    "has_more": true
  }
}
```

> `balance_due` is computed as `total_price - deposit_paid`. When `has_more` is `false`, there are no further pages. Pass `next_cursor` as `cursor` in the next request to continue.

---

### `POST /orders`

Create a new order.

**Request Body**
```json
{
  "customer_id": "b2c3d4e5-...",
  "description": "Wedding dress alteration",
  "total_price": 45000.00,
  "deposit_paid": 20000.00,
  "due_date": "2025-01-20T00:00:00Z"
}
```

| Field | Type | Rules |
|-------|------|-------|
| `customer_id` | UUID | Required, must belong to this artisan |
| `description` | string | Required |
| `total_price` | decimal | Required, ≥ 0 |
| `deposit_paid` | decimal | Required, ≥ 0, cannot exceed `total_price` |
| `due_date` | ISO 8601 | Required |

`order_number` is auto-generated by the server using the format `ORD-YYYYMMDD-XXXX`, where `XXXX` is a zero-padded daily sequence per artisan (e.g. `ORD-20250115-0001`). Initial `status` is `PENDING`.

**Response `201`**
```json
{
  "status": "success",
  "data": {
    "id": "c3d4e5f6-...",
    "order_number": "ORD-20250115-0001",
    "customer_id": "b2c3d4e5-...",
    "description": "Wedding dress alteration",
    "status": "PENDING",
    "total_price": "45000.00",
    "deposit_paid": "20000.00",
    "balance_due": "25000.00",
    "due_date": "2025-01-20T00:00:00Z",
    "created_at": "2025-01-15T10:30:00Z"
  }
}
```

**Errors**
- `400` — missing fields, negative price, deposit exceeds total
- `404` — `customer_id` not found or belongs to another artisan

---

### `GET /orders/:id`

Get a single order by ID.

**Response `200`**
```json
{
  "status": "success",
  "data": {
    "id": "c3d4e5f6-...",
    "order_number": "ORD-20250115-0001",
    "customer": {
      "id": "b2c3d4e5-...",
      "name": "Fatima Bah",
      "phone": "+237698765432"
    },
    "description": "Wedding dress alteration",
    "status": "IN_PROGRESS",
    "total_price": "45000.00",
    "deposit_paid": "20000.00",
    "balance_due": "25000.00",
    "due_date": "2025-01-20T00:00:00Z",
    "created_at": "2025-01-10T08:00:00Z",
    "updated_at": "2025-01-12T14:00:00Z"
  }
}
```

**Errors**
- `404` — order not found or belongs to another artisan

---

### `PATCH /orders/:id`

Update an order's details or status.

> ⚠️ Orders with status `DELIVERED` or `CANCELLED` are locked and cannot be edited. Use `POST /orders/:id/reopen` to unlock them first.

**Request Body** *(all fields optional)*
```json
{
  "description": "Wedding dress alteration + hemming",
  "status": "READY",
  "total_price": 50000.00,
  "deposit_paid": 25000.00,
  "due_date": "2025-01-22T00:00:00Z"
}
```

`status` must be one of: `PENDING`, `IN_PROGRESS`, `READY`, `DELIVERED`, `CANCELLED`

**Response `200`**
```json
{
  "status": "success",
  "data": {
    "id": "c3d4e5f6-...",
    "status": "READY",
    "updated_at": "2025-01-16T09:00:00Z"
  }
}
```

**Errors**
- `400` — invalid `status` value
- `403` — order is locked (`DELIVERED` or `CANCELLED`); reopen it first
- `404` — order not found

---

### `POST /orders/:id/reopen`

Unlocks a `DELIVERED` or `CANCELLED` order and moves it back to `IN_PROGRESS`. Requires a reason for the audit trail.

**Request Body**
```json
{
  "reason": "Customer requested additional alterations after collection"
}
```

| Field | Type | Rules |
|-------|------|-------|
| `reason` | string | Required |

**Response `200`**
```json
{
  "status": "success",
  "data": {
    "id": "c3d4e5f6-...",
    "status": "IN_PROGRESS",
    "updated_at": "2025-01-17T11:00:00Z"
  }
}
```

**Errors**
- `400` — missing `reason`, or order is not in a locked state
- `404` — order not found

---

### `DELETE /orders/:id`

Soft-deletes an order by setting `deleted_at`. The record is retained in the database.

**Response `200`**
```json
{
  "status": "success",
  "message": "Order deleted"
}
```

**Errors**
- `404` — order not found

---

## Data Constraints Summary

| Field | Allowed Values |
|-------|---------------|
| `workshop_type` | `TAILOR`, `WELDER`, `CARPENTER` |
| `order.status` | `PENDING`, `IN_PROGRESS`, `READY`, `DELIVERED`, `CANCELLED` |
| `order_number` | Auto-generated: `ORD-YYYYMMDD-XXXX` (e.g. `ORD-20250115-0001`) |
| `customer phone` | Unique per artisan (not globally) |
| `user phone` | Globally unique |
| `deposit_paid` | Cannot exceed `total_price` |
| `total_price` | `DECIMAL(10,2)` — max `99,999,999.99` |
| Locked statuses | `DELIVERED` and `CANCELLED` orders cannot be edited without reopening |
