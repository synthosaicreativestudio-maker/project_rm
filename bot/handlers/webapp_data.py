import json
import asyncio
import logging
from aiogram import Router, F, types
import google.generativeai as genai

from config.settings import settings

router = Router()
logger = logging.getLogger(__name__)

# Configure Gemini
if settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)

@router.message(F.web_app_data)
async def handle_web_app_data(message: types.Message):
    """
    Handles data received from the Mini App via tg.sendData()
    """
    try:
        # Parse JSON data from WebApp
        data = json.loads(message.web_app_data.data)
        
        action_type = data.get('type')
        prompt = data.get('prompt')
        params = data.get('params', {})

        logger.info(f"Received WebApp data: {action_type} | {prompt[:50]}...")

        # Feedback to user
        await message.answer(f"✅ Задача получена: {action_type.upper()}\nПромт: {prompt[:50]}...")

        if action_type == 'text':
            # Gemini 3.0 Pro Logic
            model_id = settings.MODELS['text']
            model = genai.GenerativeModel(model_id)
            
            # Run blocking generation in thread
            response = await asyncio.to_thread(model.generate_content, prompt)
            await message.answer(response.text)

        elif action_type == 'image':
            # Nanabanana Pro Logic
            model_id = settings.MODELS['image']
            await message.answer(f"🎨 {model_id} рисует...")
            
            model = genai.GenerativeModel(model_id)
            # Add style params if needed, e.g. "Cinematic style: " + prompt
            
            response = await asyncio.to_thread(model.generate_content, prompt)
            
            # Assuming response contains image data (blob/bytes)
            # Note: The actual API response structure for image gen might differ. 
            # This follows the TZ skeleton.
            if response.parts:
                # Check if parts contain inline_data (images)
                # This is a placeholder based on TZ. Actual response inspection might be needed.
                try:
                    img_data = response.parts[0].inline_data.data
                    await message.answer_photo(photo=img_data, caption=f"By {model_id}")
                except AttributeError:
                    # Fallback if structure is different or it returned text
                    await message.answer(f"Result: {response.text}")

        elif action_type == 'video':
            # Veo 3.1 Preview Logic
            model_id = settings.MODELS['video']
            duration = int(params.get('duration', 4))
            
            await message.answer(f"🎥 {model_id} начала рендеринг ({duration}s)...")
            
            model = genai.GenerativeModel(model_id)
            
            # Veo config
            # Note: GenerationConfig might need specific import or dict structure
            video_config = genai.types.GenerationConfig(
                media_resolution="1280x720",
                video_metadata={"duration_seconds": duration}
            )
            
            # Run long-running generation in thread
            operation = await asyncio.to_thread(
                model.generate_content, 
                prompt, 
                generation_config=video_config
            )
            
            # In real Veo API, we might need to handle operation.result() or similar
            # Assuming immediate response for now based on TZ skeleton
            
            if operation.parts:
                try:
                    video_data = operation.parts[0].inline_data.data
                    await message.answer_video(video=video_data, caption=f"🎬 {model_id} Result")
                except AttributeError:
                     await message.answer(f"Result: {operation.text}")

    except Exception as e:
        logger.error(f"Error handling WebApp data: {e}")
        await message.answer(f"❌ Ошибка генерации: {str(e)}")
