import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Image as ImageIcon, Video, Sparkles, Upload, X, ChevronDown, Layers } from 'lucide-react'



interface Field {
    id: string
    label: string
    type: 'text' | 'select' | 'select-or-type' | 'multi-select'
    placeholder?: string
    options?: string[]
}

interface Block {
    id: string
    title: string
    fields: Field[]
}

interface Config {
    blocks: Block[]
}

function App() {
    const [activeTab, setActiveTab] = useState<'image' | 'video' | 'reference'>('image')
    // const [input, setInput] = useState('') // Removed chat input
    // const [isLoading, setIsLoading] = useState(false) // Removed due to lack of use in simplified version

    // Dynamic State
    const [config, setConfig] = useState<Config | null>(null)
    const [formData, setFormData] = useState<Record<string, string | string[]>>({})

    // Video State (kept separate as it's not fully dynamic in this spec yet, or is it?)
    // The spec focuses on Image Gen. Video Gen seems to be separate.
    const [videoPrompt, setVideoPrompt] = useState('')
    const [videoOrientation, setVideoOrientation] = useState('9:16')
    const [videoRef, setVideoRef] = useState<File | null>(null)

    // Reference Tab State
    const [refFiles, setRefFiles] = useState<(File | null)[]>([null, null, null])
    const [refPrompts, setRefPrompts] = useState<string[]>(['', '', ''])
    const [mainRefPrompt, setMainRefPrompt] = useState('')

    // Simplified Config for Local UI
    const fallbackConfig: Config = {
        blocks: [
            {
                id: "subject_block",
                title: "1. Сюжет (База)",
                fields: [
                    { id: "subject", label: "Субъект", type: "select-or-type", placeholder: "Кто или что в кадре?", options: ["Портрет девушки", "Футуристический автомобиль", "Кот в костюме"] },
                    { id: "action", label: "Действие", type: "select-or-type", placeholder: "Что делает?", options: ["Стоит", "Бежит", "Летит", "Сидит", "Танцует"] },
                    { id: "environment", label: "Окружение", type: "select-or-type", placeholder: "Где находится?", options: ["Студийный фон", "Улица", "Космос", "Интерьер", "Природа"] },
                    { id: "time_of_day", label: "Время суток", type: "select-or-type", placeholder: "Когда происходит действие?", options: ["Рассвет (Dawn)", "Утро (Morning)", "Золотой час (Golden Hour)", "Полдень (Noon)", "Закат (Sunset)", "Синий час (Blue Hour)", "Сумерки (Twilight)", "Ночь (Night)"] }
                ]
            },
            {
                id: "style_block",
                title: "2. Стилизация (Visuals)",
                fields: [
                    { id: "style", label: "Стиль", type: "select", options: ["Фотореализм", "Студийное фото", "3D Рендер (Pixar / Disney)", "Киберпанк", "Аниме / Манга", "Масляная живопись", "Акварельный рисунок", "Карандашный набросок", "Векторная иллюстрация", "Полароид (Винтаж)"] },
                    { id: "atmosphere", label: "Сеттинг/Атмосфера", type: "select-or-type", placeholder: "Какое настроение?", options: ["Киберпанк", "Нуар (Noir)", "Фэнтези", "Минимализм", "Ретрофутуризм", "Уютный (Cozy)", "Постапокалипсис", "Сказочный"] },
                    { id: "materials", label: "Материалы", type: "select-or-type", placeholder: "Из чего сделано?", options: ["Реалистичная кожа (Human Skin)", "Глянцевый пластик (Glossy Plastic)", "Матовый пластик (Matte Plastic)", "Матовая глина (Clay)", "Шлифованный металл (Brushed Metal)", "Ржавый металл (Rusted Metal)", "Золото / Хром (Gold/Chrome)", "Стекло / Хрусталь (Glass)", "Мягкая ткань / Шелк (Silk/Fabric)", "Грубый камень / Бетон (Concrete)", "Карбон (Carbon Fiber)", "Неоновые трубки (Neon Tubes)", "Мех / Пух (Fur/Fluffy)", "Органическая слизь (Organic Slime)"] },
                    { id: "lighting", label: "Освещение", type: "select-or-type", placeholder: "Какой свет?", options: ["Мягкий дневной свет (Soft Daylight)", "Студийный свет (Softbox)", "Жесткое солнце (Hard Sunlight)", "Золотой час (Golden Hour)", "Синий час (Blue Hour)", "Кинематографичное (Cinematic/Low key)", "Неоновый свет (Neon)", "Рембрандтовский свет (Rembrandt)", "Объемные лучи (God Rays)"] },
                    { id: "colors", label: "Цветовая гамма", type: "select-or-type", placeholder: "Какие цвета?", options: ["Теплая / Пастельная (Warm/Pastel)", "Холодная / Мрачная (Cold/Moody)", "Черно-белая (Noir/Monochrome)", "Яркая / Кислотная (Vivid/Acid)", "Приглушенная / Винтажная (Muted/Vintage)", "Teal & Orange (Кино-блокбастер)", "Vaporwave (Розовый/Бирюзовый)", "Готическая (Черный/Красный)", "Землистая (Коричневый/Зеленый)"] }
                ]
            },
            {
                id: "camera_block",
                title: "3. Камера (Camera Tech)",
                fields: [
                    { id: "camera_angle", label: "Ракурс", type: "select", options: ["На уровне глаз (Eye Level)", "Вид снизу (Low Angle)", "Вид сверху (High Angle)", "Вид с дрона (Bird's Eye)", "Вид с земли (Worm's Eye)", "Вид из глаз (POV)", "Селфи (Selfie)", "Из-за плеча (Over-the-shoulder)", "Голландский угол (Dutch Angle/Tilt)"] },
                    { id: "shot_size", label: "Крупность плана", type: "select", options: ["Экстремально крупный (Macro/Eye detail)", "Крупный план (Close-up Face)", "Портрет по плечи (Portrait)", "Средний план (Medium Shot / Waist up)", "Ковбойский план (Knees up)", "Полный рост (Full Body)", "Общий план (Wide Shot)", "Дальний план (Extreme Long Shot)"] },
                    { id: "focus", label: "Фокус и Глубина", type: "select", options: ["Размытый фон (Bokeh / f1.8)", "Всё в резкости (Deep Focus / f22)", "Макро-съемка (Macro Lens)", "Тилт-шифт (Tilt-Shift / Miniature effect)", "Размытие в движении (Motion Blur)"] }
                ]
            },
            {
                id: "filters_block",
                title: "4. Фильтры (Filters)",
                fields: [
                    { id: "negative_prompt", label: "Негативный промпт", type: "multi-select", placeholder: "Чего НЕ надо?", options: ["Стандартный фильтр (Убрать уродства, мусор, артефакты)", "Без текста (Убрать водяные знаки, подписи, логотипы)", "Только HD (Убрать размытие, шум, низкое качество)", "Анатомический фильтр (Исправить пальцы, лишние конечности — для людей)", "Композиционный (Без обрезки головы, объект в центре)", "Без людей (Только пейзаж/фон)", "Без 3D/Мультяшности (Только фотореализм)"] }
                ]
            }
        ]
    }

    // Initialize Config on Mount (Static)
    useEffect(() => {
        setConfig(fallbackConfig)
        const initialData: Record<string, string> = {}
        fallbackConfig.blocks.forEach((block: Block) => {
            block.fields.forEach((field: Field) => {
                initialData[field.id] = ''
                if (field.id === 'style') initialData[field.id] = 'Фотореализм'
            })
        })
        setFormData(initialData)
    }, [])

    const handleInputChange = (id: string, value: string | string[]) => {
        setFormData(prev => ({ ...prev, [id]: value }))
    }

    const handleMultiSelectToggle = (id: string, option: string) => {
        setFormData(prev => {
            const current = prev[id]
            const currentArray = Array.isArray(current) ? current : []

            if (currentArray.includes(option)) {
                return { ...prev, [id]: currentArray.filter(item => item !== option) }
            } else {
                return { ...prev, [id]: [...currentArray, option] }
            }
        })
    }

    const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setVideoRef(e.target.files[0])
        }
    }

    const enhancePrompt = async () => {
        const tg = (window as any).Telegram?.WebApp
        if (tg) tg.showAlert("Эта функция временно отключена для стабильности. Используйте ручной ввод.")
    }

    const handleGenerate = (type: 'image' | 'video' | 'reference') => {
        const tg = (window as any).Telegram?.WebApp
        if (!tg) {
            alert("Telegram WebApp not found")
            return
        }

        let payload: any = { type: type }

        if (type === 'image') {
            if (!formData['subject'] || (typeof formData['subject'] === 'string' && !formData['subject'].trim())) {
                tg.showAlert("Пожалуйста, заполните Субъект")
                return
            }

            const parts: string[] = []
            const d = formData

            const getVal = (key: string) => {
                const val = d[key]
                if (Array.isArray(val)) return val.join(', ')
                return val
            }

            if (d.subject) parts.push(getVal('subject') as string)
            if (d.action) parts.push(getVal('action') as string)
            if (d.environment) parts.push("in " + getVal('environment'))
            if (d.time_of_day) parts.push("during " + getVal('time_of_day'))
            if (d.atmosphere) parts.push("in " + getVal('atmosphere') + " setting")

            if (d.style) parts.push(getVal('style') + " style")
            if (d.materials) parts.push("made of " + getVal('materials'))
            if (d.lighting) parts.push(getVal('lighting') as string)
            if (d.colors) parts.push(getVal('colors') + " color palette")

            if (d.camera_angle) parts.push("shot from " + getVal('camera_angle'))
            if (d.shot_size) parts.push(getVal('shot_size') as string)
            if (d.focus) parts.push(getVal('focus') as string)
            if (d.textOnPhoto) parts.push(`Text: "${getVal('textOnPhoto')}"`)

            let mainPrompt = parts.join(', ')

            if (d.negative_prompt) {
                const neg = Array.isArray(d.negative_prompt) ? d.negative_prompt.join(', ') : d.negative_prompt
                if (neg) mainPrompt += ` --no ${neg}`
            }

            const resolution = d.resolution || '1K'
            mainPrompt += `, high quality, ${resolution}`

            payload.prompt = mainPrompt
            payload.params = { aspectRatio: formData['aspectRatio'] || '1:1', resolution: formData['resolution'] || '1K' }

        } else if (type === 'video') {
            if (!videoPrompt.trim()) {
                tg.showAlert("Пожалуйста, введите промт")
                return
            }
            payload.prompt = videoPrompt
            payload.params = { orientation: videoOrientation }
        } else if (type === 'reference') {
            const hasAnyImage = refFiles.some(f => f !== null)
            if (!hasAnyImage && !mainRefPrompt.trim()) {
                tg.showAlert("Пожалуйста, загрузите хотя бы один референс или введите описание")
                return
            }

            payload.mainPrompt = mainRefPrompt
            payload.references = refFiles.map((file, i) => ({
                id: i,
                description: refPrompts[i],
                hasFile: file !== null
            }))
            payload.params = {
                aspectRatio: formData['aspectRatio'] || '9:16',
                resolution: formData['resolution'] || '1K',
                camera: {
                    angle: formData['camera_angle'] || '',
                    shot_size: formData['shot_size'] || '',
                    focus: formData['focus'] || ''
                }
            }

            if (hasAnyImage) {
                tg.showAlert("Готовлю данные... (Фото будут переданы боту)")
            }
        }

        tg.sendData(JSON.stringify(payload))
    }

    // Chat function removed
    /*
    const sendTextMessage = () => {
        const tg = (window as any).Telegram?.WebApp
        if (!tg) return

        if (!input.trim()) {
            tg.showAlert("Пожалуйста, введите сообщение")
            return
        }

        const data = {
            type: 'text',
            prompt: input,
            params: {}
        }

        tg.sendData(JSON.stringify(data))
    }
    */

    // Helper to render fields
    const renderField = (field: Field) => {
        const value = formData[field.id] || ''

        if (field.type === 'multi-select') {
            const selected = Array.isArray(value) ? value : []
            return (
                <div key={field.id}>
                    <label className="text-xs text-purple-300 font-bold ml-1 mb-1 block">{field.label}</label>
                    <div className="flex flex-wrap gap-2">
                        {field.options?.map(opt => {
                            const isSelected = selected.includes(opt)
                            return (
                                <button
                                    key={opt}
                                    onClick={() => handleMultiSelectToggle(field.id, opt)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${isSelected
                                        ? 'bg-neon-purple text-white border-neon-purple shadow-[0_0_10px_rgba(188,19,254,0.4)]'
                                        : 'bg-black/30 text-gray-400 border-white/10 hover:border-white/30 hover:text-white'
                                        }`}
                                >
                                    {opt}
                                </button>
                            )
                        })}
                    </div>
                </div>
            )
        }

        if (field.type === 'select') {
            return (
                <div key={field.id}>
                    <label className="text-xs text-purple-300 font-bold ml-1 mb-1 block">{field.label}</label>
                    <div className="relative">
                        <select
                            value={value as string}
                            onChange={(e) => handleInputChange(field.id, e.target.value)}
                            className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-neon-purple/50 appearance-none"
                        >
                            <option value="">Не выбрано</option>
                            {field.options?.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                    </div>
                </div>
            )
        }

        if (field.type === 'select-or-type') {
            return (
                <div key={field.id}>
                    <label className="text-xs text-purple-300 font-bold ml-1 mb-1 block">{field.label}</label>
                    <div className="relative group">
                        <input
                            type="text"
                            value={value as string}
                            onChange={(e) => handleInputChange(field.id, e.target.value)}
                            placeholder={field.placeholder}
                            list={`list-${field.id}`}
                            className="w-full glass-input rounded-xl px-4 py-2 text-sm"
                        />
                        <datalist id={`list-${field.id}`}>
                            {field.options?.map(opt => (
                                <option key={opt} value={opt} />
                            ))}
                        </datalist>
                        {/* Custom dropdown arrow to hint it's a list */}
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none opacity-50" size={16} />
                    </div>
                </div>
            )
        }

        return (
            <div key={field.id}>
                <label className="text-xs text-purple-300 font-bold ml-1 mb-1 block">{field.label}</label>
                <input
                    type="text"
                    value={value as string}
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full glass-input rounded-xl px-4 py-2 text-sm"
                />
            </div>
        )
    }

    return (
        <div className="min-h-screen p-4 flex flex-col items-center justify-center text-white font-sans">
            {/* Header */}
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md mb-4 flex items-center justify-between glass-panel p-4 rounded-2xl z-10"
            >
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-neon-blue to-neon-purple flex items-center justify-center shadow-[0_0_15px_rgba(188,19,254,0.5)]">
                        <Sparkles size={20} className="text-white" />
                    </div>
                    <div>
                        <h1 className="font-bold text-lg leading-tight">Project_RM</h1>
                        <p className="text-xs text-gray-400">На базе Gemini 3</p>
                    </div>
                </div>
                <div className="px-3 py-1 rounded-full bg-cyan-500/10 text-xs font-mono text-cyan-400 border border-cyan-500/20 shadow-[0_0_10px_rgba(34,211,238,0.2)]">
                    БЕТА
                </div>
            </motion.header>

            {/* Main Content Area */}
            <main className="w-full max-w-md flex-1 relative flex flex-col min-h-[60vh] pb-24">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="glass-panel rounded-3xl p-4 flex-1 flex flex-col overflow-hidden relative"
                >
                    {/* Chat Tab Removed */}
                    {/* 
                    {activeTab === 'chat' && (
                        <div className="flex flex-col h-full justify-center items-center p-4">
                            <Bot size={64} className="text-neon-blue mb-6 drop-shadow-[0_0_15px_rgba(0,243,255,0.5)]" />
                            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neon-blue to-neon-purple mb-2">
                                Чат
                            </h2>
                            <p className="text-gray-400 text-center mb-8">
                                Спросите Gemini 3.0 Pro о чем угодно. Бот ответит в чате.
                            </p>

                            <div className="w-full space-y-4">
                                <textarea
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Введите ваш запрос..."
                                    className="w-full glass-input rounded-xl px-4 py-3 text-sm resize-none min-h-[120px]"
                                />
                                <button
                                    onClick={sendTextMessage}
                                    className="glass-button px-6 py-3 rounded-xl w-full font-semibold text-neon-blue shadow-[0_0_15px_rgba(0,243,255,0.3)] hover:shadow-[0_0_25px_rgba(0,243,255,0.5)] transition-all"
                                >
                                    <span className="flex items-center justify-center gap-2">
                                        <Sparkles size={18} />
                                        Отправить боту
                                    </span>
                                </button>
                            </div>
                        </div>
                    )}
                    */}

                    {activeTab === 'image' && (
                        <div className="flex flex-col h-full p-4 overflow-y-auto">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 rounded-xl bg-neon-purple/10 text-neon-purple">
                                    <ImageIcon size={24} />
                                </div>
                                <h2 className="text-2xl font-bold">Генерация Изображений</h2>
                            </div>

                            {!config ? (
                                <div className="flex items-center justify-center flex-1">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neon-purple"></div>
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col mb-4 space-y-4">
                                    {config.blocks.map((block) => (
                                        <div key={block.id} className="space-y-3 pt-2 border-t border-white/5 first:border-0 first:pt-0">
                                            <h3 className="text-sm font-bold text-neon-purple/80 uppercase tracking-wider">{block.title}</h3>
                                            <div className="space-y-3">
                                                {block.fields.map(field => renderField(field))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4 mb-6 pt-2 border-t border-white/5">
                                <div>
                                    <label className="text-xs text-purple-300 font-bold ml-1 mb-1 block">Соотношение сторон</label>
                                    <select
                                        value={formData['aspectRatio'] || '1:1'}
                                        onChange={(e) => handleInputChange('aspectRatio', e.target.value)}
                                        className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-neon-purple/50"
                                    >
                                        <option value="1:1">1:1 (Квадрат)</option>
                                        <option value="16:9">16:9 (Пейзаж)</option>
                                        <option value="9:16">9:16 (Сторис)</option>
                                        <option value="4:3">4:3 (Фото)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-purple-300 font-bold ml-1 mb-1 block">Разрешение</label>
                                    <select
                                        value={formData['resolution'] || '1K'}
                                        onChange={(e) => handleInputChange('resolution', e.target.value)}
                                        className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-neon-purple/50"
                                    >
                                        <option value="1K">1K (Стандарт)</option>
                                        <option value="2K">2K (HD)</option>
                                        <option value="4K">4K (Ultra)</option>
                                    </select>
                                </div>
                            </div>

                            <button
                                onClick={() => handleGenerate('image')}
                                className="glass-button w-full py-4 rounded-xl font-bold text-lg text-neon-purple shadow-[0_0_20px_rgba(188,19,254,0.3)] hover:shadow-[0_0_30px_rgba(188,19,254,0.5)] transition-all mt-auto"
                            >
                                <span className="flex items-center justify-center gap-2">
                                    <Sparkles size={20} />
                                    Сгенерировать
                                </span>
                            </button>
                        </div>
                    )}

                    {activeTab === 'video' && (
                        <div className="flex flex-col h-full p-4 overflow-y-auto">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 rounded-xl bg-neon-blue/10 text-neon-blue">
                                    <Video size={24} />
                                </div>
                                <h2 className="text-2xl font-bold">Видео Студия</h2>
                            </div>

                            <div className="flex-1 flex flex-col mb-4">
                                <label className="text-xs text-gray-400 ml-1 mb-1">Ориентация</label>
                                <div className="flex bg-black/30 p-1 rounded-xl mb-6 border border-white/10">
                                    {(['landscape', 'portrait', 'square'] as const).map((o) => (
                                        <button
                                            key={o}
                                            onClick={() => setVideoOrientation(o)}
                                            className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${videoOrientation === o ? 'bg-neon-blue/20 text-neon-blue shadow-[0_0_10px_rgba(0,243,255,0.2)]' : 'text-gray-400 hover:text-white'
                                                }`}
                                        >
                                            {o.charAt(0).toUpperCase() + o.slice(1)}
                                        </button>
                                    ))}
                                </div>

                                <label className="text-xs text-gray-400 ml-1 mb-1">Промт</label>
                                <div className="relative mb-4">
                                    <textarea
                                        value={videoPrompt}
                                        onChange={(e) => setVideoPrompt(e.target.value)}
                                        placeholder="Опишите видео сцену..."
                                        className="w-full glass-input rounded-xl px-4 py-3 text-sm resize-none min-h-[100px] pr-10"
                                    />
                                    <button
                                        onClick={() => enhancePrompt()}
                                        disabled={!videoPrompt}
                                        className="absolute bottom-2 right-2 p-2 bg-neon-blue/20 rounded-lg text-neon-blue hover:bg-neon-blue/30 disabled:opacity-50 transition-colors"
                                        title="Улучшить с AI"
                                    >
                                        <Sparkles size={16} />
                                    </button>
                                </div>

                                {/* Reference Image for Video */}
                                <div className="mb-4">
                                    <label className="text-xs text-gray-400 ml-1 mb-1 block">Референс (Фото)</label>
                                    {videoRef ? (
                                        <div className="relative w-full h-32 rounded-xl overflow-hidden border border-white/20 group">
                                            <img src={URL.createObjectURL(videoRef)} alt="ref" className="w-full h-full object-cover" />
                                            <button
                                                onClick={() => setVideoRef(null)}
                                                className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="w-full h-24 rounded-xl border border-dashed border-white/30 flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-colors">
                                            <Upload size={24} className="text-gray-400 mb-2" />
                                            <span className="text-xs text-gray-400">Загрузить референс</span>
                                            <input type="file" accept="image/*" onChange={handleVideoUpload} className="hidden" />
                                        </label>
                                    )}
                                </div>

                            </div>

                            <button
                                onClick={() => handleGenerate('video')}
                                className="glass-button w-full py-4 rounded-xl font-bold text-lg text-neon-blue shadow-[0_0_20px_rgba(0,243,255,0.3)] hover:shadow-[0_0_30px_rgba(0,243,255,0.5)] transition-all mt-auto"
                            >
                                <span className="flex items-center justify-center gap-2">
                                    <Sparkles size={20} />
                                    Сгенерировать Видео
                                </span>
                            </button>
                        </div>
                    )}
                    {activeTab === 'reference' && (
                        <div className="flex flex-col h-full p-4 overflow-y-auto">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 rounded-xl bg-neon-purple/10 text-neon-purple">
                                    <Layers size={214} />
                                </div>
                                <h2 className="text-2xl font-bold">Генерация по референсу</h2>
                            </div>

                            <div className="flex-1 space-y-4 mb-6">
                                {[0, 1, 2].map(i => (
                                    <div key={i} className="glass-panel p-3 rounded-2xl border border-white/5">
                                        <div className="flex gap-3 mb-3">
                                            <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-white/10 shrink-0">
                                                {refFiles[i] ? (
                                                    <>
                                                        <img src={URL.createObjectURL(refFiles[i]!)} alt={`ref-${i}`} className="w-full h-full object-cover" />
                                                        <button
                                                            onClick={() => {
                                                                const newFiles = [...refFiles]
                                                                newFiles[i] = null
                                                                setRefFiles(newFiles)
                                                            }}
                                                            className="absolute top-0 right-0 p-1 bg-black/60 text-white rounded-bl-lg"
                                                        >
                                                            <X size={12} />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-white/5">
                                                        <Upload size={18} className="text-gray-500" />
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            className="hidden"
                                                            onChange={(e) => {
                                                                if (e.target.files?.[0]) {
                                                                    const newFiles = [...refFiles]
                                                                    newFiles[i] = e.target.files[0]
                                                                    setRefFiles(newFiles)
                                                                }
                                                            }}
                                                        />
                                                    </label>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <input
                                                    type="text"
                                                    value={refPrompts[i]}
                                                    onChange={(e) => {
                                                        const newPrompts = [...refPrompts]
                                                        newPrompts[i] = e.target.value
                                                        setRefPrompts(newPrompts)
                                                    }}
                                                    placeholder="что из этого фото взять?"
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-neon-purple/50 pr-8"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <div className="space-y-1">
                                    <label className="text-xs text-gray-400 ml-1">Общее описание (необязательно)</label>
                                    <textarea
                                        value={mainRefPrompt}
                                        onChange={(e) => setMainRefPrompt(e.target.value)}
                                        placeholder="Добавьте финальные пожелания..."
                                        className="w-full glass-input rounded-xl px-4 py-3 text-sm resize-none min-h-[80px]"
                                    />
                                </div>

                                {/* Common Settings Injection */}
                                <div className="space-y-4 pt-4 border-t border-white/5">
                                    <h3 className="text-xs font-bold text-neon-purple/80 uppercase tracking-wider">Настройки Камеры</h3>
                                    <div className="space-y-3">
                                        {config?.blocks.find(b => b.id === 'camera_block')?.fields.map(field => renderField(field))}
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => handleGenerate('reference')}
                                className="glass-button w-full py-4 rounded-xl font-bold text-lg text-neon-purple shadow-[0_0_20px_rgba(188,19,254,0.3)] hover:shadow-[0_0_30px_rgba(188,19,254,0.5)] transition-all mt-auto"
                            >
                                <span className="flex items-center justify-center gap-2">
                                    <Sparkles size={20} />
                                    Сгенерировать по реферам
                                </span>
                            </button>
                        </div>
                    )}


                </motion.div>
            </main>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-4 left-4 right-4 max-w-md mx-auto glass-panel p-2 rounded-2xl flex justify-between items-center z-50 shadow-[0_5px_20px_rgba(0,0,0,0.5)]">
                {[
                    // { id: 'chat', icon: MessageSquare, label: 'Чат' }, // Removed
                    { id: 'image', icon: ImageIcon, label: 'Фото' },
                    { id: 'reference', icon: Layers, label: 'Рефы' },
                    { id: 'video', icon: Video, label: 'Видео' }
                ].map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id as any)}
                        className={`flex flex-col items-center justify-center w-16 h-14 rounded-xl transition-all duration-300 ${activeTab === item.id
                            ? 'bg-white/10 text-white shadow-[0_0_10px_rgba(255,255,255,0.2)] scale-105'
                            : 'text-gray-500 hover:text-gray-300'
                            }`}
                    >
                        <item.icon size={20} className={`mb-1 ${activeTab === item.id ? 'drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]' : ''}`} />
                        <span className="text-[10px] font-medium">{item.label}</span>
                    </button>
                ))}
            </nav>
        </div>
    )
}

export default App
