1. System Overview

The Bluesprings AI Chatbot is a full-stack, multi-provider AI chatbot platform that supports:

Real-time token-by-token streaming responses (like ChatGPT).

Multiple AI providers (OpenAI, Gemini, optional Anthropic, Ollama).

Persistent sessions and message history.

Modern, responsive React frontend.

Production-ready backend with FastAPI or Express.js.

High-level flow:

[Frontend React App] <--> [Backend API] <--> [AI Provider(s)]
                              |
                              v
                          [PostgreSQL DB]

2. Component Diagram
graph TD
    A[User Interface - React] --> B[Chat API - FastAPI]
    B --> C[AI Provider Adapter Layer]
    C --> D1[OpenAI API]
    C --> D2[Gemini API]
    C --> D3[Ollama Local Model]
    B --> E[PostgreSQL Database]


Explanation:

React UI: Custom chat interface, session list, and message streaming.

Backend API: Handles authentication, session management, SSE streaming.

AI Provider Layer: Abstract base class with adapters for each provider.

Database: Stores users, sessions, messages, and metadata.

3. Database ER Diagram
erDiagram
    USERS {
        UUID id PK
        VARCHAR username
        VARCHAR email
        TIMESTAMP created_at
        TIMESTAMP last_login
    }
    SESSIONS {
        UUID id PK
        UUID user_id FK
        VARCHAR title
        TIMESTAMP created_at
        TIMESTAMP updated_at
        VARCHAR provider
        VARCHAR model
    }
    MESSAGES {
        UUID id PK
        UUID session_id FK
        ENUM role
        TEXT content
        VARCHAR provider
        VARCHAR model
        INT tokens_used
        TIMESTAMP created_at
        JSONB metadata
    }

    USERS ||--o{ SESSIONS : owns
    SESSIONS ||--o{ MESSAGES : contains

4. API Flow Diagram
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant Provider
    participant DB

    User->>Frontend: Type message
    Frontend->>Backend: POST /chat/stream
    Backend->>DB: Store message
    Backend->>Provider: Stream message token-by-token
    Provider-->>Backend: Stream tokens
    Backend-->>Frontend: SSE stream tokens
    Frontend->>User: Display tokens live
    Backend->>DB: Update message with full content

5. Component Interaction Diagram
graph LR
    FE[Frontend React] -->|REST API| BE[Backend FastAPI]
    BE -->|Adapter Pattern| AP[Provider Layer]
    AP --> OP[OpenAI API]
    AP --> GP[Gemini API]
    AP --> OL[Ollama Local]
    BE -->|ORM| DB[(PostgreSQL)]

6. Deployment Architecture
          +-----------------------+
          |     React Frontend    |
          |    (Vite + CSS3)     |
          +----------+------------+
                     |
                     v
          +-----------------------+
          |  FastAPI Backend      |
          |  SSE + Provider Layer |
          +----------+------------+
                     |
      +--------------+----------------+
      |                               |
+-------------+                +-------------+
| PostgreSQL  |                | AI Provider |
| DB Cluster  |                | OpenAI/Gemini/Ollama |
+-------------+                +-------------+


Notes:

Backend deployed on AWS EC2 or local machine.

Database uses Postgres with connection pooling.

AI provider layer abstracts multiple providers for seamless switching.
