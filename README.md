# 🚼 DevPulse – Internal Tech Issue & Feature Tracker

A collaborative backend platform for software teams to report bugs, suggest features, and coordinate resolutions — built with Node.js, TypeScript, Express.js, and PostgreSQL.

🔗 **Live URL:** [https://devpulse-api.vercel.app](https://devpulse-api-b7a2.vercel.app/) <br>
📦 **GitHub Repo:** [https://github.com/yourusername/devpulse](https://github.com/Topurayhan554/devpulse-api-b7a2.git)

---

## ✨ Features

- User registration & login with JWT-based authentication
- Role-based access control (`contributor` and `maintainer`)
- Create, view, update, and delete issues (bug reports & feature requests)
- Filter issues by type and status; sort by newest or oldest
- Secure password hashing with bcrypt
- Raw SQL queries — no ORMs, no query builders
- Modular architecture with reusable utilities

---

## 🛠️ Tech Stack

| Technology         | Purpose                           |
| ------------------ | --------------------------------- |
| Node.js (LTS 24.x) | Runtime environment               |
| TypeScript         | Type-safe development             |
| Express.js         | Web framework (modular router)    |
| PostgreSQL         | Relational database               |
| Raw SQL (`pg`)     | Native database driver            |
| bcrypt             | Password hashing                  |
| jsonwebtoken       | JWT generation & verification     |
| http-status-codes  | Consistent HTTP status references |

---

## 📁 Project Structure

```
devpulse/
├── src/
│   ├── config/
│   │   └── db.ts              # PostgreSQL pool configuration
│   ├── middleware/
│   │   ├── auth.ts            # JWT verification middleware
│   │   ├── index.d.ts
│   │   └── globalErrorHandler.ts    # Centralized error handler
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.routes.ts
│   │   │   ├── auth.interface.ts
│   │   │   ├── auth.service.ts
│   │   │   └── auth.controller.ts
│   │   └── issues/
│   │       ├── issues.routes.ts
│   │       ├── issues.service.ts
│   │       ├── issues.interface.ts
│   │       └── issues.controller.ts
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   ├── SendResponse.ts        # Standard response formatter
│   ├── app.ts
│   └── index.ts               # App entry point
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🗄️ Database Schema

### Table: `users`

```sql
CREATE TABLE users (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(255)        NOT NULL,
  email       VARCHAR(255) UNIQUE NOT NULL,
  password    VARCHAR(255)        NOT NULL,
  role        VARCHAR(20)         NOT NULL DEFAULT 'contributor'
                                  CHECK (role IN ('contributor', 'maintainer')),
  created_at  TIMESTAMP           DEFAULT NOW(),
  updated_at  TIMESTAMP           DEFAULT NOW()
);
```

### Table: `issues`

```sql
CREATE TABLE issues (
  id           SERIAL PRIMARY KEY,
  title        VARCHAR(150)  NOT NULL,
  description  TEXT          NOT NULL,
  type         VARCHAR(20)   NOT NULL CHECK (type IN ('bug', 'feature_request')),
  status       VARCHAR(20)   NOT NULL DEFAULT 'open'
                             CHECK (status IN ('open', 'in_progress', 'resolved')),
  reporter_id  INTEGER       NOT NULL,
  created_at   TIMESTAMP     DEFAULT NOW(),
  updated_at   TIMESTAMP     DEFAULT NOW()
);
```

---

## 🌐 API Endpoints

### 🔐 Auth Module

| Method | Endpoint           | Access | Description                 |
| ------ | ------------------ | ------ | --------------------------- |
| POST   | `/api/auth/signup` | Public | Register a new user         |
| POST   | `/api/auth/login`  | Public | Login and receive JWT token |

### 📋 Issues Module

| Method | Endpoint          | Access          | Description                   |
| ------ | ----------------- | --------------- | ----------------------------- |
| POST   | `/api/issues`     | Authenticated   | Create a new issue            |
| GET    | `/api/issues`     | Public          | Get all issues (with filters) |
| GET    | `/api/issues/:id` | Public          | Get a single issue            |
| PATCH  | `/api/issues/:id` | Authenticated   | Update an issue               |
| DELETE | `/api/issues/:id` | Maintainer only | Delete an issue               |

#### Query Parameters for `GET /api/issues`

| Param    | Values                            | Default  |
| -------- | --------------------------------- | -------- |
| `sort`   | `newest`, `oldest`                | `newest` |
| `type`   | `bug`, `feature_request`          | (none)   |
| `status` | `open`, `in_progress`, `resolved` | (none)   |

**Example:** `GET /api/issues?sort=oldest&type=bug&status=open`

---

## 👥 User Roles & Permissions

| Action                            | Contributor | Maintainer |
| --------------------------------- | ----------- | ---------- |
| Register / Login                  | ✅          | ✅         |
| Create issue                      | ✅          | ✅         |
| View all issues                   | ✅          | ✅         |
| Update own issue (only if `open`) | ✅          | ✅         |
| Update any issue                  | ❌          | ✅         |
| Delete any issue                  | ❌          | ✅         |
| Change issue status               | ❌          | ✅         |

---

## ⚙️ Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/Topurayhan554/devpulse-api-b7a2.git
cd devpulse-api-b7a2
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
PORT=5000
DATABASE_URL=postgresql://user:password@host:5432/devpulse
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d
```

### 4. Set up the database

Run the SQL schema in your PostgreSQL client (NeonDB / Supabase / local):

```bash
psql -d your_database -f schema.sql
```

### 5. Start the development server

```bash
npm run dev
```

Server runs at: `http://localhost:5000`

---

## 📬 Sample Requests

### Register

```http
POST /api/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@devpulse.com",
  "password": "securePass123",
  "role": "contributor"
}
```

### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@devpulse.com",
  "password": "securePass123"
}
```

### Create Issue

```http
POST /api/issues
Authorization: <JWT_TOKEN>
Content-Type: application/json

{
  "title": "Database connection timeout under load",
  "description": "Pool exhausts after 50+ concurrent queries, causing 500 errors",
  "type": "bug"
}
```

---

## 🚀 Deployment

- **Backend:** Deployed on [Render](https://render.com) / [Vercel](https://vercel.com) / [Railway](https://railway.app)
- **Database:** Hosted on [NeonDB](https://neon.tech) / [Supabase](https://supabase.com)
- **Environment Variables** are configured in the hosting platform dashboard
- **CORS** is enabled for cross-origin requests

---

## 📄 License

This project is created for educational purposes as part of the DevPulse assignment.
