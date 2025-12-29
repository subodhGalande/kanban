# EB Kanban

[![Ask DeepWiki](https://devin.ai/assets/askdeepwiki.png)](https://deepwiki.com/subodhGalande/eb-kanban)

Kanban is a full-stack, responsive Kanban board application designed for productivity. It features a clean, minimal interface with robust functionality, including user authentication, task management with drag-and-drop, and real-time UI updates. The project is built with a modern tech stack, emphasizing clean code and maintainability.

## Features

-   **User Authentication**: Secure user registration and login system using JWTs stored in HTTP-only cookies.
-   **Kanban Board**: A multi-column board (To Do, In Progress, Review, Done) for visualizing task workflow.
-   **Drag & Drop**: Smooth, intuitive task movement between columns, powered by `@dnd-kit`.
-   **Task Management**: Full CRUD (Create, Read, Update, Delete) functionality for tasks.
-   **Task Attributes**: Assign titles, descriptions, and priority levels (Low, Medium, High) to tasks.
-   **Optimistic UI Updates**: Instantaneous UI feedback when creating, updating, or moving tasks.
-   **Search, Sort & Filter**: Easily find and organize tasks with powerful filtering and sorting options.
-   **Responsive Design**: A seamless experience across desktop and mobile devices.

## Tech Stack

-   **Framework**: [Next.js](https://nextjs.org/) (App Router)
-   **Database**: [PostgreSQL](https://www.postgresql.org/) (with [NeonDB](https://neon.tech/) as a serverless provider)
-   **ORM**: [Prisma](https://www.prisma.io/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **Drag & Drop**: [@dnd-kit](https://dndkit.com/)
-   **Form Management**: [React Hook Form](https://react-hook-form.com/)
-   **Validation**: [Zod](https://zod.dev/)
-   **Authentication**: [jose](https://github.com/panva/jose) for JWTs, [Argon2](https://github.com/ranisalt/node-argon2) for password hashing
-   **Language**: [TypeScript](https://www.typescriptlang.org/)

## Project Structure

The repository is organized following Next.js App Router conventions:

```plaintext
/
├── app/                  # Main application source
│   ├── (auth)/           # Authentication pages (Login, Signup)
│   ├── api/              # API Route Handlers (backend logic)
│   ├── dashboard/        # Protected dashboard pages
│   ├── page.tsx          # Landing page
│   └── layout.tsx        # Root layout
├── components/           # Reusable React components
├── lib/                  # Helper functions (DB client, JWT, etc.)
├── prisma/               # Prisma schema and migrations
└── public/               # Static assets
```

## Database Schema

The data model consists of `User` and `Task` entities, defined in `prisma/schema.prisma`.

```prisma
model User {
  id           String   @id @default(uuid())
  name         String
  email        String   @unique
  passwordHash String
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  tasks        Task[]
}

model Task {
  id          String   @id @default(uuid())
  title       String
  description String
  status      Status   @default(TODO)
  priority    Priority @default(MEDIUM)
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

enum Status {
  TODO
  IN_PROGRESS
  REVIEW
  DONE
}

enum Priority {
  LOW
  MEDIUM
  HIGH
}
```

## API Endpoints

The backend is implemented using Next.js Route Handlers in the `app/api/` directory.

| Method | Endpoint              | Description                    |
| :----- | :-------------------- | :----------------------------- |
| `POST` | `/api/auth/signup`    | Register a new user.           |
| `POST` | `/api/auth/login`     | Log in a user and set cookie.  |
| `POST` | `/api/auth/logout`    | Log out a user and clear cookie. |
| `GET`  | `/api/tasks`          | Get all tasks for the logged-in user. |
| `POST` | `/api/tasks`          | Create a new task.             |
| `PUT`  | `/api/tasks/[id]`     | Update an existing task.       |
| `DELETE`| `/api/tasks/[id]`    | Delete a task.                 |

## Environment Setup

Create a `.env` file in the root of the project and add the following environment variables.

```sh
# Example .env file

# Connection string for your PostgreSQL database.
# For local development, this might look like:
# DATABASE_URL="postgresql://user:password@localhost:5432/db-name"
DATABASE_URL="your_database_connection_string"

# A secret key for signing JWTs. Generate a strong, random string.
JWT_SECRET="your_jwt_secret"
```

## Getting Started

To run the project locally, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/subodhGalande/eb-kanban.git
    cd eb-kanban
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root directory and populate it with your database URL and JWT secret as described in the [Environment Setup](#environment-setup) section.

4.  **Run database migrations:**
    Apply the schema to your database using Prisma Migrate.
    ```bash
    npx prisma migrate dev
    ```

5.  **Start the development server:**
    ```bash
    npm run dev
    ```

The application will be available at `http://localhost:3000`.
