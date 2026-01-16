from fastapi import APIRouter, HTTPException
from api.models import EnhanceRequest, EnhanceResponse
from services.gemini import gemini_service
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/", response_model=EnhanceResponse)
async def enhance_prompt(request: EnhanceRequest):
    try:
        enhancement_instruction = f"""
        Act as a professional {request.type} prompt engineer. 
        Enhance the following user prompt to be more cinematic, detailed, and artistic.
        Keep it concise but descriptive.
        User Prompt: "{request.prompt}"
        """
        
        enhanced_prompt = await gemini_service.generate_text(enhancement_instruction)
        if not enhanced_prompt:
             raise HTTPException(status_code=500, detail="Failed to enhance prompt")
             
        return EnhanceResponse(enhanced_prompt=enhanced_prompt)
    except Exception as e:
        logger.error(f"Error in enhance_prompt: {e}")
        raise HTTPException(status_code=500, detail=str(e))
