# Workshop Tracker API Contract (v1)
**Base URL:** `http://localhost:3000/api/v1`

## 1. Authentication: Login
* **POST** `/auth/login`
**Request Body:**
{ "phone": "0541234567", "password": "securepassword123" }
**Response (200 OK):**
{
  "status": "success",
    "data": {
        "user": { "id": "uuid-here", "name": "Kwame", "workshop_name": "Kwame Styles", "workshop_type": "TAILOR" }
          }
          }

          ## 2. Orders: Create Order
          * **POST** `/orders`
          **Request Body:**
          { "customer_id": "uuid-here", "description": "Two piece suit", "due_date": "2026-06-20T14:30:00Z" }
          **Response (201 Created):**
          {
            "status": "success",
              "data": { "id": "uuid-here", "order_number": "ORD-1001", "status": "PENDING", "is_overdue": false }
              }
              