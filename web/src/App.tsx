import { useState } from 'react'
import { motion } from 'framer-motion'
import { Bot, Image as ImageIcon, Video, Sparkles, Upload, X, Smartphone, Monitor, Film } from 'lucide-react'

function App() {
    const [activeTab, setActiveTab] = useState('chat')
    const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    // Image Gen State
    const [imagePrompt, setImagePrompt] = useState('')
    const [aspectRatio, setAspectRatio] = useState('1:1')
    const [resolution, setResolution] = useState('1K')
    const [imageRefs, setImageRefs] = useState<File[]>([])

    // Video Gen State
    const [videoPrompt, setVideoPrompt] = useState('')
    const [videoOrientation, setVideoOrientation] = useState('9:16')
    const [videoRef, setVideoRef] = useState<File | null>(null)

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setImageRefs(prev => [...prev, ...Array.from(e.target.files!)])
        }
    }

    const removeImageRef = (index: number) => {
        setImageRefs(prev => prev.filter((_, i) => i !== index))
    }

    const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setVideoRef(e.target.files[0])
        }


        const enhancePrompt = async (type: 'image' | 'video') => {
            const currentPrompt = type === 'image' ? imagePrompt : videoPrompt
            if (!currentPrompt.trim()) return

            setIsLoading(true)
            try {
                const response = await fetch('http://localhost:8000/api/enhance-prompt/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ prompt: currentPrompt, type })
                })
                const data = await response.json()
                if (type === 'image') setImagePrompt(data.enhanced_prompt)
                else setVideoPrompt(data.enhanced_prompt)
            } catch (error) {
                console.error(error)
            } finally {
                setIsLoading(false)
            }
        }

        const handleGenerate = async (type: 'image' | 'video') => {
            setIsLoading(true)
            try {
                const endpoint = type === 'image' ? 'generate-image' : 'generate-video'
                await fetch(`http://localhost:8000/api/${endpoint}/`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        prompt: type === 'image' ? imagePrompt : videoPrompt,
                        settings: type === 'image' ? { aspectRatio, resolution } : { orientation: videoOrientation }
                    })
                })
                // In a real app, we'd handle the result here
                alert(`${type === 'image' ? 'Image' : 'Video'} generation started!`)
            } catch (error) {
                console.error(error)
            } finally {
                setIsLoading(false)
            }
        }

        const sendMessage = async () => {
            if (!input.trim()) return

            const userMessage = { role: 'user' as const, content: input }
            setMessages(prev => [...prev, userMessage])
            setInput('')
            setIsLoading(true)

            try {
                // Get Telegram initData
                const initData = (window as any).Telegram?.WebApp?.initData || ""

                const response = await fetch('http://localhost:8000/api/chat/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${initData}`
                    },
                    body: JSON.stringify({ message: userMessage.content })
                })

                if (!response.ok) throw new Error('Failed to fetch')

                const data = await response.json()
                setMessages(prev => [...prev, { role: 'assistant', content: data.response }])
            } catch (error) {
                console.error(error)
                setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, something went wrong." }])
            } finally {
                setIsLoading(false)
            }
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
                            <p className="text-xs text-gray-400">Gemini 3 Powered</p>
                        </div>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-cyan-500/10 text-xs font-mono text-cyan-400 border border-cyan-500/20 shadow-[0_0_10px_rgba(34,211,238,0.2)]">
                        BETA
                    </div>
                </motion.header>

                {/* Main Content Area */}
                <main className="w-full max-w-md flex-1 relative flex flex-col min-h-[60vh]">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className="glass-panel rounded-3xl p-4 flex-1 flex flex-col overflow-hidden relative"
                    >
                        {activeTab === 'chat' && (
                            <div className="flex flex-col h-full">
                                {messages.length === 0 ? (
                                    <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
                                        <Bot size={64} className="text-neon-blue mb-4 drop-shadow-[0_0_10px_rgba(0,243,255,0.5)]" />
                                        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neon-blue to-neon-purple">
                                            AI Assistant
                                        </h2>
                                        <p className="text-gray-400 text-sm">
                                            Ask me anything or upload a document for analysis.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 scrollbar-hide">
                                        {messages.map((msg, idx) => (
                                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[80%] p-3 rounded-2xl ${msg.role === 'user'
                                                    ? 'bg-neon-blue/20 text-white rounded-tr-none border border-neon-blue/30'
                                                    : 'bg-white/10 text-gray-200 rounded-tl-none border border-white/10'
                                                    }`}>
                                                    {msg.content}
                                                </div>
                                            </div>
                                        ))}
                                        {isLoading && (
                                            <div className="flex justify-start">
                                                <div className="bg-white/10 p-3 rounded-2xl rounded-tl-none flex gap-1">
                                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Input Area */}
                                <div className="mt-auto pt-4 border-t border-white/10 flex gap-2">
                                    <input
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                                        placeholder="Type a message..."
                                        className="flex-1 glass-input rounded-xl px-4 py-2 text-sm"
                                    />
                                    <button
                                        onClick={sendMessage}
                                        disabled={isLoading}
                                        className="p-2 bg-neon-blue/20 rounded-xl text-neon-blue hover:bg-neon-blue/30 disabled:opacity-50 transition-colors"
                                    >
                                        <Sparkles size={20} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'image' && (
                            <div className="flex flex-col h-full overflow-y-auto scrollbar-hide p-2">
                                <div className="flex items-center justify-center mb-6">
                                    <ImageIcon size={48} className="text-neon-purple mr-3 drop-shadow-[0_0_10px_rgba(188,19,254,0.5)]" />
                                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neon-purple to-neon-pink">
                                        Image Gen
                                    </h2>
                                </div>

                                {/* Settings */}
                                <div className="grid grid-cols-2 gap-3 mb-4">
                                    <div className="space-y-1">
                                        <label className="text-xs text-gray-400 ml-1">Aspect Ratio</label>
                                        <select
                                            value={aspectRatio}
                                            onChange={(e) => setAspectRatio(e.target.value)}
                                            className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-neon-purple/50"
                                        >
                                            <option value="1:1">1:1 (Square)</option>
                                            <option value="16:9">16:9 (Landscape)</option>
                                            <option value="9:16">9:16 (Portrait)</option>
                                            <option value="4:3">4:3 (Classic)</option>
                                            <option value="3:2">3:2 (Photo)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-gray-400 ml-1">Resolution</label>
                                        <select
                                            value={resolution}
                                            onChange={(e) => setResolution(e.target.value)}
                                            className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-neon-purple/50"
                                        >
                                            <option value="1K">1K (Standard)</option>
                                            <option value="2K">2K (High)</option>
                                            <option value="4K">4K (Ultra)</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Reference Images */}
                                <div className="mb-4">
                                    <label className="text-xs text-gray-400 ml-1 mb-1 block">Reference Images (Optional)</label>
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {imageRefs.map((file, idx) => (
                                            <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-white/20 group">
                                                <img src={URL.createObjectURL(file)} alt="ref" className="w-full h-full object-cover" />
                                                <button
                                                    onClick={() => removeImageRef(idx)}
                                                    className="absolute top-0 right-0 bg-black/50 text-white p-0.5 rounded-bl-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        ))}
                                        <label className="w-16 h-16 rounded-lg border border-dashed border-white/30 flex items-center justify-center cursor-pointer hover:bg-white/5 transition-colors">
                                            <Upload size={20} className="text-gray-400" />
                                            <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                                        </label>
                                    </div>
                                </div>

                                <div className="flex-1 flex flex-col mb-4 relative">
                                    <label className="text-xs text-gray-400 ml-1 mb-1">Prompt</label>
                                    <div className="relative">
                                        <textarea
                                            value={imagePrompt}
                                            onChange={(e) => setImagePrompt(e.target.value)}
                                            placeholder="Describe your image in detail..."
                                            className="w-full glass-input rounded-xl px-4 py-3 text-sm resize-none min-h-[100px] pr-10"
                                        />
                                        <button
                                            onClick={() => enhancePrompt('image')}
                                            disabled={isLoading || !imagePrompt}
                                            className="absolute bottom-2 right-2 p-2 bg-neon-purple/20 rounded-lg text-neon-purple hover:bg-neon-purple/30 disabled:opacity-50 transition-colors"
                                            title="Enhance with AI"
                                        >
                                            <Sparkles size={16} />
                                        </button>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleGenerate('image')}
                                    disabled={isLoading}
                                    className="glass-button px-6 py-3 rounded-xl w-full font-semibold text-neon-purple shadow-[0_0_15px_rgba(188,19,254,0.3)] hover:shadow-[0_0_25px_rgba(188,19,254,0.5)] transition-all disabled:opacity-50"
                                >
                                    <span className="flex items-center justify-center gap-2">
                                        {isLoading ? <span className="animate-spin">⏳</span> : <Sparkles size={18} />}
                                        Generate Artwork
                                    </span>
                                </button>
                            </div>
                        )}

                        {activeTab === 'video' && (
                            <div className="flex flex-col h-full overflow-y-auto scrollbar-hide p-2">
                                <div className="flex items-center justify-center mb-6">
                                    <Video size={48} className="text-neon-pink mr-3 drop-shadow-[0_0_10px_rgba(255,0,255,0.5)]" />
                                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neon-pink to-orange-500">
                                        Video Studio
                                    </h2>
                                </div>

                                {/* Orientation */}
                                <div className="mb-4">
                                    <label className="text-xs text-gray-400 ml-1 mb-1 block">Orientation</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => setVideoOrientation('9:16')}
                                            className={`p-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${videoOrientation === '9:16'
                                                ? 'bg-neon-pink/20 border-neon-pink text-white'
                                                : 'bg-black/30 border-white/10 text-gray-400 hover:bg-white/5'
                                                }`}
                                        >
                                            <Smartphone size={18} />
                                            <span className="text-sm">Vertical</span>
                                        </button>
                                        <button
                                            onClick={() => setVideoOrientation('16:9')}
                                            className={`p-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${videoOrientation === '16:9'
                                                ? 'bg-neon-pink/20 border-neon-pink text-white'
                                                : 'bg-black/30 border-white/10 text-gray-400 hover:bg-white/5'
                                                }`}
                                        >
                                            <Monitor size={18} />
                                            <span className="text-sm">Horizontal</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Reference Image */}
                                <div className="mb-4">
                                    <label className="text-xs text-gray-400 ml-1 mb-1 block">Reference Image (Optional)</label>
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
                                            <span className="text-xs text-gray-400">Upload Reference Image</span>
                                            <input type="file" accept="image/*" onChange={handleVideoUpload} className="hidden" />
                                        </label>
                                    )}
                                </div>

                                <div className="flex-1 flex flex-col mb-4 relative">
                                    <label className="text-xs text-gray-400 ml-1 mb-1">Prompt</label>
                                    <div className="relative">
                                        <textarea
                                            value={videoPrompt}
                                            onChange={(e) => setVideoPrompt(e.target.value)}
                                            placeholder="Describe the video action and style..."
                                            className="w-full glass-input rounded-xl px-4 py-3 text-sm resize-none min-h-[100px] pr-10"
                                        />
                                        <button
                                            onClick={() => enhancePrompt('video')}
                                            disabled={isLoading || !videoPrompt}
                                            className="absolute bottom-2 right-2 p-2 bg-neon-pink/20 rounded-lg text-neon-pink hover:bg-neon-pink/30 disabled:opacity-50 transition-colors"
                                            title="Enhance with AI"
                                        >
                                            <Sparkles size={16} />
                                        </button>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleGenerate('video')}
                                    disabled={isLoading}
                                    className="glass-button px-6 py-3 rounded-xl w-full font-semibold text-neon-pink shadow-[0_0_15px_rgba(255,0,255,0.3)] hover:shadow-[0_0_25px_rgba(255,0,255,0.5)] transition-all disabled:opacity-50"
                                >
                                    <span className="flex items-center justify-center gap-2">
                                        {isLoading ? <span className="animate-spin">⏳</span> : <Film size={18} />}
                                        Generate Video
                                    </span>
                                </button>
                            </div>
                        )}

                        {activeTab === 'profile' && (
                            <div className="flex flex-col h-full overflow-y-auto scrollbar-hide">
                                <h2 className="text-2xl font-bold mb-6 text-center">Choose Your Plan</h2>

                                <div className="space-y-4">
                                    {/* Starter Plan */}
                                    <div className="glass-panel p-4 rounded-2xl border border-white/10 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 bg-gray-700 text-[10px] px-2 py-1 rounded-bl-lg">FREE</div>
                                        <h3 className="text-lg font-bold text-white">Starter</h3>
                                        <p className="text-2xl font-bold mt-1">0₽ <span className="text-sm font-normal text-gray-400">/ mo</span></p>
                                        <ul className="text-sm text-gray-300 mt-3 space-y-1">
                                            <li className="flex items-center gap-2">✓ 10 Credits (Trial)</li>
                                            <li className="flex items-center gap-2">✓ Basic Text Gen</li>
                                            <li className="flex items-center gap-2">✓ Standard Speed</li>
                                        </ul>
                                        <button className="w-full mt-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-sm font-semibold">
                                            Current Plan
                                        </button>
                                    </div>

                                    {/* Pro Plan */}
                                    <div className="glass-panel p-4 rounded-2xl border border-neon-blue/50 relative overflow-hidden shadow-[0_0_20px_rgba(0,243,255,0.1)]">
                                        <div className="absolute top-0 right-0 bg-neon-blue text-black text-[10px] font-bold px-2 py-1 rounded-bl-lg">POPULAR</div>
                                        <h3 className="text-lg font-bold text-neon-blue">Pro Creator</h3>
                                        <p className="text-2xl font-bold mt-1">990₽ <span className="text-sm font-normal text-gray-400">/ mo</span></p>
                                        <ul className="text-sm text-gray-300 mt-3 space-y-1">
                                            <li className="flex items-center gap-2">✓ 500 Credits</li>
                                            <li className="flex items-center gap-2">✓ Gemini Vision (Image)</li>
                                            <li className="flex items-center gap-2">✓ Priority Support</li>
                                        </ul>
                                        <button className="w-full mt-4 py-2 rounded-xl bg-neon-blue text-black hover:bg-neon-blue/90 transition-colors text-sm font-bold shadow-[0_0_10px_rgba(0,243,255,0.3)]">
                                            Upgrade to Pro
                                        </button>
                                    </div>

                                    {/* Unlimited Plan */}
                                    <div className="glass-panel p-4 rounded-2xl border border-neon-purple/50 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 bg-neon-purple text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg">BEST VALUE</div>
                                        <h3 className="text-lg font-bold text-neon-purple">Unlimited</h3>
                                        <p className="text-2xl font-bold mt-1">2990₽ <span className="text-sm font-normal text-gray-400">/ mo</span></p>
                                        <ul className="text-sm text-gray-300 mt-3 space-y-1">
                                            <li className="flex items-center gap-2">✓ Unlimited Credits</li>
                                            <li className="flex items-center gap-2">✓ Video Generation</li>
                                            <li className="flex items-center gap-2">✓ Early Access Features</li>
                                        </ul>
                                        <button className="w-full mt-4 py-2 rounded-xl bg-neon-purple text-white hover:bg-neon-purple/90 transition-colors text-sm font-bold shadow-[0_0_10px_rgba(188,19,254,0.3)]">
                                            Get Unlimited
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </main>

                {/* Bottom Navigation */}
                <nav className="w-full max-w-md mt-6 glass-panel rounded-2xl p-2 flex justify-around">
                    <button
                        onClick={() => setActiveTab('chat')}
                        className={`p-3 rounded-xl transition-all ${activeTab === 'chat' ? 'bg-white/10 text-neon-blue shadow-[0_0_10px_rgba(0,243,255,0.3)]' : 'text-gray-400 hover:text-white'}`}
                    >
                        <Bot size={24} />
                    </button>
                    <button
                        onClick={() => setActiveTab('image')}
                        className={`p-3 rounded-xl transition-all ${activeTab === 'image' ? 'bg-white/10 text-neon-purple shadow-[0_0_10px_rgba(188,19,254,0.3)]' : 'text-gray-400 hover:text-white'}`}
                    >
                        <ImageIcon size={24} />
                    </button>
                    <button
                        onClick={() => setActiveTab('video')}
                        className={`p-3 rounded-xl transition-all ${activeTab === 'video' ? 'bg-white/10 text-neon-pink shadow-[0_0_10px_rgba(255,0,255,0.3)]' : 'text-gray-400 hover:text-white'}`}
                    >
                        <Video size={24} />
                    </button>
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`p-3 rounded-xl transition-all ${activeTab === 'profile' ? 'bg-white/10 text-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.3)]' : 'text-gray-400 hover:text-white'}`}
                    >
                        <Sparkles size={24} />
                    </button>
                </nav>

            </div>
        )
    }

    export default App
