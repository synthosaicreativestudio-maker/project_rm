import logging
from aiohttp import web
from aiogram import Router
from services.gemini import gemini_service
from config.ui_config import UI_CONFIG
from services.veo import veo_service

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
    try:
        data = await request.json()
        prompt = data.get('prompt', '')
        params = data.get('params', {})
        resolution = params.get('resolution', '1K')
        aspect_ratio = params.get('aspectRatio', '1:1')

        logger.info(f"IMAGE GEN REQUEST: Prompt='{prompt}', Params={{'resolution': '{resolution}', 'aspectRatio': '{aspect_ratio}'}}")

        # Mock generation
        return web.json_response({'status': 'success', 'message': f'Image generation started for: {prompt} ({resolution}, {aspect_ratio})'})
    except Exception as e:
        logger.error(f"Error in handle_generate_image: {e}")
        return web.json_response({'status': 'error', 'message': str(e)}, status=500)


async def handle_generate_video(request):
    try:
        data = await request.json()
        prompt = data.get('prompt', '')
        
        if not prompt:
            return web.json_response({'status': 'error', 'message': 'Prompt is required'}, status=400)

        # Start generation (async)
        # Note: In a real production app, we should use a task queue (Celery/Redis) because this takes time.
        # For this MVP, we might await it (blocking the request) or run it in background.
        # Since Veo is slow, blocking the HTTP request might timeout the WebApp.
        # However, for now, let's try to await it and see, or return a "started" status and handle it via webhook/polling if possible.
        # But the WebApp expects a response.
        
        # Let's await it for now, assuming the user waits or we return a "job started" ID.
        # But the current frontend likely expects the result or a confirmation.
        
        # Given the "Mock" returned "Video generation started...", let's keep that pattern but actually start it?
        # No, if we return "started", the user won't get the video in the WebApp unless we have a way to push it back.
        # The WebApp might be polling or waiting.
        
        # Let's try to generate and return the result (URI).
        video_uri = await veo_service.generate_video(prompt)
        
        if video_uri:
             return web.json_response({'status': 'success', 'video_uri': video_uri})
        else:
             return web.json_response({'status': 'error', 'message': 'Generation failed or quota exceeded'}, status=500)

    except Exception as e:
        logger.error(f"Error in handle_generate_video: {e}")
        return web.json_response({'status': 'error', 'message': str(e)}, status=500)



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
