from typing import Annotated, List, TypedDict, Union
from langgraph.graph import StateGraph, END
import operator

class IncidentState(TypedDict):
    incident_id: str
    status: str # investigating, diagnosing, mitigating, awaiting_approval, resolved
    alerts: List[dict]
    logs: List[str]
    metrics: List[dict]
    root_cause: str
    suggested_actions: List[dict]
    approved_actions: List[dict]
    timeline: List[dict]
    messages: Annotated[List[str], operator.add]

import os
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage
from dotenv import load_dotenv

load_dotenv()

# Initialize Groq
llm = ChatGroq(
    temperature=0,
    model_name="llama3-70b-8192",
    groq_api_key=os.getenv("GROQ_API_KEY")
)

from backend.integrations.mock_adapters import k8s_client, datadog_client, pagerduty_client

def triage_node(state: IncidentState):
    # Summary of alerts
    return {"status": "investigating", "messages": ["Commander triaging mock alerts..."]}

async def investigation_node(state: IncidentState):
    # Fetch mock telemetry
    logs = await k8s_client.get_pod_logs("default", "app=api-gateway")
    metrics = await datadog_client.get_metrics("avg:system.cpu.idle{*}", duration_minutes=15)

    return {
        "status": "diagnosing", 
        "logs": logs,
        "metrics": metrics,
        "messages": ["Mock telemetry gathered for analysis."]
    }

async def diagnosis_node(state: IncidentState):
    # Logic to identify root cause using Groq with structured output
    prompt = f"""
    Analyze the following incident data:
    Logs: {state.get('logs')}
    Metrics: {state.get('metrics')}
    
    Identify the primary root cause. 
    Then, provide 3 possible remediation actions with:
    1. Confidence Score (0-100)
    2. Safety Rating (Low, Medium, High)
    3. Potential Side Effects
    
    Format your response as a JSON object:
    {{
        "root_cause": "description",
        "suggestions": [
            {{
                "id": "act_1",
                "type": "rollback",
                "label": "Rollback Deployment",
                "confidence": 95,
                "safety": "High",
                "reasoning": "...",
                "side_effects": "..."
            }},
            ...
        ]
    }}
    """
    
    response = await llm.ainvoke([
        SystemMessage(content="You are a senior SRE AI. Always output valid JSON."),
        HumanMessage(content=prompt)
    ])
    
    try:
        # Simple extraction for MVP (in production use JsonOutputParser)
        import json
        analysis = json.loads(response.content)
        return {
            "status": "mitigating", 
            "root_cause": analysis["root_cause"], 
            "suggested_actions": analysis["suggestions"],
            "messages": [f"AI identified: {analysis['root_cause']}"]
        }
    except:
        return {
            "status": "mitigating", 
            "root_cause": "Parsing error", 
            "messages": ["Failed to parse AI response, using defaults."]
        }

def mitigation_node(state: IncidentState):
    # Logic to suggest actions
    actions = [{"type": "rollback", "description": "Rollback to previous stable version", "id": "act_1"}]
    return {"status": "awaiting_approval", "suggested_actions": actions, "messages": ["Suggested rollback of deployment."]}

def execution_node(state: IncidentState):
    # Logic to run approved actions
    return {"status": "resolved", "messages": ["Action executed successfully. Monitoring recovery."]}

# Define the graph
workflow = StateGraph(IncidentState)

workflow.add_node("triage", triage_node)
workflow.add_node("investigation", investigation_node)
workflow.add_node("diagnosis", diagnosis_node)
workflow.add_node("mitigation", mitigation_node)
workflow.add_node("execution", execution_node)

workflow.set_entry_point("triage")
workflow.add_edge("triage", "investigation")
workflow.add_edge("investigation", "diagnosis")
workflow.add_edge("diagnosis", "mitigation")
workflow.add_edge("mitigation", END) # In real flow, this would go to a human wait state
workflow.add_edge("execution", END)

app_graph = workflow.compile()
