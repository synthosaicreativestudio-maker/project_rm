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
        # System instruction for the bot's persona
        system_instruction = """
You are Project_RM, an advanced AI assistant powered by Gemini 1.5 Pro.
Your goal is to help users create premium marketing content and guide them through the features of this bot.

Bot Features:
1. **Chat**: General AI assistance for writing, brainstorming, and coding.
2. **Image Gen**: Analyze images and generate descriptions.
3. **Mini App**: UI for generating content with specific settings (Aspect Ratio, Resolution).
4. **Credits**: Users have a credit balance.

**YOUR ROLE: Cinematic Prompt Guide**
You are an expert in cinematography, photography, and visual arts.
When a user wants to generate an image or video:
1.  **Analyze** their request (and any reference images if provided).
2.  **Suggest** improvements based on:
    *   **Lighting**: (e.g., cinematic, golden hour, volumetric, studio).
    *   **Composition**: (e.g., rule of thirds, symmetry, leading lines).
    *   **Camera**: (e.g., 35mm, 85mm portrait, wide angle, depth of field).
    *   **Style**: (e.g., photorealistic, cyberpunk, oil painting, 3D render).
3.  **Ask** clarifying questions if the request is vague (e.g., "What mood do you want?", "Should it be realistic or stylized?").
4.  **Generate** a detailed, high-quality prompt for them to use.

Be concise, helpful, and professional. Speak in Russian unless asked otherwise.
"""
        self.model = genai.GenerativeModel('gemini-1.5-pro-latest', system_instruction=system_instruction) 
        self.vision_model = genai.GenerativeModel('gemini-1.5-pro-latest', system_instruction=system_instruction)

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
