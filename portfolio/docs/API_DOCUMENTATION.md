# Dynamic Portfolio & Admin Dashboard — RESTful API Specification

## 1. Architectural Conventions & Protocol Standards

* **Base URL**: `/api/v1`
* **Transport**: HTTPS strictly enforced in production.
* **Payload Format**: JSON (`application/json`) for standard requests; `multipart/form-data` for file uploads.
* **Authentication**: Bearer Token in `Authorization: Bearer <accessToken>` header for protected administrative endpoints. Refresh tokens are exchanged via secure `httpOnly` cookies.

### Standard Response Envelopes
All responses conform to a unified contract:

#### Success (200 OK / 201 Created)
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

#### Error (4xx Client Error / 5xx Server Error)
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": [
      {
        "field": "email",
        "message": "Invalid email address format"
      }
    ]
  }
}
```

---

## 2. API Endpoint Directory

### 2.1 Authentication Subsystem (`/api/v1/auth`)

| Method | Endpoint | Access | Description | Rate Limit |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/auth/login` | Public | Authenticates admin, returns access token, sets refresh cookie | 5 req / 15m |
| `POST` | `/auth/refresh` | Public (Cookie) | Rotates refresh token, returns new short-lived access token | 30 req / 15m |
| `POST` | `/auth/logout` | Protected | Revokes refresh token, clears cookie | Standard |
| `GET` | `/auth/me` | Protected | Returns authenticated administrator profile and role | Standard |

---

### 2.2 Public Portfolio Endpoints (`/api/v1/public`)

| Method | Endpoint | Access | Description | Caching Header |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/public/profile` | Public | Returns public profile, hero copy, avatar URL, resume metadata | `s-maxage=300` |
| `GET` | `/public/projects` | Public | Returns published projects ordered by `displayOrder` | `s-maxage=120` |
| `GET` | `/public/projects/:slug` | Public | Returns detailed single project with full case study | `s-maxage=300` |
| `GET` | `/public/skills` | Public | Returns all visible skills grouped by category | `s-maxage=600` |
| `GET` | `/public/experience` | Public | Returns professional experience timeline | `s-maxage=600` |
| `GET` | `/public/education` | Public | Returns academic degrees and certifications | `s-maxage=600` |
| `GET` | `/public/social-links` | Public | Returns active social channels and links | `s-maxage=600` |
| `GET` | `/public/resume/download`| Public | Securely streams or redirects to the latest active resume PDF | `no-cache` |
| `POST` | `/public/contact` | Public | Validates & logs new contact enquiry; sends email notification | 3 req / hr / IP |

---

### 2.3 Administrative Management Endpoints (`/api/v1/admin`)
*All endpoints below require a valid `Authorization: Bearer <token>` header.*

| Category | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Profile** | `PUT` | `/admin/profile` | Updates biography, headline, status badge, hero copy |
| | `POST` | `/admin/profile/resume` | Uploads & replaces resume PDF (multipart/form-data) |
| | `POST` | `/admin/profile/avatar` | Uploads profile headshot/avatar |
| **Projects** | `GET` | `/admin/projects` | Lists all projects (including unpublished drafts) |
| | `POST` | `/admin/projects` | Creates a new project with image upload |
| | `GET` | `/admin/projects/:id` | Fetches single project for editing |
| | `PUT` | `/admin/projects/:id` | Updates project details and images |
| | `PATCH`| `/admin/projects/:id/publish` | Toggles publication status (`isPublished`) |
| | `PATCH`| `/admin/projects/reorder` | Bulk updates `displayOrder` array |
| | `DELETE`| `/admin/projects/:id` | Deletes project and associated cloud assets |
| **Skills** | `GET` | `/admin/skills` | Lists all skills with visibility flags |
| | `POST` | `/admin/skills` | Adds a new skill |
| | `PUT` | `/admin/skills/:id` | Updates skill category, proficiency, or icon |
| | `PATCH`| `/admin/skills/reorder` | Bulk updates skill display order |
| | `DELETE`| `/admin/skills/:id` | Deletes a skill |
| **Experience** | `GET` | `/admin/experience` | Lists all career entries |
| | `POST` | `/admin/experience` | Creates new employment/project role entry |
| | `PUT` | `/admin/experience/:id` | Updates experience details |
| | `DELETE`| `/admin/experience/:id`| Removes experience record |
| **Education** | `GET` | `/admin/education` | Lists all educational qualifications |
| | `POST` | `/admin/education` | Adds degree or certification |
| | `PUT` | `/admin/education/:id` | Updates education record |
| | `DELETE`| `/admin/education/:id` | Deletes education record |
| **Socials** | `GET` | `/admin/social-links` | Lists all social media links |
| | `POST` | `/admin/social-links` | Adds new social profile link |
| | `PUT` | `/admin/social-links/:id` | Updates URL or visibility |
| | `DELETE`| `/admin/social-links/:id` | Deletes social link |
| **Enquiries**| `GET` | `/admin/enquiries` | Lists incoming messages with pagination & filter |
| | `PATCH`| `/admin/enquiries/:id/status` | Updates status (`READ`, `REPLIED`, `ARCHIVED`) |
| | `DELETE`| `/admin/enquiries/:id` | Deletes spam/archived enquiry |

---

## 3. Detailed Request/Response Payloads & Zod Schemas

### 3.1 Authentication

#### `POST /api/v1/auth/login`
```typescript
// Zod Schema
export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters")
});
```

**Request Example:**
```json
{
  "email": "admin@portfolio.local",
  "password": "AdminSecurePassword123!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "admin": {
      "id": "e4b6c31a-6d43-4b68-9bf2-7935df6f7842",
      "email": "admin@portfolio.local",
      "name": "Portfolio Admin",
      "role": "SUPER_ADMIN"
    }
  },
  "message": "Login successful"
}
```
*(Also sets `Set-Cookie: refreshToken=...; HttpOnly; Secure; SameSite=Strict; Path=/api/v1/auth`)*

---

### 3.2 Dynamic Resume Management

#### `POST /api/v1/admin/profile/resume`
* **Content-Type**: `multipart/form-data`
* **Form Field**: `resume` (PDF file, max 10MB)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "resumeUrl": "https://res.cloudinary.com/cloudname/image/upload/v1730592000/portfolio/resumes/developer_resume.pdf",
    "resumePublicId": "portfolio/resumes/developer_resume",
    "resumeUpdatedAt": "2026-11-03T01:30:00.000Z"
  },
  "message": "Resume successfully uploaded and updated"
}
```

#### `GET /api/v1/public/resume/download`
* **Response**: `302 Found` redirecting to signed storage URL with `Content-Disposition: attachment; filename="Developer_Resume.pdf"` or direct stream.

---

### 3.3 Project Management

#### `POST /api/v1/admin/projects`
```typescript
// Zod Schema
export const createProjectSchema = z.object({
  title: z.string().min(3).max(120),
  slug: z.string().regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with dashes"),
  summary: z.string().min(10).max(300),
  description: z.string().min(20),
  coverImageUrl: z.string().url(),
  coverImagePublicId: z.string(),
  demoUrl: z.string().url().optional().or(z.literal("")),
  githubUrl: z.string().url().optional().or(z.literal("")),
  technologies: z.array(z.string()).min(1),
  featured: z.boolean().default(false),
  isPublished: z.boolean().default(true),
  displayOrder: z.number().int().default(0)
});
```

**Request Example:**
```json
{
  "title": "Autonomous Inventory Dispatch Engine",
  "slug": "autonomous-inventory-dispatch",
  "summary": "Full-stack real-time logistics dashboard reducing warehouse dispatch delays by 40%.",
  "description": "# Overview\nBuilt with React, Express, and PostgreSQL...",
  "coverImageUrl": "https://res.cloudinary.com/demo/image/upload/sample.jpg",
  "coverImagePublicId": "portfolio/projects/inventory-cover",
  "demoUrl": "https://inventory-demo.vercel.app",
  "githubUrl": "https://github.com/developer/inventory-engine",
  "technologies": ["React", "TypeScript", "Node.js", "PostgreSQL", "Tailwind CSS"],
  "featured": true,
  "isPublished": true,
  "displayOrder": 1
}
```

---

### 3.4 Public Contact Enquiry Submission

#### `POST /api/v1/public/contact`
```typescript
// Zod Schema
export const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(80),
  email: z.string().email("Invalid email address"),
  subject: z.string().max(150).optional(),
  message: z.string().min(10, "Message must be at least 10 characters").max(3000),
  honeypot: z.string().max(0, "Bot detected").optional() // Spam prevention
});
```

**Request Example:**
```json
{
  "name": "Sarah Jenkins",
  "email": "sarah.j@techrecruits.com",
  "subject": "Full-Stack Opportunity in Chennai / Remote",
  "message": "Hi, I reviewed your portfolio and would love to discuss an IT opportunity with our engineering team."
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "7f8b9c2a-3e12-4d56-8a90-123456789abc",
    "receivedAt": "2026-11-03T01:35:00.000Z"
  },
  "message": "Thank you! Your message has been sent successfully."
}
```