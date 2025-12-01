import os
import asyncio
import google.generativeai as genai
from dotenv import load_dotenv

# Load env
load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    print("❌ Error: GEMINI_API_KEY not found in .env")
    exit(1)

genai.configure(api_key=API_KEY)

async def test_text():
    print("\n--- Testing Text Generation (gemini-3-pro-preview) ---")
    try:
        model = genai.GenerativeModel("gemini-3-pro-preview")
        response = await asyncio.to_thread(model.generate_content, "Hello, are you working?")
        print(f"✅ Success! Response: {response.text[:50]}...")
    except Exception as e:
        print(f"❌ Text Gen Failed: {e}")

async def test_image():
    print("\n--- Testing Image Generation (nano-banana-pro-preview) ---")
    try:
        model = genai.GenerativeModel("nano-banana-pro-preview")
        # Note: 'generate_content' might not be the right method for image models if they are legacy or specific
        # But we test what the bot uses.
        response = await asyncio.to_thread(model.generate_content, "A cute robot cat")
        
        print("Response type:", type(response))
        if response.parts:
            print(f"✅ Parts found: {len(response.parts)}")
            part = response.parts[0]
            if hasattr(part, 'inline_data'):
                print(f"✅ Inline Data found! Mime: {part.inline_data.mime_type}, Size: {len(part.inline_data.data)} bytes")
            else:
                print("⚠️ No inline_data in part. Part content:", part)
        else:
            print("⚠️ No parts in response. Text:", response.text)
            
    except Exception as e:
        print(f"❌ Image Gen Failed: {e}")

async def main():
    await test_text()
    await test_image()

if __name__ == "__main__":
    asyncio.run(main())
