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

    # Use configured WEBAPP_URL or GitHub Pages as base
    webapp_url = settings.WEBAPP_URL or "https://synthosaicreativestudio-maker.github.io/project_rm/" 

    from aiogram.types import ReplyKeyboardMarkup, KeyboardButton, WebAppInfo

    # ReplyKeyboardMarkup is REQUIRED for tg.sendData() to work
    kb = ReplyKeyboardMarkup(keyboard=[
        [KeyboardButton(text="🚀 Открыть Студию", web_app=WebAppInfo(url=webapp_url))]
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
                f"Я — <b>Project_RM</b>, твой персональный AI-помощник.\n\n"
                f"💡 <b>Как пользоваться:</b>\n"
                f"1. Нажми кнопку <b>🚀 Открыть Студию</b> ниже.\n"
                f"2. Выбери, что хочешь создать (фото или видео).\n"
                f"3. Нажми 'Сгенерировать' — я сразу приступлю к работе!\n\n"
                f"Жду твой первый промпт! 🚀",
                reply_markup=kb
            )
        else:
            await message.answer(
                f"С возвращением, {hbold(full_name)}! 👋\n\n"
                f"Нажми <b>🚀 Открыть Студию</b>, чтобы начать творить.",
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
                await wait_message.edit_text(response, parse_mode=ParseMode.HTML)
            except Exception:
                # Fallback if HTML parsing fails
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
            await wait_message.edit_text(response, parse_mode=ParseMode.HTML)
        else:
            await wait_message.edit_text("Sorry, I couldn't generate a response.")
    except Exception as e:
        await wait_message.edit_text(f"An error occurred: {str(e)}")
