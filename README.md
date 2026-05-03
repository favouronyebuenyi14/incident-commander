# AI Incident Response Commander

An agentic system for DevOps/SRE teams to automate and coordinate production incident response.

## Features
- **Agentic Diagnosis**: Uses LangGraph and Groq (Llama 3) for root cause analysis.
- **Durable Workflows**: Powered by Temporal for resilient incident management.
- **Premium Dashboard**: High-fidelity Next.js command center.
- **Slack Integration**: Real-time team notifications and sync.
- **Deep-Dive Analysis**: Transparency through reasoning chains and raw telemetry inspection.

## Structure
- `/frontend`: Next.js application.
- `/backend`: FastAPI server and LangGraph agent.
- `/temporal`: Temporal configuration and workflows.

## Getting Started

### Backend
1. `cd backend`
2. `pip install -r requirements.txt`
3. `cp .env.example .env` (Add your GROQ_API_KEY)
4. `uvicorn main:app --reload`

### Temporal Worker
1. `cd backend`
2. `python worker.py`

### Frontend
1. `cd frontend`
2. `npm install`
3. `npm run dev`
