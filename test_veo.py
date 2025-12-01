import os
import vertexai
from vertexai.preview.vision_models import VideoGenerationModel

# --- НАСТРОЙКИ ---
KEY_FILE = "marketing-469506-95611014aab8.json" # Важно: имя должно совпадать с вашим файлом
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
    print(f"✅ Vertex AI инициализирован.")
except Exception as e:
    print(f"❌ Ошибка init: {e}")
    exit()

# 3. Проверка Veo
model_name = "veo-3.1-fast-generate-001"
print(f"⏳ Подключение к {model_name}...")

try:
    model = VideoGenerationModel.from_pretrained(model_name)
    print("\n🎉 УСПЕХ! Доступ есть. Veo 3.1 готов к работе.")
except Exception as e:
    print(f"\n❌ ОШИБКА: {e}")
