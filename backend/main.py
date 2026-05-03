from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.api.incidents import router as incident_router

app = FastAPI(title="AI Incident Response Commander")

app.include_router(incident_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "AI Incident Response Commander API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
