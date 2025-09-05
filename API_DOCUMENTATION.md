1. Overview

The Bluesprings AI Chatbot backend exposes RESTful endpoints for:

Chat streaming (/chat/stream)

Session management (/sessions)

User management (/users)

All endpoints require proper JSON request bodies and JWT authentication where applicable.

2. Base URL
http://localhost:8000

3. Endpoints
3.1 Chat Streaming

URL: /chat/stream

Method: POST

Description: Sends a message to an AI provider and streams token-by-token response via Server-Sent Events (SSE).

Request Body:

{
  "session_id": "uuid-of-session",
  "message": "Hello AI!"
}


Response:
SSE stream with data events:

data: {"delta": "Hello, "}
data: {"delta": "how "}
data: {"delta": "can "}
data: {"delta": "I "}
data: {"delta": "help "}
data: {"delta": "you?"}

3.2 Create Session

URL: /sessions/

Method: POST

Description: Creates a new chat session.

Request Body:

{
  "user_id": "uuid-of-user",
  "title": "My First Chat",
  "provider": "openai",
  "model": "gpt-4"
}


Response:

{
  "id": "uuid-of-session",
  "title": "My First Chat",
  "provider": "openai",
  "model": "gpt-4",
  "created_at": "2025-09-05T12:00:00Z"
}

3.3 List Sessions

URL: /sessions/

Method: GET

Description: Returns all sessions for a user.

Response:

[
  {
    "id": "uuid",
    "title": "Chat 1",
    "provider": "openai",
    "model": "gpt-4",
    "created_at": "2025-09-05T12:00:00Z"
  }
]

3.4 Add User

URL: /users/

Method: POST

Description: Creates a new user.

Request Body:

{
  "username": "john_doe",
  "email": "john@example.com"
}


Response:

{
  "id": "uuid-of-user",
  "username": "john_doe",
  "email": "john@example.com",
  "created_at": "2025-09-05T12:00:00Z"
}
