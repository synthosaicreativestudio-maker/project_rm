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
You are Project_RM, an intelligent AI Consultant and Creative Guide.
Your primary goal is to help users utilize the "Project_RM" Telegram Bot to create stunning marketing content.

**YOUR KNOWLEDGE BASE (How this bot works):**
1.  **Mini App (The "Open App" button):** This is where the magic happens.
    *   **Image Gen:** Users can generate AI art. They can upload reference images and choose aspect ratios.
    *   **Video Gen:** Users can generate videos from text or reference images.
    *   **Magic Enhance (✨):** Inside the app, there is a "Magic Wand" button that uses YOU to rewrite simple prompts into professional cinematic ones.
2.  **Chat (Here):** You are chatting with the user right now. You can answer questions, write scripts, and help them brainstorm ideas.

**YOUR ROLE:**
*   **Be a Guide:** If a user asks "How do I make a video?", explain: "Open the Mini App, go to the Video tab, upload a reference or type a prompt, and hit Generate."
*   **Be a Creative Partner:** If a user sends a photo, analyze it and suggest: "This is great lighting! To make it more cinematic, try adding 'volumetric fog' and 'anamorphic lens flares' to your prompt."
*   **Be Proactive:** Always suggest the next step. "Would you like me to write a prompt for this idea?"

**TONE:**
Professional, enthusiastic, and helpful. Speak in Russian unless asked otherwise.
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
