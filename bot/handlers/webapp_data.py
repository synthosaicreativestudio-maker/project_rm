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

        print(f"DEBUG: Received WebApp data: {action_type} | {prompt}") # Debug print
        logger.info(f"Received WebApp data: {action_type} | {prompt[:50]}...")

        # Feedback to user
        await message.answer(f"✅ Задача получена: {action_type.upper()}\nПромт: {prompt[:50]}...", parse_mode=None)

        if action_type == 'text':
            # Gemini 3.0 Pro Logic
            model_id = settings.MODELS['text']
            model = genai.GenerativeModel(model_id)
            
            # Run blocking generation in thread
            response = await asyncio.to_thread(model.generate_content, prompt)
            await message.answer(response.text, parse_mode=None)

        elif action_type == 'image':
            # Nanabanana Pro Logic
            model_id = settings.MODELS['image']
            await message.answer(f"🎨 {model_id} рисует...", parse_mode=None)
            
            model = genai.GenerativeModel(model_id)
            # Extract params
            aspect_ratio = params.get('aspectRatio', '1:1')
            
            # Map UI aspect ratio to Gemini API format if needed
            # Assuming Gemini accepts "1:1", "16:9", etc. or needs specific string
            
            generation_config = genai.types.GenerationConfig(
                media_resolution="media_resolution_unspecified", # or specific enum
                aspect_ratio=aspect_ratio
            )

            response = await asyncio.to_thread(
                model.generate_content, 
                prompt, 
                generation_config=generation_config
            )
            
            print(f"DEBUG: Image Response: {response}")
            try:
                if response.parts:
                    img_data = response.parts[0].inline_data.data
                    # Fix: Wrap bytes in BufferedInputFile for aiogram 3.x
                    from aiogram.types import BufferedInputFile
                    photo_file = BufferedInputFile(img_data, filename="generated_image.jpg")
                    
                    await message.answer_photo(photo=photo_file, caption=f"Модель: {model_id}")
                else:
                    await message.answer(f"Результат (без частей): {response.text}", parse_mode=None)
            except Exception as e:
                print(f"DEBUG: Error parsing image response: {e}")
                await message.answer(f"Ошибка обработки ответа: {e}", parse_mode=None)

        elif action_type == 'video':
            # Veo 3.1 Preview Logic
            from services.veo import veo_service
            
            model_id = settings.MODELS['video']
            duration = int(params.get('duration', 4))
            
            await message.answer(f"🎥 {model_id} начала рендеринг ({duration}s)...", parse_mode=None)
            
            # Use the service
            # Note: The service currently doesn't support duration param in generate_video, 
            # but we can add it or just ignore it for now as Veo default is usually fixed or prompt-based.
            # We should pass the prompt.
            
            video_uri = await veo_service.generate_video(prompt)
            
            if video_uri:
                 # If it's a URI (e.g. GCS), we might need to download it or send it as a link.
                 # For now, assuming it returns something we can send or a text description if it's a raw response object.
                 await message.answer(f"🎬 Готово! Результат: {video_uri}", parse_mode=None)
            else:
                 await message.answer("❌ Не удалось сгенерировать видео (возможно, превышена квота).", parse_mode=None)

    except Exception as e:
        logger.error(f"Error handling WebApp data: {e}")
        await message.answer(f"❌ Ошибка генерации: {str(e)}", parse_mode=None)
