import logging
import asyncio
from google import genai
from google.genai import types
from config.settings import settings

logger = logging.getLogger(__name__)

class VeoService:
    def __init__(self):
        # We now use the standard API key approach as suggested by the user
        self.api_key = settings.GEMINI_API_KEY # Or a dedicated VEO_API_KEY if we want to separate
        self.client = None
        self.model_name = "veo-3.1-fast-generate-preview" # Confirmed working ID
        
        if self.api_key:
            try:
                self.client = genai.Client(api_key=self.api_key)
                logger.info("VeoService initialized with google-genai SDK.")
            except Exception as e:
                logger.error(f"Failed to initialize google-genai client: {e}")

    async def generate_video(self, prompt: str) -> bytes:
        """
        Generates a video from a text prompt.
        Returns video bytes if successful, None otherwise.
        """
        if not self.client:
            logger.error("Veo client is not initialized.")
            return None

        try:
            logger.info(f"Generating video for prompt: {prompt}")
            
            # Start generation (Async operation)
            # We run it in a thread or hope the SDK's generate_videos is non-blocking 
            # (but usually it's better to use wrap for long operations)
            
            operation = await asyncio.to_thread(
                self.client.models.generate_videos,
                model=self.model_name,
                prompt=prompt,
                config=types.GenerateVideosConfig(
                    aspect_ratio="16:9",
                )
            )
            
            logger.info(f"Veo operation started: {operation.name}")
            
            # Polling for result
            while not operation.done:
                await asyncio.sleep(10)
                operation = await asyncio.to_thread(self.client.operations.get, operation.name)
            
            if operation.result and operation.result.generated_videos:
                video = operation.result.generated_videos[0]
                if video.video and video.video.video_bytes:
                    logger.info("Video generation successful.")
                    return video.video.video_bytes
            
            logger.warning("Video generation finished but no bytes found.")
            return None

        except Exception as e:
            logger.error(f"Error in Veo generate_video: {e}")
            return None

veo_service = VeoService()
