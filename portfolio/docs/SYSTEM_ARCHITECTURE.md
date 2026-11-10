# Dynamic Portfolio & Admin Dashboard — System Architecture Specification

## 1. Architectural Vision & Core Principles

The architecture is engineered around four core tenets:
1. **Decoupled Client-Server Boundaries**: A headless backend API serves both the public-facing portfolio and the administrative dashboard, enabling independent scaling and seamless UI iteration.
2. **Zero-Trust Administrative Security**: The `/admin` routes and corresponding `/api/v1/admin/*` endpoints enforce strict authentication, role validation, session expiration, and rate-limiting.
3. **Dynamic Revalidation with Optimistic Updates**: Content edits made in the admin portal propagate instantaneously to the public interface using TanStack Query cache invalidation and database-driven data fetching.
4. **End-to-End Type Safety**: Shared TypeScript interfaces and Zod validation schemas guarantee that contract changes immediately flag compiler errors across both client and server.

---

## 2. System Context & Container Architecture (C4 Model)

### Level 1: System Context Diagram
```
+-----------------------------------------------------------------------------------+
|                                  PUBLIC USERS                                     |
|               (Recruiters, Engineering Managers, Freelance Clients)               |
+-----------------------------------------------------------------------------------+
                                         |
                                         | Browses portfolio, views projects,
                                         | downloads resume, submits contact enquiry
                                         v
+-----------------------------------------------------------------------------------+
|                         DYNAMIC PORTFOLIO WEB PLATFORM                            |
|                                                                                   |
|  +-----------------------------+        +--------------------------------------+  |
|  |     Public SPA Client       |        |       Admin Dashboard Client         |  |
|  |  (React, Tailwind, Motion)  |        |    (React, Zod, React-Hook-Form)     |  |
|  +-----------------------------+        +--------------------------------------+  |
+-----------------------------------------------------------------------------------+
                                         ^
                                         | Authenticates & manages content
                                         | (Projects, Resume, Skills, Enquiries)
+-----------------------------------------------------------------------------------+
|                                 ADMINISTRATOR                                     |
|                               (Portfolio Owner)                                   |
+-----------------------------------------------------------------------------------+
```

### Level 2: Container Diagram & Data Flow
```
                                 [ Web Browser ]
                                        |
               +------------------------+------------------------+
               | HTTPS (Vercel CDN)                              | HTTPS (Vercel CDN)
               v                                                 v
   [ Client: Public Portfolio ]                      [ Client: /admin Dashboard ]
   - React 18 + Vite                                 - Protected React Routes
   - Framer Motion animations                        - TanStack Query (Admin mutations)
   - TanStack Query (Public cached data)             - React Hook Form + Zod
               |                                                 |
               | REST API Calls (JSON)                           | REST API Calls (Bearer JWT / Cookie)
               +------------------------+------------------------+
                                        |
                                        v
                          [ Backend API Gateway / Express ]
                          - Node.js + Express + TypeScript
                          - Security: Helmet, CORS, Rate Limiter
                          - Auth: JWT Verifier, Cookie Parser
                          - Validation: Zod Request Middleware
                                        |
        +-------------------------------+-------------------------------+
        |                               |                               |
        v                               v                               v
[ PostgreSQL Database ]       [ Cloud Object Storage ]       [ Email Delivery Service ]
- Managed by Prisma ORM       - Cloudinary / Supabase        - Resend / Nodemailer
- Relational data models      - Resume PDF documents         - Instant email alerts on
- ACID compliance             - Optimized project images     - contact form submission
```

---

## 3. Frontend Architecture (Client Application)

### 3.1 Framework & Core Modules
* **Runtime**: React 18+ bundled with Vite for near-instant Hot Module Replacement (HMR).
* **Routing Topology (`react-router-dom` v6)**:
  * Public Route Tree:
    * `/` -> `PublicLayout` -> `HomePage` (Hero, About, Projects, Skills, Experience, Contact)
    * `/projects/:slug` -> `ProjectDetailPage`
    * `*` -> `NotFoundPage`
  * Admin Route Tree (Protected):
    * `/admin/login` -> `AdminLoginPage`
    * `/admin` -> `AdminLayout` (Guarded by `ProtectedRoute`)
      * `/admin/overview` -> Metrics, recent enquiries, system status
      * `/admin/profile` -> Bio, headline, location, Resume PDF uploader
      * `/admin/projects` -> Project CRUD, reorder, publish/unpublish
      * `/admin/skills` -> Category-based skill management
      * `/admin/experience` -> Timeline & employment history
      * `/admin/education` -> Degrees & certifications
      * `/admin/enquiries` -> Inbox of received contact messages

### 3.2 State Management & Network Layer
* **Server State**: Managed via `@tanstack/react-query`:
  * Public queries configured with `staleTime: 1000 * 60 * 5` (5 minutes) and automatic background refetching on window focus.
  * Admin mutations trigger targeted cache invalidation:
    ```typescript
    // Invalidate public and admin caches upon project update
    queryClient.invalidateQueries({ queryKey: ['projects'] });
    queryClient.invalidateQueries({ queryKey: ['admin', 'projects'] });
    ```
* **Client/UI State**: Minimal React Context (`AuthContext` for admin token/session state, `ToastContext` for notifications).
* **API Client**: Axios instance configured with `withCredentials: true`, interceptors for transparent JWT refresh, and unified error handling.

### 3.3 Design System & Theme Engine
* **Color Hierarchy**:
  * Background Surface: `#0A0D0B`
  * Elevated Card Surfaces: `#121614`
  * Structural Borders: `#222924`
  * Interactive Accent: Vibrant Emerald `#00E599` / `#10B981`
  * Secondary Accent: Cyan-Green glow `#14B8A6`
  * Muted Foreground: `#929D96`
  * High-Contrast Heading: `#F3F4F6`
* **Typography**: Clean grotesque sans-serif (Inter or Geist Sans) loaded via variable font.
* **Framer Motion Primitives**: Reusable variants (`fadeUp`, `staggerContainer`, `glowHover`, `scaleIn`) maintaining consistent physics-based micro-interactions.

---

## 4. Backend Architecture (Express REST API)

### 4.1 Layered Architecture Pattern
```
[ Incoming Request ]
        |
        v
[ Middlewares: Security, Logging, CORS, RateLimit ]
        |
        v
[ Authentication & Role Guard (Admin Routes Only) ]
        |
        v
[ Zod Request Validation Middleware ]
        |
        v
[ Controller Layer ] (Extracts params, validates DTOs, formats HTTP response)
        |
        v
[ Service Layer ] (Business logic, orchestration, external integrations)
        |
        v
[ Data Access Layer / Prisma ORM ] (Type-safe SQL queries against PostgreSQL)
        |
        v
[ Outgoing Response / Standardized JSON Envelope ]
```

### 4.2 Error Handling & Standard Response Contract
All endpoints return a predictable JSON envelope:

```typescript
// Standard Success Response
interface ApiResponse<T> {
  success: true;
  data: T;
  message?: string;
}

// Standard Error Response
interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Array<{ field: string; message: string }>;
  };
}
```

---

## 5. Authentication & Authorization Subsystem

### 5.1 Token Strategy
* **Access Token**: JSON Web Token (JWT) signed with HMAC-SHA256 (`JWT_ACCESS_SECRET`). Lifespan: **15 minutes**. Contains payload `{ sub: adminId, role: 'ADMIN', email: string }`.
* **Refresh Token**: Cryptographically secure random 64-byte hex string (or long-lived JWT). Lifespan: **7 days**. Stored in PostgreSQL with revoked/active status and delivered via:
  * `httpOnly: true` (prevents XSS exfiltration)
  * `secure: true` (transmitted strictly over HTTPS in production)
  * `sameSite: 'strict'` (mitigates CSRF attacks)
  * `path: '/api/v1/auth'`

### 5.2 Authentication Flow Sequence
```
Client (/admin/login)               Express API                         PostgreSQL
      |                                  |                                  |
      | 1. POST /auth/login {email, pwd} |                                  |
      |--------------------------------->|                                  |
      |                                  | 2. Fetch Admin by Email          |
      |                                  |--------------------------------->|
      |                                  | 3. Return Admin record + hash    |
      |                                  |<---------------------------------|
      |                                  | 4. bcrypt.compare(pwd, hash)     |
      |                                  | 5. Generate Access & Refresh     |
      |                                  | 6. Persist Refresh Token Hash    |
      |                                  |--------------------------------->|
      | 7. Set-Cookie: refreshToken      |                                  |
      |    Body: { accessToken, admin }  |                                  |
      |<---------------------------------|                                  |
```

---

## 6. Cloud Storage & Asset Lifecycle Architecture

### 6.1 Resume PDF Replacement Strategy
The resume PDF must always be current, instantly downloadable by recruiters, and safe from stale CDN caching.

1. **Upload Execution**: Admin uploads PDF via `/api/v1/admin/profile/resume` (multipart/form-data).
2. **Buffer Inspection**: Multer validates magic bytes for `%PDF-1.` and size <= 10MB.
3. **Cloud Dispatch**: Cloudinary/Supabase receives buffer under public ID `portfolio/resumes/developer_resume`.
4. **Pruning Previous Asset**: If a previous asset exists with a distinct public ID, the backend issues an asynchronous deletion command to avoid storage leaks.
5. **Database Transaction**: Updates `Profile.resumeUrl` (with cache-busting timestamp param) and `Profile.resumeUpdatedAt`.
6. **Public Serving**: Public endpoint `GET /api/v1/public/resume/download` redirects with `Content-Disposition: attachment; filename="Resume_IT_Graduate.pdf"`.

### 6.2 Project Media Optimization
* Images uploaded via admin are converted to modern WebP format with automated thumbnail generation (`w=800,q=80` for previews; full-res for detail modals).

---

## 7. Security Architecture & Threat Mitigation Matrix

| Threat Category | Potential Attack Vector | Applied Architectural Countermeasure |
| :--- | :--- | :--- |
| **Authentication** | Credential brute-forcing on `/admin/login` | IP-based rate limiting (5 attempts / 15 mins), exponential backoff, bcrypt (salt rounds: 12). |
| **Session Hijacking** | XSS stealing authentication tokens | Refresh tokens stored exclusively in `httpOnly` cookies; Access tokens kept in memory. |
| **CSRF** | Forged cross-site requests to mutate data | `SameSite=Strict` cookies, custom `X-Requested-With` headers, CORS origin verification. |
| **Injection** | SQL injection via user inputs | Prisma ORM parameterizes all SQL queries natively; Zod strips unexpected payload fields. |
| **Cross-Site Scripting (XSS)** | Malicious HTML stored in project descriptions | Backend sanitization via `DOMPurify` / `sanitize-html`; React auto-escapes rendered JSX. |
| **Denial of Service** | Flooding public contact endpoint | Tiered rate-limiting: 60 req/min for general API, 3 submissions/hr for contact endpoint. |
| **Unrestricted File Upload** | Malicious executable masked as PDF | Magic byte verification, MIME-type whitelisting, upload executed to isolated object storage. |

---

## 8. Scalability & Non-Functional Specifications

* **Read Performance**: Public endpoints achieve < 50ms TTFB via database index optimization and CDN caching headers (`Cache-Control: public, max-age=60, s-maxage=300`).
* **Availability**: Stateless Express backend allows seamless horizontal scaling across multiple container instances behind a reverse proxy.
* **Database Connection Pooling**: Prisma configured with PgBouncer connection pooling to avoid PostgreSQL socket exhaustion during traffic spikes.