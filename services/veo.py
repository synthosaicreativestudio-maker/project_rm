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
            
            # The generate_content method might be synchronous, wrapping it to avoid blocking loop if necessary.
            # However, for now, we will assume standard call.
            response = self.model.generate_content(prompt)
            
            logger.info(f"Video generation response received: {response}")
            
            # Try to extract the video URI or GCS path from the response
            # Note: The exact structure depends on the API version. 
            # We will look for 'uri' in candidates or usage of GCS.
            if hasattr(response, 'candidates') and response.candidates:
                 # Check if there's a GCS URI in the content
                 # This is a best-effort extraction based on typical Vertex AI response
                 return str(response.candidates[0].content)
            
            # Fallback to string representation if structure is unknown
            return str(response)

        except Exception as e:
            logger.error(f"Error generating video: {e}")
            if "429" in str(e) or "ResourceExhausted" in str(e):
                logger.error("Quota exceeded for Veo model.")
            return None

veo_service = VeoService()
