from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
import logging

# Load environment variables
load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("cardsnap.main")

app = FastAPI(
    title="CardSnap API",
    description="Business Card Scanning and Google Sheets Continuous Storage API",
    version="1.0.0"
)

# CORS setup for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from api.routes import router as api_router
app.include_router(api_router, prefix="/api")

@app.get("/")
def root():
    return {
        "app": "CardSnap API",
        "status": "running",
        "docs": "/docs"
    }

# CardSnap API Entrypoint
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
