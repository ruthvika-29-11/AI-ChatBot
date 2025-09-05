1. Prerequisites

Docker & Docker Compose (for database)

Python 3.13+ (backend)

Node.js 18+ (frontend)

API Keys for providers (OpenAI, Gemini, optional Anthropic)

2. Clone Repository
git clone https://github.com/yourusername/bluesprings-chatbot-capstone.git
cd bluesprings-chatbot-capstone

3. Environment Variables

Create .env file in backend/:

POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
POSTGRES_DB=chatbot_db
POSTGRES_HOST=localhost
POSTGRES_PORT=5432

OPENAI_API_KEY=your_openai_key
GEMINI_API_KEY=your_gemini_key
ANTHROPIC_API_KEY=your_anthropic_key  # optional
OLLAMA_LOCAL_PATH=/path/to/ollama/models

4. Database Setup
Using Docker Compose:
docker-compose up -d


Runs PostgreSQL locally on port 5432.

Optional: load sample data using .sql dump:

psql -h localhost -U postgres -d chatbot_db -f sample_data.sql

5. Backend Setup
cd backend
python -m venv venv
source venv/bin/activate  # Mac/Linux
venv\Scripts\activate     # Windows
pip install -r requirements.txt
uvicorn app:app --reload --port 8000


Notes:

FastAPI backend runs on http://127.0.0.1:8000.

Use --port 8001 or 8002 if default is in use.

6. Frontend Setup
cd frontend
npm install
npm run dev


React frontend runs on http://127.0.0.1:5173.

Connects to backend via environment API URL.

7. Testing Streaming Endpoint
curl -N -X POST http://127.0.0.1:8000/chat/stream \
-H "Content-Type: application/json" \
-d '{"session_id": "some-uuid", "message": "Hello"}'


Should return token-by-token streaming response.

8. Deployment Tips

Use Nginx or AWS ALB for reverse proxy.

Enable HTTPS via SSL certificates.

Use systemd or PM2 to run backend as a service.

Optionally deploy frontend to S3 + CloudFront.
