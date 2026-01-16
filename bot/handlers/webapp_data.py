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

        print(f"DEBUG REBOOT: Processing WebApp data: {action_type} | {prompt[:50]}...")
        logger.info(f"Processing WebApp data: {action_type} | {prompt[:50]}...")

        if action_type == 'image':
            from services.gemini import gemini_service
            
            model_id = settings.MODELS['image']
            aspect_ratio = params.get('aspectRatio', '1:1')
            
            await message.answer(f"🎨 Рисую изображение ({aspect_ratio})...\nПромт: <i>{prompt[:100]}</i>")
            
            # Generate image
            image_bytes = await gemini_service.generate_image(prompt, aspect_ratio=aspect_ratio)
            
            if image_bytes:
                from aiogram.types import BufferedInputFile
                photo_file = BufferedInputFile(image_bytes, filename="generated.png")
                await message.answer_photo(photo=photo_file, caption=f"✨ Готово! Модель: {model_id}")
            else:
                await message.answer("❌ Ошибка: Не удалось сгенерировать изображение.")

        elif action_type == 'video':
            from services.veo import veo_service
            
            model_id = settings.MODELS['video']
            await message.answer(f"🎥 Запускаю видео-генерацию (Veo)...\nЭто займет 1-2 минуты. Пожалуйста, подождите.")
            
            video_bytes = await veo_service.generate_video(prompt)
            
            if video_bytes:
                 from aiogram.types import BufferedInputFile
                 video_file = BufferedInputFile(video_bytes, filename="generated_video.mp4")
                 await message.answer_video(video=video_file, caption=f"🎬 Ваше видео готово!\nПромт: <i>{prompt[:50]}...</i>")
            else:
                 await message.answer("❌ Не удалось сгенерировать видео. \nВозможно, временная ошибка API или лимит генераций.")

    except Exception as e:
        logger.error(f"Error in reboot webapp_data handler: {e}")
        await message.answer(f"❌ Системная ошибка: {str(e)}")
