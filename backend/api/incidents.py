from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import uuid

router = APIRouter(prefix="/incidents", tags=["incidents"])

class IncidentCreate(BaseModel):
    title: str
    severity: str
    source: str

class Incident(BaseModel):
    id: str
    title: str
    severity: str
    status: str
    created_at: str

@router.post("/", response_model=Incident)
async def create_incident(payload: IncidentCreate):
    incident_id = str(uuid.uuid4())
    # In a real app, we would start a Temporal workflow here
    # client = await Client.connect("localhost:7233")
    # await client.start_workflow(
    #     IncidentResponseWorkflow.run_incident,
    #     {"id": incident_id, "title": payload.title},
    #     id=f"incident-{incident_id}",
    #     task_queue="incident-queue"
    # )
    
    return {
        "id": incident_id,
        "title": payload.title,
        "severity": payload.severity,
        "status": "investigating",
        "created_at": "2024-05-03T16:00:00Z"
    }

@router.get("/")
async def list_incidents():
    return [
        {
            "id": "INC-1",
            "title": "API Latency Spike",
            "severity": "critical",
            "status": "investigating",
        }
    ]

@router.get("/{incident_id}/events")
async def incident_events(incident_id: str):
    import json
    import asyncio
    from fastapi.responses import StreamingResponse
    
    async def event_generator():
        steps = [
            {"status": "investigating", "message": "Commander checking logs..."},
            {"status": "diagnosing", "message": "Analyzing error patterns with Llama 3..."},
            {"status": "mitigating", "message": "Root cause identified: DB Connection Pool Exhaustion"},
            {"status": "awaiting_approval", "message": "Suggested Action: Rollback deployment v1.2.4"}
        ]
        for step in steps:
            await asyncio.sleep(3)
            yield f"data: {json.dumps(step)}\n\n"
            
    return StreamingResponse(event_generator(), media_type="text/event-stream")
