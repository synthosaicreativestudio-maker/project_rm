import google.generativeai as genai
from google.generativeai.types import GenerateContentResponse
from typing import Optional, List
import logging
from PIL import Image

from config.settings import settings

logger = logging.getLogger(__name__)

class GeminiService:
    def __init__(self):
        if not settings.GEMINI_API_KEY:
            logger.warning("GEMINI_API_KEY is not set. Gemini service will not function correctly.")
            return
        
        genai.configure(api_key=settings.GEMINI_API_KEY)
        # Using the latest Gemini model
        self.model = genai.GenerativeModel('gemini-1.5-pro-latest') 
        self.vision_model = genai.GenerativeModel('gemini-1.5-pro-latest') # 1.5 Pro supports multimodal

    async def generate_text(self, prompt: str) -> Optional[str]:
        """
        Generates text based on the provided prompt.
        """
        try:
            response: GenerateContentResponse = await self.model.generate_content_async(prompt)
            return response.text
        except Exception as e:
            logger.error(f"Error generating text: {e}")
            return None

    async def generate_multimodal(self, prompt: str, images: List[Image.Image]) -> Optional[str]:
        """
        Generates content based on text prompt and images.
        """
        try:
            inputs = [prompt] + images
            response: GenerateContentResponse = await self.vision_model.generate_content_async(inputs)
            return response.text
        except Exception as e:
            logger.error(f"Error generating multimodal content: {e}")
            return None

gemini_service = GeminiService()
