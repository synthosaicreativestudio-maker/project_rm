import asyncio
import logging
from aiogram import Bot, Dispatcher
from aiogram.enums import ParseMode
from aiogram.client.default import DefaultBotProperties

from config.settings import settings

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def main():
    logger.info("Starting Project_RM...")
    
    if not settings.BOT_TOKEN:
        logger.error("BOT_TOKEN is not set!")
        return

    bot = Bot(token=settings.BOT_TOKEN, default=DefaultBotProperties(parse_mode=ParseMode.HTML))
    dp = Dispatcher()

    @dp.update.outer_middleware
    async def log_update_middleware(handler, event, data):
        if event.message:
            print(f"DEBUG: Received message: {event.message.content_type}")
            if event.message.web_app_data:
                print(f"DEBUG: WebApp Data: {event.message.web_app_data.data}")
        return await handler(event, data)

    from bot.handlers.admin import router as admin_router
    dp.include_router(admin_router)

    from bot.handlers.webapp_data import router as webapp_data_router
    dp.include_router(webapp_data_router)

    from bot.handlers.common import router as common_router
    dp.include_router(common_router)

    from database.db import init_db
    await init_db()

    try:
        # Drops pending updates and ensures the bot starts fresh
        await bot.delete_webhook(drop_pending_updates=True)
        
        # Note: We are using sendData which requires the ReplyKeyboardMarkup from common.py
        # This is the primary and only interactive entry point for the Mini App.

    # Start polling
        logger.info("Start polling")
        await dp.start_polling(bot)
    except Exception as e:
        logger.error(f"Error starting bot: {e}")
    finally:
        await bot.session.close()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Bot stopped by user")
