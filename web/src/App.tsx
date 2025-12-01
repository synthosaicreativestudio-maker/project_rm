import { useState } from 'react'
import { motion } from 'framer-motion'
import { Bot, Image as ImageIcon, Video, Sparkles, Upload, X, User, MessageSquare } from 'lucide-react'

function App() {
    const [activeTab, setActiveTab] = useState('chat')
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    // Image Gen State
    // Block 1: Subject
    const [subject, setSubject] = useState('')
    const [action, setAction] = useState('')
    const [environment, setEnvironment] = useState('')

    // Block 2: Style & Details
    const [style, setStyle] = useState('Реализм')
    const [material, setMaterial] = useState('')
    const [lighting, setLighting] = useState('')
    const [colors, setColors] = useState('')

    // Block 3: Camera & Composition
    const [shotSize, setShotSize] = useState('')
    const [angle, setAngle] = useState('')
    const [focus, setFocus] = useState('')

    // Block 4: Extra
    const [textOnPhoto, setTextOnPhoto] = useState('')
    const [negativePrompt, setNegativePrompt] = useState('')

    const [aspectRatio, setAspectRatio] = useState('1:1')
    const [resolution, setResolution] = useState('1K')

    // Video Gen State
    const [videoPrompt, setVideoPrompt] = useState('')
    const [videoOrientation, setVideoOrientation] = useState('9:16')
    const [videoRef, setVideoRef] = useState<File | null>(null)

    const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setVideoRef(e.target.files[0])
        }
    }

    const enhancePrompt = async (type: 'image' | 'video') => {
        const currentPrompt = type === 'image' ? subject : videoPrompt
        if (!currentPrompt.trim()) return

        setIsLoading(true)
        try {
            const response = await fetch('http://localhost:8000/api/enhance-prompt/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: currentPrompt, type })
            })
            const data = await response.json()
            if (type === 'image') {
                // Logic for image prompt enhancement if needed
            }
            else setVideoPrompt(data.enhanced_prompt)
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleGenerate = (type: 'image' | 'video') => {
        const tg = (window as any).Telegram?.WebApp
        if (!tg) {
            alert("Telegram WebApp not found")
            return
        }

        let prompt = ''
        if (type === 'image') {
            if (!subject.trim()) {
                tg.showAlert("Пожалуйста, заполните Субъект")
                return
            }

            // Assemble structured prompt
            const parts = []
            if (subject) parts.push(`Subject: ${subject}`)
            if (action) parts.push(`Action: ${action}`)
            if (environment) parts.push(`Environment: ${environment}`)
            if (style) parts.push(`Style: ${style}`)
            if (material) parts.push(`Material: ${material}`)
            if (lighting) parts.push(`Lighting: ${lighting}`)
            if (colors) parts.push(`Colors: ${colors}`)
            if (shotSize) parts.push(`Shot: ${shotSize}`)
            if (angle) parts.push(`Angle: ${angle}`)
            if (focus) parts.push(`Focus: ${focus}`)
            if (textOnPhoto) parts.push(`Text: "${textOnPhoto}"`)
            if (negativePrompt) parts.push(`--no ${negativePrompt}`)

            prompt = parts.join('. ')
        } else {
            prompt = videoPrompt
            if (!prompt.trim()) {
                tg.showAlert("Пожалуйста, введите промт")
                return
            }
        }

        const data = {
            type: type,
            prompt: prompt,
            params: type === 'image' ? { aspectRatio, resolution } : { orientation: videoOrientation }
        }


        tg.sendData(JSON.stringify(data))
    }

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

                    {activeTab === 'image' && (
                        <div className="flex flex-col h-full p-4 overflow-y-auto">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 rounded-xl bg-neon-purple/10 text-neon-purple">
                                    <ImageIcon size={24} />
                                </div>
                                <h2 className="text-2xl font-bold">Генерация Изображений</h2>
                            </div>

                            <div className="flex-1 flex flex-col mb-4 space-y-4">

                                {/* Block 1: Subject */}
                                <div className="space-y-3">
                                    <h3 className="text-sm font-bold text-neon-purple/80 uppercase tracking-wider">1. Сюжет</h3>

                                    <div>
                                        <label className="text-xs text-purple-300 font-bold ml-1 mb-1 block">Субъект (Кто или что в кадре?)</label>
                                        <input
                                            type="text"
                                            value={subject}
                                            onChange={(e) => setSubject(e.target.value)}
                                            placeholder="Рыжий кот в скафандре"
                                            className="w-full glass-input rounded-xl px-4 py-2 text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-purple-300 font-bold ml-1 mb-1 block">Действие и Поза (Что делает?)</label>
                                        <input
                                            type="text"
                                            value={action}
                                            onChange={(e) => setAction(e.target.value)}
                                            placeholder="Бежит по лужам"
                                            className="w-full glass-input rounded-xl px-4 py-2 text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-purple-300 font-bold ml-1 mb-1 block">Окружение (Где происходит?)</label>
                                        <input
                                            type="text"
                                            value={environment}
                                            onChange={(e) => setEnvironment(e.target.value)}
                                            placeholder="Марсианская пустыня"
                                            className="w-full glass-input rounded-xl px-4 py-2 text-sm"
                                        />
                                    </div>
                                </div>

                                {/* Block 2: Style & Details */}
                                <div className="space-y-3 pt-2 border-t border-white/5">
                                    <h3 className="text-sm font-bold text-neon-purple/80 uppercase tracking-wider">2. Стиль и Детали</h3>

                                    <div>
                                        <label className="text-xs text-purple-300 font-bold ml-1 mb-1 block">Стиль (Как это выглядит?)</label>
                                        <select
                                            value={style}
                                            onChange={(e) => setStyle(e.target.value)}
                                            className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-neon-purple/50"
                                        >
                                            <option value="Реализм">Реализм</option>
                                            <option value="Pixar animation style">Pixar animation style</option>
                                            <option value="3D render">3D render</option>
                                            <option value="Маслом на холсте">Маслом на холсте</option>
                                            <option value="Киберпанк">Киберпанк</option>
                                            <option value="Фотореализм">Фотореализм</option>
                                            <option value="Аниме">Аниме</option>
                                            <option value="Акварель">Акварель</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs text-purple-300 font-bold ml-1 mb-1 block">Материалы (Из чего сделано?)</label>
                                        <input
                                            type="text"
                                            value={material}
                                            onChange={(e) => setMaterial(e.target.value)}
                                            placeholder="Пушистая шерсть, Глянцевый пластик"
                                            className="w-full glass-input rounded-xl px-4 py-2 text-sm"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-xs text-purple-300 font-bold ml-1 mb-1 block">Освещение</label>
                                            <input
                                                type="text"
                                                value={lighting}
                                                onChange={(e) => setLighting(e.target.value)}
                                                placeholder="Мягкий свет, Неон"
                                                className="w-full glass-input rounded-xl px-4 py-2 text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-purple-300 font-bold ml-1 mb-1 block">Цвета</label>
                                            <input
                                                type="text"
                                                value={colors}
                                                onChange={(e) => setColors(e.target.value)}
                                                placeholder="Пастельные, Кислотные"
                                                className="w-full glass-input rounded-xl px-4 py-2 text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Block 3: Camera & Composition */}
                                <div className="space-y-3 pt-2 border-t border-white/5">
                                    <h3 className="text-sm font-bold text-neon-purple/80 uppercase tracking-wider">3. Камера и Композиция</h3>

                                    <div>
                                        <label className="text-xs text-purple-300 font-bold ml-1 mb-1 block">Крупность плана</label>
                                        <select
                                            value={shotSize}
                                            onChange={(e) => setShotSize(e.target.value)}
                                            className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-neon-purple/50"
                                        >
                                            <option value="">Не выбрано</option>
                                            <option value="Close-up">Крупный план лица (Close-up)</option>
                                            <option value="Waist shot">Поясной портрет</option>
                                            <option value="Wide shot">Общий план (Wide shot)</option>
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-xs text-purple-300 font-bold ml-1 mb-1 block">Ракурс</label>
                                            <select
                                                value={angle}
                                                onChange={(e) => setAngle(e.target.value)}
                                                className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-neon-purple/50"
                                            >
                                                <option value="">Не выбрано</option>
                                                <option value="Eye level">На уровне глаз</option>
                                                <option value="Low angle">Вид снизу</option>
                                                <option value="Top down">Вид сверху</option>
                                                <option value="Dutch angle">Наклон</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs text-purple-300 font-bold ml-1 mb-1 block">Фокус</label>
                                            <select
                                                value={focus}
                                                onChange={(e) => setFocus(e.target.value)}
                                                className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-neon-purple/50"
                                            >
                                                <option value="">Не выбрано</option>
                                                <option value="Bokeh">Размытый фон</option>
                                                <option value="Deep focus">Всё в резкости</option>
                                                <option value="Macro">Макро</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Block 4: Extra */}
                                <div className="space-y-3 pt-2 border-t border-white/5">
                                    <h3 className="text-sm font-bold text-neon-purple/80 uppercase tracking-wider">4. Дополнительно</h3>

                                    <div>
                                        <label className="text-xs text-purple-300 font-bold ml-1 mb-1 block">Текст на фото</label>
                                        <input
                                            type="text"
                                            value={textOnPhoto}
                                            onChange={(e) => setTextOnPhoto(e.target.value)}
                                            placeholder="Вывеска 'COFFEE'"
                                            className="w-full glass-input rounded-xl px-4 py-2 text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-purple-300 font-bold ml-1 mb-1 block">Негативный промпт (Чего НЕ надо?)</label>
                                        <input
                                            type="text"
                                            value={negativePrompt}
                                            onChange={(e) => setNegativePrompt(e.target.value)}
                                            placeholder="Размытие, текст, лишние пальцы"
                                            className="w-full glass-input rounded-xl px-4 py-2 text-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-6 pt-2 border-t border-white/5">
                                <div>
                                    <label className="text-xs text-purple-300 font-bold ml-1 mb-1 block">Соотношение сторон</label>
                                    <select
                                        value={aspectRatio}
                                        onChange={(e) => setAspectRatio(e.target.value)}
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
                                        value={resolution}
                                        onChange={(e) => setResolution(e.target.value)}
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
                                        onClick={() => enhancePrompt('video')}
                                        disabled={isLoading || !videoPrompt}
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

                    {activeTab === 'profile' && (
                        <div className="flex flex-col h-full p-4 overflow-y-auto">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 rounded-xl bg-green-500/10 text-green-400">
                                    <User size={24} />
                                </div>
                                <h2 className="text-2xl font-bold">Профиль</h2>
                            </div>

                            <div className="glass-panel p-4 rounded-xl mb-6 bg-gradient-to-br from-white/5 to-transparent">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-gray-400 text-sm">Текущий план</span>
                                    <span className="text-green-400 font-bold bg-green-500/10 px-3 py-1 rounded-full text-xs border border-green-500/20">FREE</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-400 text-sm">Кредиты</span>
                                    <span className="text-xl font-bold">50 / 100</span>
                                </div>
                                <div className="w-full bg-white/10 h-1.5 rounded-full mt-3 overflow-hidden">
                                    <div className="bg-green-400 h-full w-1/2 shadow-[0_0_10px_rgba(74,222,128,0.5)]"></div>
                                </div>
                            </div>

                            <h3 className="font-bold mb-4 text-lg">Выберите Тариф</h3>
                            <div className="space-y-3">
                                {[
                                    { name: 'Starter', price: '$9/мес', features: ['1000 Кредитов', 'Стандартная скорость', 'Чат & Фото'] },
                                    { name: 'Pro', price: '$29/мес', features: ['5000 Кредитов', 'Быстрая генерация', 'Видео доступ'], popular: true },
                                    { name: 'Unlimited', price: '$99/мес', features: ['Безлимит', 'Приоритет', 'Все модели'] }
                                ].map((plan) => (
                                    <div key={plan.name} className={`glass-panel p-4 rounded-xl border transition-all hover:scale-[1.02] cursor-pointer ${plan.popular ? 'border-neon-purple/50 bg-neon-purple/5' : 'border-white/5 hover:border-white/20'}`}>
                                        <div className="flex justify-between items-center mb-2">
                                            <h4 className="font-bold text-lg">{plan.name}</h4>
                                            <span className="font-mono text-neon-blue">{plan.price}</span>
                                        </div>
                                        <div className="space-y-1">
                                            {plan.features.map((f, i) => (
                                                <div key={i} className="flex items-center gap-2 text-xs text-gray-400">
                                                    <div className="w-1 h-1 rounded-full bg-white/50"></div>
                                                    {f}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </motion.div>
            </main>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-4 left-4 right-4 max-w-md mx-auto glass-panel p-2 rounded-2xl flex justify-between items-center z-50 shadow-[0_5px_20px_rgba(0,0,0,0.5)]">
                {[
                    { id: 'chat', icon: MessageSquare, label: 'Чат' },
                    { id: 'image', icon: ImageIcon, label: 'Фото' },
                    { id: 'video', icon: Video, label: 'Видео' },
                    { id: 'profile', icon: User, label: 'Профиль' }
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
