import logging
from aiohttp import web
from aiogram import Router
from services.gemini import gemini_service
from config.ui_config import UI_CONFIG

router = Router()
logger = logging.getLogger(__name__)

# Since we are using a bot, we don't have a traditional HTTP API framework like FastAPI here.
# However, the Mini App sends data via `sendData` which is received as a Service Message in Telegram,
# OR it makes HTTP requests if we run a web server.
#
# BUT, the current `App.tsx` tries to `fetch('http://localhost:8000/api/chat/')`.
# The current bot is just polling Telegram, it is NOT running an HTTP server for the WebApp to hit directly.
#
# CRITICAL ARCHITECTURE FIX:
# The Mini App (frontend) cannot directly talk to the Bot (backend) via HTTP unless we run an HTTP server (aiohttp/FastAPI).
# `aiogram` supports webhooks, which can double as a server, but we are using polling.
#
# TEMPORARY SOLUTION FOR MVP (Localhost):
# We need to run a simple HTTP server alongside the bot to handle these requests, 
# OR we switch the Mini App to use `Telegram.WebApp.sendData()` to send data back to the chat.
#
# Given the user wants "Interactive" features (AI Assistant in the app), `sendData` is bad because it closes the app.
# We MUST run an HTTP server.
#
# I will modify `bot/main.py` to run `aiohttp` server for API endpoints.

async def handle_chat(request):
    try:
        data = await request.json()
        user_message = data.get('message', '')
        # In a real app, we'd verify initData here
        
        response_text = await gemini_service.generate_text(user_message)
        return web.json_response({'response': response_text})
    except Exception as e:
        logger.error(f"Error in handle_chat: {e}")
        return web.json_response({'response': f"Error: {str(e)}"}, status=500)

async def handle_enhance_prompt(request):
    try:
        data = await request.json()
        prompt = data.get('prompt', '')
        media_type = data.get('type', 'image') # 'image' or 'video'
        
        enhancement_instruction = f"""
        Act as a professional {media_type} prompt engineer. 
        Enhance the following user prompt to be more cinematic, detailed, and artistic.
        Keep it concise but descriptive.
        User Prompt: "{prompt}"
        """
        
        enhanced_prompt = await gemini_service.generate_text(enhancement_instruction)
        return web.json_response({'enhanced_prompt': enhanced_prompt})
    except Exception as e:
        logger.error(f"Error in handle_enhance_prompt: {e}")
        return web.json_response({'enhanced_prompt': f"Error: {str(e)}"}, status=500)

async def handle_generate_image(request):
    # Mock generation
    return web.json_response({'status': 'success', 'message': 'Image generation started... (Simulation)'})

async def handle_generate_video(request):
    # Mock generation
    return web.json_response({'status': 'success', 'message': 'Video generation started... (Simulation)'})



async def handle_config(request):
    return web.json_response(UI_CONFIG)

def setup_web_routes(app):
    app.router.add_post('/api/chat/', handle_chat)
    app.router.add_post('/api/enhance-prompt/', handle_enhance_prompt)
    app.router.add_post('/api/generate-image/', handle_generate_image)
    app.router.add_post('/api/generate-video/', handle_generate_video)
    app.router.add_get('/api/config', handle_config)
    
    # CORS setup (basic)
    import aiohttp_cors
    cors = aiohttp_cors.setup(app, defaults={
        "*": aiohttp_cors.ResourceOptions(
            allow_credentials=True,
            expose_headers="*",
            allow_headers="*",
        )
    })
    
    for route in list(app.router.routes()):
        cors.add(route)
