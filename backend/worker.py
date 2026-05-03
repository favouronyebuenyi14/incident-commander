import asyncio
from temporalio import activity, workflow
from temporalio.client import Client
from temporalio.worker import Worker
from backend.workflows.incident_workflow import IncidentResponseWorkflow
from backend.agent.graph import app_graph

# Define activities that wrap LangGraph nodes
@activity.defn
async def run_triage(incident_id: str) -> dict:
    return await app_graph.ainvoke({"incident_id": incident_id, "messages": ["Triage started"]})

async def main():
    # Connect to temporal server
    client = await Client.connect("localhost:7233")
    
    # Run the worker
    worker = Worker(
        client,
        task_queue="incident-queue",
        workflows=[IncidentResponseWorkflow],
        activities=[run_triage],
    )
    print("Temporal Worker started...")
    await worker.run()

if __name__ == "__main__":
    asyncio.run(main())
