## Data model (MongoDB / Mongoose)

### `users`
- **role**: `ADMIN | AGENT | CLIENT`
- **status**: `ACTIVE | DEACTIVATED`
- **name**
- **email** (unique)
- **passwordHash** (not selected by default)
- **timestamps**

Key indexes:
- `email` unique
- `{ role, status }`

---

### `properties`
- **title**
- **description**
- **status**: `AVAILABLE | UNDER_OFFER | UNAVAILABLE`
- **assignedAgentId** (User)
- **address**: line1, line2, city, state, postalCode, country
- **price**
- **attributes**: beds, baths, areaSqft, propertyType
- **timestamps**

Key indexes:
- `{ status, price }`
- `{ assignedAgentId }`
- `{ address.city }`

---

### `bookings`
Represents a viewing request and its workflow outcome.

- **propertyId** (Property)
- **agentId** (User) — derived from property assignment at request time
- **clientId** (User)
- **status**: `PENDING | PROPOSED | APPROVED | DECLINED | CANCELLED`
- **preferredSlots[]**: `{ start, end }`
- **proposedSlot**: `{ start, end } | null`
- **confirmedSlot**: `{ start, end } | null`
- **clientNote**
- **agentNote**
- **timestamps**

Conflict rule (MVP):
- Only **APPROVED** bookings participate in conflict checks
- Overlap check: existing.start < new.end AND existing.end > new.start
- Conflicts are checked for both:
  - same **propertyId**
  - same **agentId**

Key indexes:
- `{ propertyId, status }`
- `{ agentId, status }`
- `{ clientId, status }`
- `confirmedSlot.start/end`

---

### `crm_notes`
Agent-authored notes about client interactions.

- **clientId**
- **agentId**
- **propertyId** (optional)
- **bookingId** (optional)
- **text**
- **timestamps**

Key indexes:
- `{ clientId, createdAt }`
- `{ agentId }`

