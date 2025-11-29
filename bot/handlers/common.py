from aiogram import Router, types
from aiogram.filters import CommandStart
from aiogram.enums import ParseMode
from aiogram.utils.markdown import hbold

router = Router()

@router.message(CommandStart())
async def command_start_handler(message: types.Message) -> None:
    """
    This handler receives messages with `/start` command
    """
    await message.answer(f"Hello, {hbold(message.from_user.full_name)}! \nWelcome to Project_RM (Gemini 3 Edition).")

@router.message()
async def chat_handler(message: types.Message) -> None:
    """
    Handler for text messages. Sends text to Gemini and returns the response.
    """
    from services.gemini import gemini_service
    
    if not message.text:
        return

    wait_message = await message.answer("Thinking...")
    
    try:
        response = await gemini_service.generate_text(message.text)
        if response:
            await wait_message.edit_text(response, parse_mode=ParseMode.MARKDOWN)
        else:
            await wait_message.edit_text("Sorry, I couldn't generate a response.")
    except Exception as e:
        await wait_message.edit_text(f"An error occurred: {str(e)}")

@router.message(lambda message: message.photo)
async def photo_handler(message: types.Message) -> None:
    """
    Handler for photo messages. Downloads photo and sends to Gemini with caption.
    """
    from services.gemini import gemini_service
    from PIL import Image

    if not message.caption:
        await message.answer("Please provide a caption for the image.")
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
