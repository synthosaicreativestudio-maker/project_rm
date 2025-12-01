import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Bot, Image as ImageIcon, Video, Sparkles, Upload, X, User, MessageSquare, ChevronDown } from 'lucide-react'



interface Field {
    id: string
    label: string
    type: 'text' | 'select' | 'select-or-type'
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
    const [activeTab, setActiveTab] = useState('chat')
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    // Dynamic State
    const [config, setConfig] = useState<Config | null>(null)
    const [formData, setFormData] = useState<Record<string, string>>({})

    // Video State (kept separate as it's not fully dynamic in this spec yet, or is it?)
    // The spec focuses on Image Gen. Video Gen seems to be separate.
    const [videoPrompt, setVideoPrompt] = useState('')
    const [videoOrientation, setVideoOrientation] = useState('9:16')
    const [videoRef, setVideoRef] = useState<File | null>(null)

    // Fetch Config on Mount
    useEffect(() => {
        fetch('http://localhost:8000/api/config')
            .then(res => res.json())
            .then(data => {
                setConfig(data)
                // Initialize formData with defaults or empty strings
                const initialData: Record<string, string> = {}
                data.blocks.forEach((block: Block) => {
                    block.fields.forEach((field: Field) => {
                        initialData[field.id] = ''
                        // Set default for specific fields if needed, e.g. Style
                        if (field.id === 'style') initialData[field.id] = 'Реализм'
                    })
                })
                // Merge with existing if needed, but here we just set it
                setFormData(prev => ({ ...initialData, ...prev }))
            })
            .catch(err => console.error("Failed to load config:", err))
    }, [])

    const handleInputChange = (id: string, value: string) => {
        setFormData(prev => ({ ...prev, [id]: value }))
    }

    const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setVideoRef(e.target.files[0])
        }
    }

    const enhancePrompt = async (type: 'image' | 'video') => {
        // For image, we might need to construct a prompt from formData first
        // But for now, let's just support video prompt enhancement or basic image subject
        const currentPrompt = type === 'image' ? formData['subject'] : videoPrompt
        if (!currentPrompt?.trim()) return

        setIsLoading(true)
        try {
            const response = await fetch('http://localhost:8000/api/enhance-prompt/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: currentPrompt, type })
            })
            const data = await response.json()
            if (type === 'image') {
                handleInputChange('subject', data.enhanced_prompt)
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
            if (!formData['subject']?.trim()) {
                tg.showAlert("Пожалуйста, заполните Субъект")
                return
            }

            // Assemble structured prompt based on Dynamic Logic
            // Logic: Subject, Action, in Environment, Style style, made of Material, Lighting, Colors color palette, shot from Angle, Shot size, Focus, Text: "...", --no Negative

            let finalPrompt = ""
            const d = formData

            // 1. Base
            if (d.subject) finalPrompt += d.subject
            if (d.action) finalPrompt += ", " + d.action
            if (d.environment) finalPrompt += ", in " + d.environment

            // 2. Visuals
            if (d.style) finalPrompt += ", " + d.style + " style"
            if (d.materials) finalPrompt += ", made of " + d.materials
            if (d.lighting) finalPrompt += ", " + d.lighting
            if (d.colors) finalPrompt += ", " + d.colors + " color palette"

            // 3. Camera
            if (d.camera_angle) finalPrompt += ", shot from " + d.camera_angle
            if (d.shot_size) finalPrompt += ", " + d.shot_size
            if (d.focus) finalPrompt += ", " + d.focus

            // 4. Extra
            if (d.textOnPhoto) finalPrompt += `, Text: "${d.textOnPhoto}"`
            if (d.negative_prompt) finalPrompt += ` --no ${d.negative_prompt}`

            finalPrompt += ", high quality, 8k"
            prompt = finalPrompt

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
            params: type === 'image' ? { aspectRatio: formData['aspectRatio'] || '1:1', resolution: formData['resolution'] || '1K' } : { orientation: videoOrientation }
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

    // Helper to render fields
    const renderField = (field: Field) => {
        const value = formData[field.id] || ''

        if (field.type === 'select') {
            return (
                <div key={field.id}>
                    <label className="text-xs text-purple-300 font-bold ml-1 mb-1 block">{field.label}</label>
                    <div className="relative">
                        <select
                            value={value}
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
                            value={value}
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
                    value={value}
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
