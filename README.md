<img src="https://github.com/user-attachments/assets/d47cd6ed-e489-4f32-8246-771842cfc243" alt="mockicon" width="50" height="50">

# Mock Orbit - A Peer Interviewing Application

Mock Orbit is an end-to-end peer interviewing platform designed to simulate real-world interview scenarios through an interactive and scalable interface. It combines a modern Next.js frontend with Tailwind CSS (using CDN integration) with a robust Golang backend, leveraging MongoDB for data storage and authentication. With support for real-time interviews, scheduling, and collaboration, Mock Orbit is built for performance and real-world usability.

---

## Table of Contents

- [Mock Orbit - A Peer Interviewing Application](#mock-orbit---a-peer-interviewing-application)
  - [Table of Contents](#table-of-contents)
  - [Overview](#overview)
  - [Features](#features)
  - [User Flow Diagram](#user-flow-diagram)
  - [Tech Stack](#tech-stack)
    - [Frontend](#frontend)
    - [Backend](#backend)
  - [Architecture](#architecture)
  - [Directory Structure](#directory-structure)
  - [UML Diagram](#uml-diagram)
  - [Installation and Local Setup](#installation-and-local-setup)
    - [Prerequisites](#prerequisites)
    - [Frontend Setup (Next.js)](#frontend-setup-nextjs)
    - [Backend Setup (Golang + Gin)](#backend-setup-golang--gin)
    - [MongoDB Setup](#mongodb-setup)
  - [API Endpoints](#api-endpoints)
  - [Sample Credentials](#sample-credentials)
  - [Deployment \& CI/CD](#deployment--cicd)
  - [Testing \& Quality Assurance](#testing--quality-assurance)
  - [License](#license)

---

## Overview

Mock Orbit is built to facilitate immersive and realistic peer interviews. Featuring dual dashboards to cater to both interviewers and interviewees, the platform streamlines interview scheduling, real-time communication, and performance tracking, all while maintaining a secure and scalable architecture.

Key functionalities include:
- **Real-time Interview Rooms:** Integrated video/audio communication, a collaborative whiteboard, chat, and code editor.
- **User Management:** Seamless profile creation and management.
- **Scheduling:** Intuitive calendar-based scheduling with notifications.
- **Robust Authentication:** Secure user registration, login, and authorization using JWT.

---

## Features

- **Dual Dashboards:**  
  - **Interviewer Dashboard:** View scheduled interviews, performance stats, and provide feedback.  
  - **Interviewee Dashboard:** Access upcoming interviews, preparation materials, and interview history.
- **Real-time Interview Environment:**  
  - **Video & Audio Communication:** Powered by WebRTC.
  - **Collaborative Whiteboard:** Real-time drawing and annotations using the Canvas API.
  - **Chat System:** Instant messaging with WebSocket integration.
  - **Code Editor:** Integrated environment for collaborative coding.
- **Profile Management:** Update personal details, manage roles, and view interview logs.
- **Scheduling Interface:** Calendar-based interview scheduling with real-time notifications.
- **Secure API Integration:** Comprehensive RESTful endpoints powered by JWT for protected access.

---

## User Flow Diagram
![mock-orbit-flowchart](https://github.com/user-attachments/assets/195dc340-69a6-4812-8ff5-1ae9baf482dc)

---

## Tech Stack

### Frontend

- **Framework:** Next.js (Latest version) with TypeScript
- **Styling:** Tailwind CSS (integrated via CDN)
- **Routing:** Next.js App Router with server components
- **State Management:** React Context (or Redux as needed)
- **Data Fetching:** React Query
- **Form Handling:** react-hook-form with Zod validation

### Backend

- **Language & Framework:** Golang with Gin for RESTful API
- **Real-Time Communication:** WebSockets
- **Video Signaling:** pion/webrtc for WebRTC-based interactions
- **Authentication:** JWT with middleware for secure sessions
- **Database:** MongoDB for storage, pub/sub notifications, and presence tracking

---

## Architecture

The project is organized with feature-based modules that promote maintainability and scalability. The frontend follows atomic design principles, ensuring that UI components, hooks, and utilities are neatly modularized. The Golang backend embraces clean architecture by separating configuration, database logic, models, handlers, middleware, and routing.


![diagram-mockorbit](https://github.com/user-attachments/assets/06048c78-f21a-4c8f-bf99-00cfd99eff79)

---

## Directory Structure

```plaintext
MockOrbit/
├── README.md
├── components.json
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
├── tsconfig.json
├── .env.example
├── .modified
├── backend/
│   ├── go.mod
│   ├── go.sum
│   ├── cmd/
│   │   └── server/
│   │       ├── main.go
│   │       └── .env.example
│   └── internal/
│       ├── config/
│       │   └── config.go
│       ├── database/
│       │   └── mongo.go
│       ├── handlers/
│       │   ├── auth_handlers.go
│       │   ├── interview_handlers.go
│       │   ├── user_handlers.go
│       │   └── websocket_handler.go
│       ├── middleware/
│       │   └── auth.go
│       ├── models/
│       │   └── models.go
│       └── routes/
│           └── routes.go
├── docs/
│   └── blueprint.md
└── src/
    ├── ai/
    │   ├── ai-instance.ts
    │   └── dev.ts
    ├── app/
    │   ├── globals.css
    │   ├── layout.tsx
    │   ├── page.tsx
    │   ├── auth/
    │   │   ├── login/
    │   │   │   └── page.tsx
    │   │   └── register/
    │   │       └── page.tsx
    │   ├── dashboard/
    │   │   ├── interviewee/
    │   │   │   └── page.tsx
    │   │   └── interviewer/
    │   │       └── page.tsx
    │   ├── interview-room/
    │   │   └── [id]/
    │   │       └── page.tsx
    │   ├── profile/
    │   │   └── page.tsx
    │   ├── question-generator/
    │   │   └── page.tsx
    │   └── schedule/
    │       └── page.tsx
    ├── components/
    │   ├── shared/
    │   │   └── AppLayout.tsx
    │   └── ui/
    │       ├── accordion.tsx
    │       ├── alert-dialog.tsx
    │       ├── alert.tsx
    │       ├── avatar.tsx
    │       ├── badge.tsx
    │       ├── button.tsx
    │       ├── calendar.tsx
    │       ├── card.tsx
    │       ├── chart.tsx
    │       ├── checkbox.tsx
    │       ├── dialog.tsx
    │       ├── dropdown-menu.tsx
    │       ├── form.tsx
    │       ├── input.tsx
    │       ├── label.tsx
    │       ├── menubar.tsx
    │       ├── popover.tsx
    │       ├── progress.tsx
    │       ├── radio-group.tsx
    │       ├── scroll-area.tsx
    │       ├── select.tsx
    │       ├── separator.tsx
    │       ├── sheet.tsx
    │       ├── sidebar.tsx
    │       ├── skeleton.tsx
    │       ├── slider.tsx
    │       ├── switch.tsx
    │       ├── table.tsx
    │       ├── tabs.tsx
    │       ├── textarea.tsx
    │       ├── toast.tsx
    │       ├── toaster.tsx
    │       └── tooltip.tsx
    ├── hooks/
    │   ├── use-mobile.tsx
    │   └── use-toast.ts
    ├── lib/
    │   └── utils.ts
    └── providers/
        ├── AuthProvider.tsx
        └── ReactQueryProvider.tsx

```

## UML Diagram
![mock-orbit-uml](https://github.com/user-attachments/assets/e5733d24-f17f-4da0-a0b8-fc0ffe325b5c)

---

## Installation and Local Setup

### Prerequisites

* **Node.js & npm/yarn:** For the Next.js frontend.
* **Go:** Version 1.18+ for running the backend.
* **MongoDB:** A running MongoDB instance (local or via Docker).
* **Git:** For source control.

### Frontend Setup (Next.js)

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/adityaxanand/MockOrbit.git
   cd MockOrbit
   ```

2. **Install Dependencies:**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure Environment Variables:**

   ```bash
   cp .env.example .env
   ```

4. **Run the Development Server:**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

   Access the app at [http://localhost:3000](http://localhost:3000).

### Backend Setup (Golang + Gin)

1. **Navigate to the Backend Directory:**

   ```bash
   cd backend
   ```

2. **Install Go Modules:**

   ```bash
   go mod tidy
   ```

3. **Configure Environment Variables:**

   ```bash
   cp cmd/server/.env.example cmd/server/.env
   ```

   Adjust the MongoDB connection string, port, JWT secrets, and other parameters as needed.

4. **Run the Server:**

   ```bash
   go run cmd/server/main.go
   ```

   The server will start (typically on port **8080**). Test with:

   ```bash
   curl http://localhost:8080/ping
   ```

### MongoDB Setup

* **Local MongoDB:**
  Ensure your MongoDB server is running.

* **Docker Option:**

  ```bash
  docker run --name mockorbit-mongo -p 27017:27017 -d mongo:latest
  ```

---

## API Endpoints

The backend exposes several endpoints:

* **Ping:**

  * `GET /ping` – Returns a simple status message.

* **Authentication:**

  * `POST /api/v1/auth/register` – Register a new user.
  * `POST /api/v1/auth/login` – Login and receive a JWT.

* **User Management (Protected):**

  * `GET /api/v1/users/profile` – Retrieve current user’s profile.
  * `PATCH /api/v1/users/profile` – Update profile details.
  * `GET /api/v1/users/peers` – List peer users.
  * `GET /api/v1/users/:userId/interviews` – Get interviews for a specific user.
  * `GET /api/v1/users/:userId/stats` – (Interviewer only) Retrieve performance stats.

* **Interview Management (Protected):**

  * `POST /api/v1/interviews` – Schedule a new interview.
  * `GET /api/v1/interviews/:interviewId` – Get interview details.

* **Utility Endpoints (Protected):**

  * `GET /api/v1/topics` – Retrieve available topics.
  * `GET /api/v1/availability` – Get available interview slots.

* **Real-Time Communication:**

  * `GET /ws` – WebSocket endpoint for chat and collaboration.

Remember to include your JWT in the request headers when accessing protected routes.

---

## Sample Credentials

Use these credentials for testing:

* **Interviewer:**

  * **Email:** `interviewer@mockorbit.com`
  * **Password:** `interview123`

* **Interviewee:**

  * **Email:** `interviewee@mockorbit.com`
  * **Password:** `interview123`

*These are demo credentials; please update them in a production environment.*

---

## Deployment & CI/CD

* **Frontend:**
  Deployed on [Vercel](https://vercel.com/).

* **Backend:**
  Containerized using Docker and deployed on your chosen cloud provider.
  Use CI/CD pipelines (GitHub Actions, GitLab CI, etc.) for automated testing, building, and deployment.

---

## Testing & Quality Assurance

* **Frontend Testing:**
  Use Jest and React Testing Library for unit and integration tests.
* **Backend Testing:**
  Write unit tests for API endpoints and middleware.
* **Monitoring:**
  Implement logging, error tracking, and health checks to monitor application status.

---

## License

This project is licensed under the [MIT License](LICENSE).

---

Happy Interviewing!

```