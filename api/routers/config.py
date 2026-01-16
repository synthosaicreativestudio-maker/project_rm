from fastapi import APIRouter
from config.ui_config import UI_CONFIG

router = APIRouter()

@router.get("/")
async def get_config():
    return UI_CONFIG
