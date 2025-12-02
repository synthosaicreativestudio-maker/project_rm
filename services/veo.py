import os
import logging
import vertexai
from vertexai.preview.generative_models import GenerativeModel
from config.settings import settings

logger = logging.getLogger(__name__)

class VeoService:
    def __init__(self):
        self.project_id = settings.VERTEX_PROJECT_ID
        self.location = settings.VERTEX_LOCATION
        self.key_file = settings.VERTEX_CREDENTIALS_PATH
        
        self._setup_credentials()
        self._init_vertexai()
        
        self.model_name = settings.MODELS.get("video", "veo-3.1-fast-generate-001")
        try:
            self.model = GenerativeModel(self.model_name)
            logger.info(f"Veo model {self.model_name} initialized.")
        except Exception as e:
            logger.error(f"Failed to initialize Veo model: {e}")
            self.model = None

    def _setup_credentials(self):
        """Sets up Google Application Credentials if not already set."""
        if "GOOGLE_APPLICATION_CREDENTIALS" not in os.environ:
            if os.path.exists(self.key_file):
                os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = self.key_file
                logger.info(f"Set GOOGLE_APPLICATION_CREDENTIALS to {self.key_file}")
            else:
                logger.warning(f"Key file {self.key_file} not found and GOOGLE_APPLICATION_CREDENTIALS not set.")

    def _init_vertexai(self):
        """Initializes Vertex AI."""
        try:
            vertexai.init(project=self.project_id, location=self.location)
        except Exception as e:
            logger.error(f"Failed to init vertexai: {e}")

    async def generate_video(self, prompt: str) -> str:
        """
        Generates a video from a text prompt.
        Returns the URI or path to the generated video.
        """
        if not self.model:
            logger.error("Veo model is not initialized.")
            return None

        try:
            logger.info(f"Generating video for prompt: {prompt}")
            # Note: generate_content is synchronous in the SDK usually, but we might want to run it in a thread executor if it blocks.
            # For now, we'll assume it's fast enough or we'll wrap it later.
            # Veo might return a response with a video file URI or bytes.
            response = self.model.generate_content(prompt)
            
            # TODO: Handle the response structure properly.
            # Assuming response has candidates[0].content or similar.
            # Since we hit quota, we can't verify the exact response structure yet.
            # We will return the raw response for now or log it.
            
            logger.info(f"Video generation response: {response}")
            return str(response) # Placeholder
            
        except Exception as e:
            logger.error(f"Error generating video: {e}")
            if "429" in str(e):
                logger.error("Quota exceeded for Veo model.")
            return None

veo_service = VeoService()
