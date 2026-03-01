# The "Gold Standard" Full-Stack Web Development Checklist

This checklist is derived from the successful architecture, security practices, and UI/UX design developed for the Babcock Digital Clearance System. Use this guide to ensure new projects reach the same level of quality, efficiency, and beauty.

---

## 🔒 1. Security & Authentication
*   [ ] **Secure Authentication Strategy:** Implement robust JWT (JSON Web Tokens) or Laravel Sanctum/Passport for API authentication.
*   [ ] **Role-Based Access Control (RBAC):** Clearly define user roles (e.g., Admin, Officer, User) and enforce authorization at both the API route level (middleware) and frontend route level.
*   [ ] **Input Validation & Sanitization:** Strictly validate all incoming requests on the backend. Never trust client-side validation alone.
*   [ ] **Rate Limiting:** Protect critical endpoints (like login, OTP verification, and submissions) from brute-force attacks.
*   [ ] **Data Privacy:** Ensure sensitive data (like passwords) are hashed (Bcrypt/Argon2). Hide sensitive fields from API responses unless explicitly requested by an authorized role.
*   [ ] **Secure File Uploads:** Validate file types (MIME types), restrict file sizes, store files outside the public directory if sensitive, and use secure URLs for access.

## 🎨 2. UI / UX & "Premium" Aesthetics
*   [ ] **Modern Design System:** Adopt a cohesive design language (e.g., "Liquid Glass", "Neumorphism", or clean "Material Design"). 
*   [ ] **Curated Color Palette:** Move away from generic colors. Use tailored color tokens (e.g., Slate/Gold, Midnight/Cyan). Define Semantic colors (Success, Danger, Warning, Info).
*   [ ] **Micro-Interactions & Animations:** Use subtle CSS transitions for hover states, button clicks, and modal openings. Use keyframe animations for loading states (skeletons, spinners).
*   [ ] **Dynamic Element Tracking:** Implement subtle cursor-tracking glow effects or animated backgrounds (using canvas or CSS mesh gradients) to make the UI feel "alive".
*   [ ] **Responsive Design (Mobile-First):** Ensure the application works flawlessly on mobile devices. Use responsive tables (horizontal scroll or card views) and collapsible navigation.
*   [ ] **Clear Typography:** Use premium fonts (e.g., Inter, Plus Jakarta Sans, Outfit). Establish a clear typographic hierarchy for headings, body text, and muted labels.
*   [ ] **Empty States & Error Handling:** Design beautiful empty states (e.g., "All Caught Up!") instead of blank screens. Provide clear, actionable error toasts/messages instead of generic alerts.

## ⚙️ 3. Architecture & Efficiency
*   [ ] **Separation of Concerns:** Keep the frontend (React/Vue) and backend (Laravel/Node) completely separated. Communicate exclusively via RESTful APIs or GraphQL.
*   [ ] **Centralized API Service:** On the frontend, use an Axios instance or Fetch wrapper with interceptors to automatically handle Auth tokens and global errors (e.g., 401 Unauthorized redirects).
*   [ ] **Component Reusability:** Break down the UI into logical, reusable components (e.g., `QueueTable`, `ThemeToggle`, `GlassCard`). Avoid massive, monolithic files.
*   [ ] **State Management:** Use context or tools like Redux/Zustand only when necessary. Keep local state local.
*   [ ] **Optimized Queries:** On the backend, prevent N+1 queries by using eager loading (e.g., Laravel's `with()`). 
*   [ ] **Background Processing:** Offload heavy tasks (like sending emails or generating PDFs) to queues/jobs to keep the API response snappy.

## 🗄️ 4. Database & Data Integrity
*   [ ] **Normalized Schema:** Design the database schema thoughtfully to avoid data duplication while maintaining query performance.
*   [ ] **Soft Deletes:** Where appropriate, use soft deletes instead of hard deletes to maintain historical records and prevent accidental data loss.
*   [ ] **Comprehensive Seeders:** Create robust database seeders for all user roles, dummy data, and system configurations. This is crucial for QA and onboarding new developers.
*   [ ] **Audit Trails:** Implement activity logging to track *who* did *what* and *when*. This is essential for administrative oversight (e.g., tracking who approved/rejected a clearance).

## 🔄 5. Workflow & QA
*   [ ] **Structured Planning (`task.md`):** Always start with a detailed checklist broken down into granular tasks (Frontend, Backend, Database).
*   [ ] **Incremental Development:** Build and test feature by feature rather than trying to write the entire application at once.
*   [ ] **Comprehensive QA Phase:** Dedicate specific time for a "Full System QA" audit. Test every role's flow start-to-finish.
*   [ ] **Edge Case Testing:** Test what happens when inputs are blank, files are too large, or tokens expire mid-session.
*   [ ] **Documentation (`walkthrough.md`):** Maintain a living document of the system architecture, features, and recent changes/fixes.

---

# 🤖 The "Gold Standard" AI Prompt Template

When starting a new project or significant modular feature, use the following prompt structure to ensure the AI assistant aligns with the high standards of the Babcock Clearance System.

### Copy and Paste the Prompt Below:

```markdown
I am starting a new full-stack project (or building a new feature suite). I want this to align with the "Gold Standard" of web development we established previously (premium UI, robust security, organized architecture).

**Project/Feature Name:** [Insert Name, e.g., University Inventory Management System]
**Core Objective:** [Briefly describe what the system does]
**Tech Stack:** [e.g., Laravel backend, React frontend, Tailwind/Custom CSS]

Please follow this strict workflow to execute this request:

### 1. Requirements & Architecture (PLANNING MODE)
*   Analyze my core objective.
*   Define the necessary database schema (tables, relationships).
*   Outline the required API endpoints.
*   Define the frontend component structure and routing.
*   Create an `implementation_plan.md` outlining the exact files that will need to be created or modified. 
*   **PAUSE AND ASK FOR REVIEW** before writing code.

### 2. Backend & Data (EXECUTION MODE)
*   Once approved, create the migrations, models, and controllers.
*   Implement strict validation, error handling, and Role-Based Access Control (RBAC) where applicable.
*   Create comprehensive seeders to populate the database with test data for all roles.

### 3. Frontend logic & State (EXECUTION MODE)
*   Build the frontend components.
*   Ensure API calls are centralized and handle loading/error states gracefully.
*   Ensure the application handles authentication state and route protection properly.

### 4. "Premium" UI/UX Implementation (EXECUTION MODE)
*   Do not use generic, basic styling. I want a premium, modern aesthetic (e.g., "Glassmorphism", high-contrast Dark Mode, refined typography).
*   Add micro-interactions (hover states, smooth transitions) and consider adding one "Wow Factor" dynamic element (e.g., a subtle cursor-tracking glow or animated mesh background).
*   Ensure the layout is entirely responsive (mobile-first approach).
*   Ensure empty states (like tables with no data) are beautifully designed, not just blank.

### 5. Full System QA (VERIFICATION MODE)
*   Once development is complete, create a comprehensive QA checklist in `task.md`.
*   Run the application, seed the database, and verify every user role flow from start to finish.
*   Verify edge cases (invalid logins, empty form submissions).
*   Document the final result in a `walkthrough.md`.
```
