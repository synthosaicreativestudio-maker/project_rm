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

    from bot.handlers.admin import router as admin_router
    dp.include_router(admin_router)

    from bot.handlers.common import router as common_router
    dp.include_router(common_router)

    from database.db import init_db
    await init_db()

    try:
        await bot.delete_webhook(drop_pending_updates=True)
        
    # Set Menu Button
        from aiogram.types import MenuButtonWebApp, WebAppInfo
        webapp_url = settings.WEBAPP_URL or "https://google.com"
        await bot.set_chat_menu_button(
            menu_button=MenuButtonWebApp(text="Open App", web_app=WebAppInfo(url=webapp_url))
        )
        
        # Start API Server
        from aiohttp import web
        from bot.handlers.webapp_api import setup_web_routes
        
        app = web.Application()
        setup_web_routes(app)
        
        runner = web.AppRunner(app)
        await runner.setup()
        site = web.TCPSite(runner, 'localhost', 8000)
        await site.start()
        logger.info("API Server started on http://localhost:8000")

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
