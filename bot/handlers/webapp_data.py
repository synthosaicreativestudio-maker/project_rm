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
            # Add style params if needed, e.g. "Cinematic style: " + prompt
            
            response = await asyncio.to_thread(model.generate_content, prompt)
            
            print(f"DEBUG: Image Response: {response}")
            try:
                if response.parts:
                    img_data = response.parts[0].inline_data.data
                    await message.answer_photo(photo=img_data, caption=f"Модель: {model_id}")
                else:
                    await message.answer(f"Результат (без частей): {response.text}", parse_mode=None)
            except Exception as e:
                print(f"DEBUG: Error parsing image response: {e}")
                await message.answer(f"Ошибка обработки ответа: {e}", parse_mode=None)

        elif action_type == 'video':
            # Veo 3.1 Preview Logic
            model_id = settings.MODELS['video']
            duration = int(params.get('duration', 4))
            
            await message.answer(f"🎥 {model_id} начала рендеринг ({duration}s)...", parse_mode=None)
            
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
                    await message.answer_video(video=video_data, caption=f"🎬 {model_id}: Готово")
                except AttributeError:
                     await message.answer(f"Результат: {operation.text}", parse_mode=None)

    except Exception as e:
        logger.error(f"Error handling WebApp data: {e}")
        await message.answer(f"❌ Ошибка генерации: {str(e)}", parse_mode=None)
