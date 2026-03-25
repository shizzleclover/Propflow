## Backend architecture (Node + Express) — modular, feature-first

### Goals
- Keep code organized by **product capability** (feature/module), not by technical layer.
- Make it easy to add features without creating “god” folders.
- Enforce **RBAC** and validation consistently.

---

## Directory structure

```text
backend/
  src/
    app.js
    server.js
    config/
      env.js
    lib/
      db.js
      errors.js
      roles.js
      validate.js
    middleware/
      auth.js
      rbac.js
      errorHandler.js
      notFound.js
    modules/
      auth/
        routes.js
        service.js
        validation.js
      users/
        model.js
        routes.js
        service.js
        validation.js
      properties/
        model.js
        routes.js
        service.js
        validation.js
      bookings/
        model.js
        routes.js
        service.js
        validation.js
      crm/
        model.js
        routes.js
        service.js
        validation.js
      dashboard/
        routes.js
        service.js
  docs/
    PRD.md
    API.md
    DataModel.md
    Architecture.md
```

---

## Module pattern (recommended)
- **`model.js`**: Mongoose schema + indexes
- **`validation.js`**: Zod schemas for body/params/query
- **`service.js`**: domain logic (queries, rules, conflict checks)
- **`routes.js`**: HTTP wiring (RBAC, validation, request/response shapes)

This keeps controllers thin and business rules testable.

---

## Cross-cutting concerns
- **RBAC**: `middleware/auth.js` (JWT) + `middleware/rbac.js` (role guard)
- **Validation**: `lib/validate.js` runs Zod schemas at route boundaries
- **Errors**: `lib/errors.js` normalizes into stable `{ error: { code, message, details } }`

