import random
from datetime import datetime, timedelta

class MockDatadog:
    async def get_metrics(self, query: str, duration_minutes: int = 15):
        return f"Mock metrics for {query}: [Value: {random.randint(80, 100)}% usage]"

class MockKubernetes:
    async def get_pod_logs(self, namespace: str, label_selector: str):
        return [
            f"Pod {random.randint(100, 999)}: ERROR java.lang.OutOfMemoryError: Java heap space",
            f"Pod {random.randint(100, 999)}: WARN Slow database query detected (1.2s)"
        ]

    async def rollback_deployment(self, namespace: str, deployment_name: str):
        return {"status": "success", "message": f"Rolled back {deployment_name} to previous revision."}

class MockPagerDuty:
    async def get_incident(self, incident_id: str):
        return {"id": incident_id, "title": "API Latency Spike", "status": "triggered"}

datadog_client = MockDatadog()
k8s_client = MockKubernetes()
pagerduty_client = MockPagerDuty()
