from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config.settings import settings
from api.routers import chat, enhance, generate, config

app = FastAPI(
    title="Project_RM API",
    description="Backend API for Project_RM WebApp (Gemini 3)",
    version="1.0.0"
)

# CORS Configuration
origins = [
    "http://localhost:5173",  # Vite default
    "http://127.0.0.1:5173",
    settings.WEBAPP_URL
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o for o in origins if o],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
app.include_router(enhance.router, prefix="/api/enhance-prompt", tags=["enhance"])
app.include_router(generate.router, prefix="/api/generate", tags=["generate"])
app.include_router(config.router, prefix="/api/config", tags=["config"])

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "Project_RM API"}
