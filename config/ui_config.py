
UI_CONFIG = {
    "blocks": [
        {
            "id": "subject_block",
            "title": "1. Сюжет (База)",
            "fields": [
                {
                    "id": "subject",
                    "label": "Субъект",
                    "type": "select-or-type",
                    "placeholder": "Кто или что в кадре?",
                    "options": ["Портрет девушки", "Футуристический автомобиль", "Кот в костюме"]
                },
                {
                    "id": "action",
                    "label": "Действие",
                    "type": "select-or-type",
                    "placeholder": "Что делает?",
                    "options": ["Стоит", "Бежит", "Летит", "Сидит", "Танцует"]
                },
                {
                    "id": "environment",
                    "label": "Окружение",
                    "type": "select-or-type",
                    "placeholder": "Где находится?",
                    "options": ["Студийный фон", "Улица", "Космос", "Интерьер", "Природа"]
                }
            ]
        },
        {
            "id": "style_block",
            "title": "2. Стилизация (Visuals)",
            "fields": [
                {
                    "id": "style",
                    "label": "Стиль",
                    "type": "select",
                    "options": [
                        "Фотореализм",
                        "Студийное фото",
                        "3D Рендер (Pixar / Disney)",
                        "Киберпанк",
                        "Аниме / Манга",
                        "Масляная живопись",
                        "Акварельный рисунок",
                        "Карандашный набросок",
                        "Векторная иллюстрация",
                        "Полароид (Винтаж)"
                    ]
                },
                {
                    "id": "materials",
                    "label": "Материалы",
                    "type": "select-or-type",
                    "placeholder": "Из чего сделано?",
                    "options": [
                        "Реалистичная кожа (Human Skin)",
                        "Глянцевый пластик (Glossy Plastic)",
                        "Матовый пластик (Matte Plastic)",
                        "Матовая глина (Clay)",
                        "Шлифованный металл (Brushed Metal)",
                        "Ржавый металл (Rusted Metal)",
                        "Золото / Хром (Gold/Chrome)",
                        "Стекло / Хрусталь (Glass)",
                        "Мягкая ткань / Шелк (Silk/Fabric)",
                        "Грубый камень / Бетон (Concrete)",
                        "Карбон (Carbon Fiber)",
                        "Неоновые трубки (Neon Tubes)",
                        "Мех / Пух (Fur/Fluffy)",
                        "Органическая слизь (Organic Slime)"
                    ]
                },
                {
                    "id": "lighting",
                    "label": "Освещение",
                    "type": "select-or-type",
                    "placeholder": "Какой свет?",
                    "options": [
                        "Мягкий дневной свет (Soft Daylight)",
                        "Студийный свет (Softbox)",
                        "Жесткое солнце (Hard Sunlight)",
                        "Золотой час (Golden Hour)",
                        "Синий час (Blue Hour)",
                        "Кинематографичное (Cinematic/Low key)",
                        "Неоновый свет (Neon)",
                        "Рембрандтовский свет (Rembrandt)",
                        "Объемные лучи (God Rays)"
                    ]
                },
                {
                    "id": "colors",
                    "label": "Цветовая гамма",
                    "type": "select-or-type",
                    "placeholder": "Какие цвета?",
                    "options": [
                        "Теплая / Пастельная (Warm/Pastel)",
                        "Холодная / Мрачная (Cold/Moody)",
                        "Черно-белая (Noir/Monochrome)",
                        "Яркая / Кислотная (Vivid/Acid)",
                        "Приглушенная / Винтажная (Muted/Vintage)",
                        "Teal & Orange (Кино-блокбастер)",
                        "Vaporwave (Розовый/Бирюзовый)",
                        "Готическая (Черный/Красный)",
                        "Землистая (Коричневый/Зеленый)"
                    ]
                }
            ]
        },
        {
            "id": "camera_block",
            "title": "3. Камера (Camera Tech)",
            "fields": [
                {
                    "id": "camera_angle",
                    "label": "Ракурс",
                    "type": "select",
                    "options": [
                        "На уровне глаз (Eye Level)",
                        "Вид снизу (Low Angle)",
                        "Вид сверху (High Angle)",
                        "Вид с дрона (Bird's Eye)",
                        "Вид с земли (Worm's Eye)",
                        "Вид из глаз (POV)",
                        "Селфи (Selfie)",
                        "Из-за плеча (Over-the-shoulder)",
                        "Голландский угол (Dutch Angle/Tilt)"
                    ]
                },
                {
                    "id": "shot_size",
                    "label": "Крупность плана",
                    "type": "select",
                    "options": [
                        "Экстремально крупный (Macro/Eye detail)",
                        "Крупный план (Close-up Face)",
                        "Портрет по плечи (Portrait)",
                        "Средний план (Medium Shot / Waist up)",
                        "Ковбойский план (Knees up)",
                        "Полный рост (Full Body)",
                        "Общий план (Wide Shot)",
                        "Дальний план (Extreme Long Shot)"
                    ]
                },
                {
                    "id": "focus",
                    "label": "Фокус и Глубина",
                    "type": "select",
                    "options": [
                        "Размытый фон (Bokeh / f1.8)",
                        "Всё в резкости (Deep Focus / f22)",
                        "Макро-съемка (Macro Lens)",
                        "Тилт-шифт (Tilt-Shift / Miniature effect)",
                        "Размытие в движении (Motion Blur)"
                    ]
                }
            ]
        },
        {
            "id": "filters_block",
            "title": "4. Фильтры (Filters)",
            "fields": [
                {
                    "id": "negative_prompt",
                    "label": "Негативный промпт",
                    "type": "select-or-type",
                    "placeholder": "Чего НЕ надо?",
                    "options": [
                        "Стандартный фильтр (Убрать уродства, мусор, артефакты)",
                        "Без текста (Убрать водяные знаки, подписи, логотипы)",
                        "Только HD (Убрать размытие, шум, низкое качество)",
                        "Анатомический фильтр (Исправить пальцы, лишние конечности — для людей)",
                        "Композиционный (Без обрезки головы, объект в центре)",
                        "Без людей (Только пейзаж/фон)",
                        "Без 3D/Мультяшности (Только фотореализм)"
                    ]
                }
            ]
        }
    ]
}
