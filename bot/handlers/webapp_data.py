import json
import logging
from aiogram import Router, F, types

from config.settings import settings

router = Router()
logger = logging.getLogger(__name__)

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

        safe_prompt = str(prompt)[:50] if prompt else "None"
        print(f"DEBUG REBOOT: Processing WebApp data: {action_type} | {safe_prompt}...")
        logger.info(f"Processing WebApp data: {action_type} | {safe_prompt}...")

        if action_type == 'image':
            from services.gemini import gemini_service
            
            model_id = settings.MODELS['image']
            aspect_ratio = params.get('aspectRatio', '1:1')
            
            await message.answer(f"🎨 Рисую изображение ({aspect_ratio})...\nПромт: <i>{safe_prompt}</i>")
            
            # Generate image
            image_bytes = await gemini_service.generate_image(prompt, aspect_ratio=aspect_ratio)
            
            if image_bytes:
                from aiogram.types import BufferedInputFile
                photo_file = BufferedInputFile(image_bytes, filename="generated.png")
                await message.answer_photo(photo=photo_file, caption=f"✨ Готово! Модель: {model_id}")
            else:
                await message.answer("❌ Ошибка: Не удалось сгенерировать изображение.")

        elif action_type == 'reference':
            from services.gemini import gemini_service
            import aiohttp
            import io
            from PIL import Image
            
            main_prompt = data.get('mainPrompt', '')
            references = data.get('references', [])
            
            # Отладочное логирование
            logger.info(f"[REFERENCE] Received {len(references)} references")
            for i, ref in enumerate(references):
                logger.info(f"[REFERENCE] Ref {i}: hasFile={ref.get('hasFile')}, url={ref.get('url')}, description={ref.get('description')}")
            
            await message.answer("🔄 Загружаю и обрабатываю референсы... Пожалуйста, подождите.")
            
            images = []
            async with aiohttp.ClientSession() as session:
                for i, ref in enumerate(references):
                    if ref.get('url'):
                        try:
                            logger.info(f"[REFERENCE] Downloading image {i} from {ref['url'][:50]}...")
                            async with session.get(ref['url']) as resp:
                                if resp.status == 200:
                                    img_data = await resp.read()
                                    img = Image.open(io.BytesIO(img_data))
                                    images.append(img)
                                    logger.info(f"[REFERENCE] Successfully loaded image {i}, size: {img.size}")
                                else:
                                    logger.error(f"[REFERENCE] HTTP {resp.status} for image {i}")
                        except Exception as e:
                            logger.error(f"Error downloading image {ref['url']}: {e}")
                    else:
                        logger.warning(f"[REFERENCE] Ref {i} has no URL (hasFile={ref.get('hasFile')}), skipping")

            logger.info(f"[REFERENCE] Successfully loaded {len(images)} images out of {len(references)} references")

            if not images and not main_prompt:
                await message.answer("❌ Недостаточно данных для генерации.")
                return

            # Build prompt from main_prompt and reference descriptions
            prompt_parts = []
            if main_prompt:
                prompt_parts.append(main_prompt)
            
            for ref in references:
                if ref.get('description') and ref.get('url'):
                    prompt_parts.append(f"From reference image: {ref['description']}")
            
            final_prompt = ". ".join(prompt_parts) if prompt_parts else "Generate an image based on the provided references"
            
            await message.answer(f"🎨 Генерирую изображение по {len(images)} референсам...")
            
            # Generate with references using new API
            aspect_ratio = params.get('aspectRatio', '9:16')
            resolution = params.get('resolution', '1K')
            image_bytes = await gemini_service.generate_image_with_references(
                prompt=final_prompt,
                reference_images=images,
                aspect_ratio=aspect_ratio,
                resolution=resolution
            )
            
            if image_bytes:
                from aiogram.types import BufferedInputFile
                photo_file = BufferedInputFile(image_bytes, filename="ref_generated.png")
                await message.answer_photo(
                    photo=photo_file, 
                    caption=f"✨ Готово по референсам!\nИзображений: {len(images)}\nСоотношение: {aspect_ratio}\nРазрешение: {resolution}"
                )
            else:
                await message.answer("❌ Не удалось сгенерировать финальное изображение.")

        elif action_type == 'video':
            from services.veo import veo_service
            
            model_id = settings.MODELS['video']
            await message.answer("🎥 Запускаю видео-генерацию (Veo)...\nЭто займет 1-2 минуты. Пожалуйста, подождите.")
            
            video_bytes = await veo_service.generate_video(prompt)
            
            if video_bytes:
                from aiogram.types import BufferedInputFile
                video_file = BufferedInputFile(video_bytes, filename="generated_video.mp4")
                await message.answer_video(video=video_file, caption=f"🎬 Ваше видео готово!\nПромт: <i>{safe_prompt}</i>")
            else:
                await message.answer("❌ Не удалось сгенерировать видео. \nВозможно, временная ошибка API или лимит генераций.")

    except Exception as e:
        logger.exception("Error in webapp_data handler")
        await message.answer(f"❌ Системная ошибка: {str(e)}")
