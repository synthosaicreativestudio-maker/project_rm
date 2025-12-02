from aiogram import Router, types
from aiogram.filters import CommandStart
from aiogram.enums import ParseMode
from aiogram.utils.markdown import hbold
from aiogram.types import WebAppInfo
from sqlalchemy import select
from database.db import get_db
from database.models import User
from config.settings import settings

router = Router()

@router.message(CommandStart())
async def command_start_handler(message: types.Message) -> None:
    """
    This handler receives messages with `/start` command
    """
    user_id = message.from_user.id
    username = message.from_user.username
    full_name = message.from_user.full_name

    # Use configured WEBAPP_URL or a placeholder if not set
    webapp_url = settings.WEBAPP_URL or "https://google.com" 

    from aiogram.types import ReplyKeyboardMarkup, KeyboardButton

    # Use ReplyKeyboardMarkup for sendData compatibility
    kb = ReplyKeyboardMarkup(keyboard=[
        [KeyboardButton(text="🚀 Open App", web_app=WebAppInfo(url=webapp_url))]
    ], resize_keyboard=True)

    async for session in get_db():
        result = await session.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()

        if not user:
            user = User(id=user_id, username=username, full_name=full_name)
            session.add(user)
            await session.commit()
            await message.answer(
                f"Привет, {hbold(full_name)}! 👋\n\n"
                f"Я — <b>Project_RM</b>, твой персональный AI-консультант и креативный партнер.\n\n"
                f"<b>Чем я могу помочь?</b>\n"
                f"🎨 <b>Генерация:</b> Нажми кнопку <b>🚀 Open App</b> внизу экрана, чтобы создавать фото и видео.\n"
                f"🧠 <b>Идеи:</b> Напиши мне тему, и я придумаю сценарий или промт.\n"
                f"✨ <b>Улучшение:</b> Я помогу докрутить твои идеи до идеала.\n\n"
                f"Нажми кнопку в меню клавиатуры, чтобы начать! 🚀",
                reply_markup=kb
            )
        else:
            await message.answer(
                f"С возвращением, {hbold(full_name)}! 👋\nРад тебя видеть снова!",
                reply_markup=kb
            )

@router.message(lambda message: message.text and not message.text.startswith('/'))
async def chat_handler(message: types.Message) -> None:
    """
    Handler for text messages. Checks balance, deducts credit, and sends to Gemini.
    """
    from services.gemini import gemini_service
    
    # user_id = message.from_user.id
    
    # user_id = message.from_user.id
    
    wait_message = await message.answer("Думаю...")
    
    try:
        response = await gemini_service.generate_text(message.text)
        if response:
            try:
                await wait_message.edit_text(response, parse_mode=ParseMode.MARKDOWN)
            except Exception:
                # Fallback if Markdown parsing fails
                await wait_message.edit_text(response, parse_mode=None)
        else:
            await wait_message.edit_text("Извините, не удалось сгенерировать ответ.")
    except Exception as e:
        await wait_message.edit_text(f"Произошла ошибка: {str(e)}", parse_mode=None)

@router.message(lambda message: message.photo)
async def photo_handler(message: types.Message) -> None:
    """
    Handler for photo messages. Checks balance, deducts credit, and sends to Gemini.
    """
    from services.gemini import gemini_service
    from PIL import Image

    if not message.caption:
        await message.answer("Пожалуйста, добавьте описание к фото.")
        return



    wait_message = await message.answer("Analyzing image...")

    try:
        # Download the largest photo
        photo = message.photo[-1]
        bot = message.bot
        file = await bot.get_file(photo.file_id)
        file_content = await bot.download_file(file.file_path)
        
        image = Image.open(file_content)
        
        response = await gemini_service.generate_multimodal(message.caption, [image])
        
        if response:
            await wait_message.edit_text(response, parse_mode=ParseMode.MARKDOWN)
        else:
            await wait_message.edit_text("Sorry, I couldn't generate a response.")
    except Exception as e:
        await wait_message.edit_text(f"An error occurred: {str(e)}")
