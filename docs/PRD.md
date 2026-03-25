## PropFlow MVP PRD (mapped)

### Product summary
PropFlow is a role-based web platform that becomes the agency’s **single source of truth** for **Listings**, **Client CRM notes**, and **Viewing bookings**. The MVP focuses on eliminating information fragmentation and preventing double bookings.

### Target audience
- Small to medium real estate agencies
- Team size: **2–20 agents**

### Roles
- **Admin**: system oversight, user management, global property control, KPI dashboard
- **Agent**: schedule + booking workflow, property status updates, CRM notes
- **Client**: browse available properties, request viewings, track request status

### MVP defaults (decisions)
- **Property assignment**: exactly **one primary agent** per property (Admin can reassign)
- **Conflicts**: prevent overlaps on both **Property** and **Agent** for **approved** bookings
- **Client auth**: **required to request** a viewing (auditable workflow + status tracking)
- **Tenant model**: **single agency** for MVP (add `agencyId` later if needed)
- **Time handling**: store datetimes as **UTC**, display using agency timezone

---

## Epics → user stories → acceptance criteria

### Epic A: Authentication & RBAC
**A1. As a user, I can log in and receive an access token**
- **Given** a valid email/password for an ACTIVE user
- **When** I call `POST /auth/login`
- **Then** I receive a JWT access token and my profile (id, role, name, email)
- **And** invalid credentials return **401**

**A2. As a client, I can create an account**
- **Given** a new email
- **When** I call `POST /auth/register-client`
- **Then** a CLIENT user is created and returned
- **And** duplicate email returns **400**

**A3. As the system, I enforce RBAC for all protected routes**
- **Given** a route requiring a role
- **When** a different role accesses it
- **Then** the API returns **403**

---

### Epic B: User management (Admin)
**B1. As an Admin, I can create Agent/Admin accounts**
- **Given** I am an ADMIN
- **When** I call `POST /users` with role, name, email, password
- **Then** the account is created ACTIVE
- **And** email uniqueness is enforced

**B2. As an Admin, I can deactivate a user**
- **Given** a user id
- **When** I `PATCH /users/:id` with status=DEACTIVATED
- **Then** they can’t log in anymore (401 on login)

**B3. As an Admin, I can list users**
- **When** I `GET /users?role=AGENT&status=ACTIVE`
- **Then** I see matching users

---

### Epic C: Property inventory (SSOT listings)
**C1. As an Admin, I can create a property listing**
- **Given** I am an ADMIN
- **When** I call `POST /properties` with title, price, address, assignedAgentId
- **Then** the property is created with status AVAILABLE

**C2. As a Client, I can browse only AVAILABLE properties**
- **When** I request `GET /properties`
- **Then** I only see `status=AVAILABLE` listings

**C3. As an Agent, I can update property status for my assigned properties**
- **Given** I’m the property’s assigned agent
- **When** I `PATCH /properties/:id` with status
- **Then** the status updates
- **And** an agent cannot edit other agents’ properties

---

### Epic D: Viewing requests & booking workflow
**D1. As a Client, I can request a viewing**
- **Given** I am a CLIENT and the property is AVAILABLE
- **When** I `POST /bookings` with preferred time slots
- **Then** a booking is created with status PENDING

**D2. As an Agent, I can approve a request and confirm a time**
- **Given** I’m the assigned agent for that booking
- **When** I `PATCH /bookings/:id/approve` with a confirmed slot
- **Then** booking becomes APPROVED and stores confirmedSlot

**D3. As an Agent, I can propose an alternate time**
- **When** I `PATCH /bookings/:id/propose`
- **Then** status becomes PROPOSED with proposedSlot set

**D4. As an Agent, I can decline a request**
- **When** I `PATCH /bookings/:id/decline`
- **Then** status becomes DECLINED

**D5. As the system, I prevent double bookings**
- **Given** an APPROVED booking exists for the same property or agent
- **When** a second booking is approved with an overlapping time
- **Then** approval fails with **409 CONFLICT**

**D6. As a Client, I can cancel my request**
- **When** I `PATCH /bookings/:id/cancel`
- **Then** status becomes CANCELLED

---

### Epic E: Lightweight CRM notes
**E1. As an Agent, I can add notes about a client**
- **When** I `POST /crm/notes` with clientId and text
- **Then** the note is stored and linked to me

**E2. As an Agent, I can see notes I wrote for a client**
- **When** I `GET /crm/clients/:clientId/notes`
- **Then** I only see my notes (not other agents’ notes)

**E3. As an Admin, I can see all notes for a client**
- **When** I request the same endpoint
- **Then** I see all notes regardless of agent

---

### Epic F: Admin dashboard KPIs
**F1. As an Admin, I can view KPI summaries**
- **When** I `GET /dashboard/kpis`
- **Then** I see totals and top agents by approved bookings (initial MVP set)

