import os
import logging
import vertexai
from vertexai.vision_models import ImageGenerationModel
from config.settings import settings

logger = logging.getLogger(__name__)

class VertexImageService:
    def __init__(self):
        self.project_id = settings.VERTEX_PROJECT_ID
        self.location = settings.VERTEX_LOCATION
        self.key_file = settings.VERTEX_CREDENTIALS_PATH
        self.model_name = settings.MODELS.get("image", "imagen-3.0-generate-001")
        
        self._setup_credentials()
        self._init_vertexai()
        
        try:
            self.model = ImageGenerationModel.from_pretrained(self.model_name)
            logger.info(f"Vertex Image model {self.model_name} initialized.")
        except Exception as e:
            logger.error(f"Failed to initialize Vertex Image model: {e}")
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

    async def generate_image(self, prompt: str, aspect_ratio: str = "1:1") -> bytes:
        """
        Generates an image from a text prompt.
        Returns the image bytes.
        """
        if not self.model:
            logger.error("Vertex Image model is not initialized.")
            return None

        try:
            logger.info(f"Generating image for prompt: {prompt} with AR: {aspect_ratio}")
            
            # Run blocking generation in thread executor if needed, but SDK might be sync.
            # ImageGenerationModel.generate_images is synchronous.
            import asyncio
            
            # Map UI aspect ratio to Vertex AI format if needed.
            # Vertex AI Imagen supports: "1:1", "16:9", "9:16", "3:4", "4:3"
            # Our UI sends: "1:1", "16:9", "9:16", "4:3". All compatible.
            
            response = await asyncio.to_thread(
                self.model.generate_images,
                prompt=prompt,
                number_of_images=1,
                aspect_ratio=aspect_ratio,
                safety_filter_level="block_some",
                person_generation="allow_adult"
            )
            
            if response and response.images:
                # Get the first image
                return response.images[0]._image_bytes
            else:
                logger.warning("No images returned from Vertex AI.")
                return None
            
        except Exception as e:
            logger.error(f"Error generating image: {e}")
            return None

vertex_image_service = VertexImageService()
