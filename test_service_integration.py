import asyncio
import logging
from services.gemini import gemini_service
from services.veo import veo_service
from config.settings import settings

# Configure logging
logging.basicConfig(level=logging.INFO)

async def test_gemini():
    print("\n--- Testing Gemini Service ---")
    print(f"Model: {settings.MODELS['text']}")
    prompt = "Hello, are you online?"
    try:
        response = await gemini_service.generate_text(prompt)
        if response:
            print(f"✅ Gemini Response: {response}")
        else:
            print("❌ Gemini returned None")
    except Exception as e:
        print(f"❌ Gemini Error: {e}")

async def test_veo():
    print("\n--- Testing Veo Service ---")
    print(f"Model: {settings.MODELS['video']}")
    # We expect initialization to work, but generation might fail with Quota Exceeded
    if veo_service.model:
        print("✅ Veo Model Initialized")
    else:
        print("❌ Veo Model NOT Initialized")
        
    # Optional: Try generation to confirm Quota error (which means auth worked)
    prompt = "Test video"
    try:
        print("Attempting generation (expecting Quota Exceeded)...")
        # We won't await if it hangs, but Veo usually fails fast on quota
        # However, generate_video in service is async but calls sync generate_content?
        # Let's check veo.py implementation.
        # It calls self.model.generate_content(prompt) which is sync blocking.
        # We should wrap it in to_thread in the service, but for now let's just call it.
        # Wait, veo_service.generate_video is async defined but calls sync method.
        # It might block the loop.
        
        # Actually, let's just check if we can call it.
        # Since we are in a script, blocking is fine.
        res = await veo_service.generate_video(prompt)
        print(f"Veo Result: {res}")
    except Exception as e:
        print(f"Veo Exception: {e}")

async def main():
    await test_gemini()
    await test_veo()

if __name__ == "__main__":
    asyncio.run(main())
