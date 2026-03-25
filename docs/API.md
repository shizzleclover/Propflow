## REST API contract (MVP)

### Conventions
- **Auth**: `Authorization: Bearer <jwt>`
- **Errors**: `{"error":{"code":"…","message":"…","details":…}}`
- **Time**: ISO 8601 UTC strings (e.g. `2026-03-25T18:30:00.000Z`)

---

## Auth

### `POST /auth/register-client` (public)
Body:
```json
{ "name": "Jane Client", "email": "jane@example.com", "password": "longpassword" }
```
201:
```json
{ "user": { "id": "...", "role": "CLIENT", "name": "Jane Client", "email": "jane@example.com" } }
```

### `POST /auth/login` (public)
Body:
```json
{ "email": "admin@example.com", "password": "..." }
```
200:
```json
{
  "accessToken": "...",
  "user": { "id": "...", "role": "ADMIN", "name": "Admin", "email": "admin@example.com" }
}
```

### `GET /auth/me` (auth)
200:
```json
{ "user": { "id": "...", "role": "AGENT", "name": "Ava Agent", "email": "ava@x.com", "status": "ACTIVE" } }
```

---

## Users (Admin only)

### `POST /users`
Body:
```json
{ "role": "AGENT", "name": "Ava Agent", "email": "ava@agency.com", "password": "..." }
```
201:
```json
{ "user": { "id": "...", "role": "AGENT", "status": "ACTIVE", "name": "Ava Agent", "email": "ava@agency.com" } }
```

### `GET /users?role=AGENT&status=ACTIVE`
200:
```json
{ "users": [ { "id": "...", "role": "AGENT", "status": "ACTIVE", "name": "...", "email": "...", "createdAt": "...", "updatedAt": "..." } ] }
```

### `PATCH /users/:id`
Body:
```json
{ "status": "DEACTIVATED" }
```
200:
```json
{ "user": { "id": "...", "role": "AGENT", "status": "DEACTIVATED", "name": "...", "email": "...", "createdAt": "...", "updatedAt": "..." } }
```

---

## Properties

### `GET /properties` (public; clients see AVAILABLE only)
Query examples:
- `?city=Sydney&minPrice=500000&beds=2&limit=20&offset=0`
200:
```json
{ "properties": [ { "_id": "...", "title": "...", "status": "AVAILABLE", "price": 123, "address": { "city": "..." }, "assignedAgentId": "..." } ] }
```

### `GET /properties/:id` (public; client blocked if not AVAILABLE)
200:
```json
{ "property": { "_id": "...", "title": "...", "status": "AVAILABLE", "price": 123, "address": { "line1": "...", "city": "..." }, "assignedAgentId": "..." } }
```

### `POST /properties` (ADMIN)
Body:
```json
{
  "title": "2 bed apartment",
  "description": "Close to transit",
  "assignedAgentId": "...",
  "address": { "line1": "1 Main St", "city": "Sydney" },
  "price": 900000,
  "attributes": { "beds": 2, "baths": 1, "propertyType": "Apartment" }
}
```
201:
```json
{ "property": { "_id": "...", "status": "AVAILABLE", "title": "...", "assignedAgentId": "...", "price": 900000 } }
```

### `PATCH /properties/:id`
- **ADMIN**: can patch most fields (including assignment)
- **AGENT**: can patch only `{ "status": "UNDER_OFFER" }` for properties assigned to them

---

## Bookings (auth required)

### `POST /bookings` (CLIENT)
Body:
```json
{
  "propertyId": "...",
  "preferredSlots": [
    { "start": "2026-03-26T01:00:00.000Z", "end": "2026-03-26T01:30:00.000Z" }
  ],
  "clientNote": "Can we park nearby?"
}
```
201:
```json
{ "booking": { "_id": "...", "status": "PENDING", "propertyId": "...", "agentId": "...", "clientId": "...", "preferredSlots": [ ... ] } }
```

### `GET /bookings?status=PENDING` (CLIENT/AGENT/ADMIN)
- CLIENT: returns own bookings
- AGENT: returns assigned bookings
- ADMIN: returns all bookings (MVP)

### `PATCH /bookings/:id/approve` (AGENT)
Body:
```json
{ "confirmedSlot": { "start": "2026-03-26T01:00:00.000Z", "end": "2026-03-26T01:30:00.000Z" }, "agentNote": "See you then" }
```
409 when conflict:
```json
{ "error": { "code": "CONFLICT", "message": "Booking conflict detected", "details": { "conflictBookingId": "..." } } }
```

### `PATCH /bookings/:id/propose` (AGENT)
Body:
```json
{ "proposedSlot": { "start": "2026-03-26T02:00:00.000Z", "end": "2026-03-26T02:30:00.000Z" } }
```

### `PATCH /bookings/:id/decline` (AGENT)
Body:
```json
{ "agentNote": "Already booked" }
```

### `PATCH /bookings/:id/cancel` (CLIENT)
Body:
```json
{ "clientNote": "Can’t make it" }
```

---

## CRM (auth required)

### `POST /crm/notes` (AGENT)
Body:
```json
{ "clientId": "...", "propertyId": "...", "bookingId": "...", "text": "Client prefers morning viewings." }
```

### `GET /crm/clients/:clientId/notes` (AGENT/ADMIN)
- AGENT: sees only own notes
- ADMIN: sees all notes

---

## Dashboard (ADMIN)

### `GET /dashboard/kpis`
200:
```json
{
  "kpis": {
    "period": { "from": "...", "to": "..." },
    "totals": { "agentsActive": 3, "clientsActive": 10, "properties": 42, "bookingRequestsLast7d": 7 },
    "bookingStatus": { "PENDING": 2, "APPROVED": 3 },
    "topAgentsByApprovedBookings": [ { "agentId": "...", "approvedCount": 5 } ],
    "generatedAt": "..."
  }
}
```

