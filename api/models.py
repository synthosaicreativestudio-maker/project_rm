from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[dict]] = None

class ChatResponse(BaseModel):
    response: str

class EnhanceRequest(BaseModel):
    prompt: str
    type: str = "image"

class EnhanceResponse(BaseModel):
    enhanced_prompt: str

class GenerateImageRequest(BaseModel):
    prompt: str
    params: Dict[str, Any] = {}

class GenerateVideoRequest(BaseModel):
    prompt: str

class GenerateRequest(BaseModel):
    user_id: int
    type: str
    prompt: str
    params: Dict[str, Any] = {}

class StatusResponse(BaseModel):
    status: str
    message: Optional[str] = None
    video_uri: Optional[str] = None
