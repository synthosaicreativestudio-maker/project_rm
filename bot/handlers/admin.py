from aiogram import Router
from aiogram.filters import Filter, Command
from aiogram.types import Message
from config.settings import settings

router = Router()

class IsAdmin(Filter):
    async def __call__(self, message: Message) -> bool:
        return message.from_user.id in settings.ADMIN_IDS

@router.message(Command("admin"), IsAdmin())
async def admin_start(message: Message):
    await message.answer("Welcome, Admin! You have access to the admin panel.")
