import os
import httpx

class SlackClient:
    def __init__(self):
        self.token = os.getenv("SLACK_BOT_TOKEN", "mock-token")
        self.channel = os.getenv("SLACK_CHANNEL_ID", "C12345")

    async def post_message(self, text: str, blocks: list = None):
        print(f"[SLACK MOCK] Posting to {self.channel}: {text}")
        # In real life:
        # async with httpx.AsyncClient() as client:
        #     await client.post("https://slack.com/api/chat.postMessage", ...)
        return {"ok": True}

    async def post_incident_update(self, incident_id: str, status: str, message: str):
        blocks = [
            {
                "type": "section",
                "text": {"type": "mrkdwn", "text": f"*Incident Update: {incident_id}*"}
            },
            {
                "type": "section",
                "text": {"type": "mrkdwn", "text": f"> Status: *{status}*\n> {message}"}
            }
        ]
        await self.post_message(message, blocks)

slack_client = SlackClient()
