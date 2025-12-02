import os
import vertexai
from vertexai.preview.generative_models import GenerativeModel

# --- НАСТРОЙКИ ---
KEY_FILE = "marketing-469506-95611014aab8.json"
PROJECT_ID = "marketing-469506"
LOCATION = "us-central1"

# 1. Аутентификация
if os.path.exists(KEY_FILE):
    os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = KEY_FILE
    print(f"✅ Ключ найден: {KEY_FILE}")
else:
    print(f"❌ Ошибка: Файл {KEY_FILE} не найден!")
    exit()

# 2. Инициализация
try:
    vertexai.init(project=PROJECT_ID, location=LOCATION)
    print("✅ Vertex AI инициализирован.")
except Exception as e:
    print(f"❌ Ошибка init: {e}")
    exit()

# 3. Проверка Veo
model_name = "veo-3.1-fast-generate-001" # Or "veo-001" or similar
print(f"⏳ Подключение к {model_name}...")

try:
    model = GenerativeModel(model_name)
    print(f"\n🎉 УСПЕХ! Модель {model_name} инициализирована (через GenerativeModel).")
    
    prompt = "A cinematic drone shot of a futuristic city at sunset, cyberpunk style."
    print(f"🎥 Генерация видео по промпту: '{prompt}'...")
    
    # Veo generation might take time.
    response = model.generate_content(prompt)
    print("Response type:", type(response))
    print("Response:", response)
    
except Exception as e:
    print(f"\n❌ ОШИБКА: {e}")
