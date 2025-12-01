from aiogram import Router, types
from aiogram.filters import CommandStart
from aiogram.enums import ParseMode
from aiogram.utils.markdown import hbold
from aiogram.types import WebAppInfo, InlineKeyboardMarkup, InlineKeyboardButton
from sqlalchemy import select
from database.db import get_db
from database.models import User, Transaction
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

    kb = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="🚀 Open App", web_app=WebAppInfo(url=webapp_url))]
    ])

    async for session in get_db():
        result = await session.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()

        if not user:
            user = User(id=user_id, username=username, full_name=full_name)
            session.add(user)
            # Add initial transaction
            transaction = Transaction(user_id=user_id, amount=10, description="Welcome Bonus")
            session.add(transaction)
            await session.commit()
            await message.answer(
                f"Привет, {hbold(full_name)}! 👋\n\n"
                f"Я — **Project_RM**, твой персональный AI-консультант и креативный партнер.\n\n"
                f"**Чем я могу помочь?**\n"
                f"🎨 **Генерация:** Открой Mini App (кнопка ниже), чтобы создавать фото и видео.\n"
                f"🧠 **Идеи:** Напиши мне тему, и я придумаю сценарий или промт.\n"
                f"✨ **Улучшение:** Я помогу докрутить твои идеи до идеала.\n\n"
                f"Просто напиши мне или нажми кнопку, чтобы начать творить! 🚀",
                reply_markup=kb
            )
        else:
            await message.answer(
                f"Welcome back, {hbold(full_name)}! \nBalance: {user.balance} credits.",
                reply_markup=kb
            )

@router.message(lambda message: message.text and not message.text.startswith('/'))
async def chat_handler(message: types.Message) -> None:
    """
    Handler for text messages. Checks balance, deducts credit, and sends to Gemini.
    """
    from services.gemini import gemini_service
    
    user_id = message.from_user.id
    
    async for session in get_db():
        result = await session.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        
        if not user or user.balance <= 0:
            await message.answer("Insufficient funds. Please top up your balance.")
            return

        wait_message = await message.answer("Thinking...")
        
        try:
            response = await gemini_service.generate_text(message.text)
            if response:
                # Deduct credit
                user.balance -= 1
                transaction = Transaction(user_id=user_id, amount=-1, description="Text Generation")
                session.add(transaction)
                await session.commit()
                
                try:
                    await wait_message.edit_text(response, parse_mode=ParseMode.MARKDOWN)
                except Exception:
                    # Fallback if Markdown parsing fails
                    await wait_message.edit_text(response, parse_mode=None)
            else:
                await wait_message.edit_text("Sorry, I couldn't generate a response.")
        except Exception as e:
            await wait_message.edit_text(f"An error occurred: {str(e)}", parse_mode=None)

@router.message(lambda message: message.photo)
async def photo_handler(message: types.Message) -> None:
    """
    Handler for photo messages. Checks balance, deducts credit, and sends to Gemini.
    """
    from services.gemini import gemini_service
    from PIL import Image

    if not message.caption:
        await message.answer("Please provide a caption for the image.")
        return

    user_id = message.from_user.id

    async for session in get_db():
        result = await session.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        
        if not user or user.balance <= 0:
            await message.answer("Insufficient funds. Please top up your balance.")
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
                # Deduct credit
                user.balance -= 1
                transaction = Transaction(user_id=user_id, amount=-1, description="Image Analysis")
                session.add(transaction)
                await session.commit()

                await wait_message.edit_text(response, parse_mode=ParseMode.MARKDOWN)
            else:
                await wait_message.edit_text("Sorry, I couldn't generate a response.")
        except Exception as e:
            await wait_message.edit_text(f"An error occurred: {str(e)}")
