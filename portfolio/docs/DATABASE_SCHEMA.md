# Dynamic Portfolio & Admin Dashboard — Database Schema Specification

## 1. Overview & Schema Design Strategy

The database layer is architected on **PostgreSQL** and managed using **Prisma ORM**. 

Key architectural characteristics:
* **Strict Referential Integrity**: Foreign keys with cascading rules protect relational trees (e.g. project screenshots).
* **Deterministic Display Ordering**: Items such as projects, skills, education, and experience include a `displayOrder` integer column to allow intuitive drag-and-drop prioritization in the admin panel.
* **Auditability & Traceability**: Critical operations log IP address, user-agent, and timestamps for administrative transparency.
* **Optimized Indexing**: Composite indexes support high-traffic public queries filtering by publication status and ordering.

---

## 2. Entity Relationship Diagram (ERD)

```
+-------------------+             +-----------------------+
|     AdminUser     |             |        Profile        |
+-------------------+             +-----------------------+
| id (PK, UUID)     |             | id (PK, UUID)         |
| email (Unique)    |             | fullName              |
| passwordHash      |             | headline              |
| name              |             | bio                   |
| role (Enum)       |             | location              |
| createdAt         |             | email                 |
| updatedAt         |             | phone                 |
+-------------------+             | statusBadge           |
          | 1                     | resumeUrl             |
          |                       | resumePublicId        |
          | tracks                | resumeUpdatedAt       |
          v *                     | avatarUrl             |
+-------------------+             | avatarPublicId        |
|     AuditLog      |             | heroHeading           |
+-------------------+             | heroSubheading        |
| id (PK, UUID)     |             | createdAt             |
| adminId (FK)      |             | updatedAt             |
| action            |             +-----------------------+
| entity            |
| entityId          |
| ipAddress         |
| createdAt         |
+-------------------+

+-------------------------+ 1       * +-------------------------+
|         Project         |-----------|      ProjectImage       |
+-------------------------+           +-------------------------+
| id (PK, UUID)           |           | id (PK, UUID)           |
| title                   |           | projectId (FK)          |
| slug (Unique)           |           | imageUrl                |
| summary                 |           | publicId                |
| description (Markdown)  |           | caption                 |
| coverImageUrl           |           | displayOrder            |
| coverImagePublicId      |           | createdAt               |
| demoUrl                 |           +-------------------------+
| githubUrl               |
| technologies (String[]) |
| featured (Boolean)      |
| isPublished (Boolean)   |
| displayOrder (Int)      |
| publishedAt             |
| createdAt               |
| updatedAt               |
+-------------------------+

+-------------------------+           +-------------------------+
|          Skill          |           |       Experience        |
+-------------------------+           +-------------------------+
| id (PK, UUID)           |           | id (PK, UUID)           |
| name                    |           | role                    |
| category (Enum)         |           | company                 |
| proficiency (Int: 1-100)|           | companyUrl              |
| iconName                |           | location                |
| isVisible (Boolean)     |           | employmentType          |
| displayOrder (Int)      |           | startDate               |
| createdAt               |           | endDate (Nullable)      |
| updatedAt               |           | isCurrent (Boolean)     |
+-------------------------+           | description             |
                                      | highlights (String[])   |
+-------------------------+           | displayOrder (Int)      |
|        Education        |           | createdAt               |
+-------------------------+           | updatedAt               |
| id (PK, UUID)           |           +-------------------------+
| degree                  |
| institution             |           +-------------------------+
| institutionUrl          |           |       SocialLink        |
| location                |           +-------------------------+
| startYear               |           | id (PK, UUID)           |
| endYear                 |           | platform                |
| grade                   |           | url                     |
| description             |           | icon                    |
| displayOrder (Int)      |           | isVisible (Boolean)     |
| createdAt               |           | displayOrder (Int)      |
| updatedAt               |           | createdAt               |
+-------------------------+           | updatedAt               |
                                      +-------------------------+
+-------------------------+
|     ContactEnquiry      |
+-------------------------+
| id (PK, UUID)           |
| name                    |
| email                   |
| subject                 |
| message                 |
| status (Enum)           |
| replyNotes              |
| ipAddress               |
| userAgent               |
| createdAt               |
| updatedAt               |
+-------------------------+
```

---

## 3. Production-Ready Prisma Schema (`schema.prisma`)

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

enum Role {
  SUPER_ADMIN
  ADMIN
}

enum SkillCategory {
  FRONTEND
  BACKEND
  DATABASE
  DEVOPS_TOOLS
  AI_INTEGRATION
  OTHER
}

enum EnquiryStatus {
  UNREAD
  READ
  REPLIED
  ARCHIVED
}

// ---------------------------------------------------------------------------
// 1. Authentication & Security
// ---------------------------------------------------------------------------

model AdminUser {
  id           String        @id @default(uuid())
  email        String        @unique
  passwordHash String
  name         String
  role         Role          @default(ADMIN)
  lastLoginAt  DateTime?
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
  
  auditLogs    AuditLog[]
  refreshTokens RefreshToken[]

  @@map("admin_users")
}

model RefreshToken {
  id          String     @id @default(uuid())
  tokenHash   String     @unique
  adminId     String
  admin       AdminUser  @relation(fields: [adminId], references: [id], onDelete: Cascade)
  isRevoked   Boolean    @default(false)
  expiresAt   DateTime
  createdAt   DateTime   @default(now())

  @@index([adminId])
  @@map("refresh_tokens")
}

model AuditLog {
  id        String     @id @default(uuid())
  adminId   String
  admin     AdminUser  @relation(fields: [adminId], references: [id], onDelete: Cascade)
  action    String     // e.g. "PROJECT_CREATE", "RESUME_UPDATE"
  entity    String     // e.g. "Project", "Profile"
  entityId  String?
  details   Json?
  ipAddress String?
  createdAt DateTime   @default(now())

  @@index([adminId])
  @@index([createdAt])
  @@map("audit_logs")
}

// ---------------------------------------------------------------------------
// 2. Profile & Brand Information
// ---------------------------------------------------------------------------

model Profile {
  id              String   @id @default(uuid())
  fullName        String
  headline        String   // e.g. "Information Technology Graduate & Full-Stack Developer"
  bio             String   @db.Text
  location        String   // "Chennai, India"
  email           String
  phone           String?
  statusBadge     String   // "Open to IT opportunities and freelance projects"
  
  // Hero section customizable assertions
  heroHeading     String   // "Building modern web applications and solving real-world problems"
  heroSubheading  String   @db.Text
  
  // Avatar & Media
  avatarUrl       String?
  avatarPublicId  String?
  
  // Dynamic Resume PDF Management
  resumeUrl       String?
  resumePublicId  String?
  resumeUpdatedAt DateTime?
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@map("profiles")
}

// ---------------------------------------------------------------------------
// 3. Projects & Showcase
// ---------------------------------------------------------------------------

model Project {
  id                 String         @id @default(uuid())
  title              String
  slug               String         @unique
  summary            String         @db.Text
  description        String         @db.Text // Full Markdown case study
  coverImageUrl      String
  coverImagePublicId String
  demoUrl            String?
  githubUrl          String?
  technologies       String[]       // Array of tech tags e.g. ["React", "Node.js", "PostgreSQL"]
  featured           Boolean        @default(false)
  isPublished        Boolean        @default(true)
  displayOrder       Int            @default(0)
  publishedAt        DateTime?      @default(now())
  createdAt          DateTime       @default(now())
  updatedAt          DateTime       @updatedAt

  images             ProjectImage[]

  @@index([isPublished, displayOrder])
  @@index([featured, isPublished])
  @@map("projects")
}

model ProjectImage {
  id           String   @id @default(uuid())
  projectId    String
  project      Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  imageUrl     String
  publicId     String
  caption      String?
  displayOrder Int      @default(0)
  createdAt    DateTime @default(now())

  @@index([projectId, displayOrder])
  @@map("project_images")
}

// ---------------------------------------------------------------------------
// 4. Skills & Competencies
// ---------------------------------------------------------------------------

model Skill {
  id           String        @id @default(uuid())
  name         String
  category     SkillCategory
  proficiency  Int           @default(80) // 1 to 100 percentage
  iconName     String?       // Lucide icon identifier e.g. "Code", "Database", "Cpu"
  isVisible    Boolean       @default(true)
  displayOrder Int           @default(0)
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt

  @@index([category, isVisible, displayOrder])
  @@map("skills")
}

// ---------------------------------------------------------------------------
// 5. Experience & Employment History
// ---------------------------------------------------------------------------

model Experience {
  id             String    @id @default(uuid())
  role           String
  company        String
  companyUrl     String?
  location       String?
  employmentType String?   // "Full-time", "Internship", "Freelance"
  startDate      DateTime
  endDate        DateTime? // Null indicates current position
  isCurrent      Boolean   @default(false)
  description    String    @db.Text
  highlights     String[]  // Bullet achievements
  displayOrder   Int       @default(0)
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  @@index([displayOrder])
  @@map("experiences")
}

// ---------------------------------------------------------------------------
// 6. Education & Academic Background
// ---------------------------------------------------------------------------

model Education {
  id             String   @id @default(uuid())
  degree         String   // e.g. "B.Tech in Information Technology"
  institution    String
  institutionUrl String?
  location       String?  // "Chennai, India"
  startYear      Int
  endYear        Int?
  grade          String?  // CGPA / Percentage
  description    String?  @db.Text
  displayOrder   Int      @default(0)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  @@index([displayOrder])
  @@map("educations")
}

// ---------------------------------------------------------------------------
// 7. Social Channels & External Presence
// ---------------------------------------------------------------------------

model SocialLink {
  id           String   @id @default(uuid())
  platform     String   // "GitHub", "LinkedIn", "Twitter", "LeetCode"
  url          String
  icon         String   // Lucide icon name
  isVisible    Boolean  @default(true)
  displayOrder Int      @default(0)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@index([isVisible, displayOrder])
  @@map("social_links")
}

// ---------------------------------------------------------------------------
// 8. Contact Enquiries (Inbox)
// ---------------------------------------------------------------------------

model ContactEnquiry {
  id         String        @id @default(uuid())
  name       String
  email      String
  subject    String?
  message    String        @db.Text
  status     EnquiryStatus @default(UNREAD)
  replyNotes String?       @db.Text
  ipAddress  String?
  userAgent  String?
  createdAt  DateTime      @default(now())
  updatedAt  DateTime      @updatedAt

  @@index([status, createdAt])
  @@map("contact_enquiries")
}
```

---

## 4. Database Seed Strategy (`prisma/seed.ts`)

The seed script initializes the database in a consistent, working state with real content matching the user's requirements:
* **Admin Account**: Email `admin@portfolio.local`, password `AdminSecurePass2026!` (bcrypt hashed).
* **Profile**: 
  * Full Name: IT Graduate
  * Location: "Chennai, India"
  * Status Badge: "Chennai, India · Open to IT opportunities and freelance projects"
  * Bio: "I'm an Information Technology graduate passionate about building modern web applications and solving real-world problems through technology. My experience includes frontend development, full-stack projects, database integration and AI-assisted development. I enjoy turning ideas into practical digital products, continuously learning new technologies and improving my development skills."
* **Skills**: Grouped into Frontend (React, TypeScript, Tailwind, Next.js), Backend (Node.js, Express, REST APIs), Database (PostgreSQL, Prisma, MongoDB), AI/Tools (OpenAI API, Git, Docker, Vite).
* **Sample Projects**: 2 published full-stack projects showcasing real-world problem solving.
* **Social Links**: GitHub, LinkedIn, Email.