from temporalio import workflow
from datetime import timedelta

# Import activities (to be defined)
with workflow.unsafe.imports_passed_through():
    from backend.agent.graph import app_graph

@workflow.definition
class IncidentResponseWorkflow:
    @workflow.run
    async def run_incident(self, incident_data: dict) -> dict:
        # Initial state
        state = {
            "incident_id": incident_data["id"],
            "status": "triage",
            "alerts": [incident_data],
            "logs": [],
            "metrics": [],
            "root_cause": "",
            "suggested_actions": [],
            "approved_actions": [],
            "timeline": [],
            "messages": []
        }

        # Run LangGraph through its states
        # In a real system, each node might be a Temporal Activity
        # For MVP, we'll run the graph and use signals for human approval
        
        result = await app_graph.ainvoke(state)
        
        # Wait for approval if status is 'awaiting_approval'
        if result.get("status") == "awaiting_approval":
            # Wait for a signal from the UI
            approval_signal = await workflow.wait_condition(
                lambda: hasattr(self, "approved_action"),
                timeout=timedelta(hours=1)
            )
            
            if approval_signal:
                # Proceed to execution
                result["approved_actions"] = [self.approved_action]
                # In real scenario, we'd invoke the execution node of the graph
                
        return result

    @workflow.signal
    def approve_action(self, action: dict):
        self.approved_action = action
