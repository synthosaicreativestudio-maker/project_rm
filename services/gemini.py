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

**FORMATTING:**
Format your response using **HTML tags** supported by Telegram: <b>bold</b>, <i>italic</i>, <code>code</code>, <pre>pre</pre>, <a href='...'>link</a>.
Do NOT use Markdown (asterisks like **text** or *text*). Use <b>text</b> for bold.
"""
        self.model = genai.GenerativeModel(settings.MODELS['text'], system_instruction=system_instruction) 
        self.vision_model = genai.GenerativeModel(settings.MODELS['text'], system_instruction=system_instruction)

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
            return None

    async def generate_image(self, prompt: str, aspect_ratio: str = "1:1") -> Optional[bytes]:
        """
        Generates an image using Gemini 3 Pro Image Preview.
        Returns the image bytes.
        """
        try:
            # Initialize the image model on demand or in __init__
            # Using the model ID from settings or hardcoded as per user request if not in settings
            model_name = settings.MODELS.get("image", "gemini-3-pro-image-preview")
            image_model = genai.GenerativeModel(model_name)
            
            logger.info(f"Generating image with {model_name} for prompt: {prompt}")
            
            # Note: The prompt for image generation might need specific handling if the model expects it.
            # For Gemini 3 Image, it seems generate_content with text prompt works.
            response = await image_model.generate_content_async(prompt)
            
            if response.parts:
                for part in response.parts:
                    if part.inline_data:
                        return part.inline_data.data
            
            logger.warning("No image data found in response.")
            return None
            
        except Exception as e:
            logger.error(f"Error generating image with Gemini: {e}")
            return None

gemini_service = GeminiService()
