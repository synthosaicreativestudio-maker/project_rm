import { useState } from 'react'
import { motion } from 'framer-motion'
import { Bot, Image as ImageIcon, Video, Sparkles, Upload, X, Smartphone, Monitor, Film } from 'lucide-react'

function App() {
    const [activeTab, setActiveTab] = useState('chat')
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false) // Kept for button loading state if needed, though sendData is instant.

    // Image Gen State
    const [subject, setSubject] = useState('')
    const [material, setMaterial] = useState('')
    const [lens, setLens] = useState('Portrait (85–135mm)')
    const [aperture, setAperture] = useState('f/1.8 (Bokeh)')
    const [angle, setAngle] = useState('Low Angle')
    const [lighting, setLighting] = useState('Cinematic Lighting')
    const [background, setBackground] = useState('')

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
    }


    const enhancePrompt = async (type: 'image' | 'video') => {
        // For image, we might want to enhance the 'subject' or just disable enhance for now
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
                // Enhance logic for structured form is complex, skipping for now or user can request later
                // setImagePrompt(data.enhanced_prompt) 
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
                tg.showAlert("Please describe the subject")
                return
            }
            // Assemble structured prompt
            prompt = `Subject: ${subject}. Material: ${material}. Camera: ${lens}, ${aperture}, ${angle}. Lighting: ${lighting}. Background: ${background}.`
        } else {
            prompt = videoPrompt
            if (!prompt.trim()) {
                tg.showAlert("Please enter a prompt")
                return
            }
        }

        const data = {
            type: type,
            prompt: prompt,
            params: type === 'image' ? { aspectRatio, resolution } : { orientation: videoOrientation }
        }

        tg.showAlert(`Sending ${type} request...`) // Debug alert
        tg.sendData(JSON.stringify(data))
    }

    const sendTextMessage = () => {
        const tg = (window as any).Telegram?.WebApp
        if (!tg) return

        if (!input.trim()) {
            tg.showAlert("Please enter a message")
            return
        }

        const data = {
            type: 'text',
            prompt: input,
            params: {}
        }

        tg.showAlert("Sending text request...") // Debug alert
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
                        <p className="text-xs text-gray-400">Gemini 3 Powered</p>
                    </div>
                </div>
                <div className="px-3 py-1 rounded-full bg-cyan-500/10 text-xs font-mono text-cyan-400 border border-cyan-500/20 shadow-[0_0_10px_rgba(34,211,238,0.2)]">
                    BETA
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
                                Chat Mode
                            </h2>
                            <p className="text-gray-400 text-center mb-8">
                                Ask Gemini 3.0 Pro anything. The bot will reply in the chat.
                            </p>

                            <div className="w-full space-y-4">
                                <textarea
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Type your prompt here..."
                                    className="w-full glass-input rounded-xl px-4 py-3 text-sm resize-none min-h-[120px]"
                                />
                                <button
                                    onClick={sendTextMessage}
                                    className="glass-button px-6 py-3 rounded-xl w-full font-semibold text-neon-blue shadow-[0_0_15px_rgba(0,243,255,0.3)] hover:shadow-[0_0_25px_rgba(0,243,255,0.5)] transition-all"
                                >
                                    <span className="flex items-center justify-center gap-2">
                                        <Sparkles size={18} />
                                        Send to Bot
                                    </span>
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

                            <div className="flex-1 flex flex-col mb-4 space-y-3">
                                {/* Subject */}
                                <div>
                                    <label className="text-xs text-gray-400 ml-1 mb-1 block">Subject (Who/What?)</label>
                                    <input
                                        type="text"
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        placeholder="e.g. Golden Retriever with wet fur"
                                        className="w-full glass-input rounded-xl px-4 py-2 text-sm"
                                    />
                                </div>

                                {/* Material */}
                                <div>
                                    <label className="text-xs text-gray-400 ml-1 mb-1 block">Material/Texture</label>
                                    <input
                                        type="text"
                                        value={material}
                                        onChange={(e) => setMaterial(e.target.value)}
                                        placeholder="e.g. Matte, Glossy Plastic, Silk"
                                        className="w-full glass-input rounded-xl px-4 py-2 text-sm"
                                    />
                                </div>

                                {/* Camera Settings Grid */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs text-gray-400 ml-1 mb-1 block">Lens</label>
                                        <select
                                            value={lens}
                                            onChange={(e) => setLens(e.target.value)}
                                            className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-neon-purple/50"
                                        >
                                            <option value="Wide Angle (16–24mm)">Wide Angle (16–24mm)</option>
                                            <option value="Portrait (85–135mm)">Portrait (85–135mm)</option>
                                            <option value="Macro">Macro</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-400 ml-1 mb-1 block">Aperture</label>
                                        <select
                                            value={aperture}
                                            onChange={(e) => setAperture(e.target.value)}
                                            className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-neon-purple/50"
                                        >
                                            <option value="f/1.8 (Bokeh)">f/1.8 (Bokeh)</option>
                                            <option value="f/16 (Deep Focus)">f/16 (Deep Focus)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs text-gray-400 ml-1 mb-1 block">Angle</label>
                                        <select
                                            value={angle}
                                            onChange={(e) => setAngle(e.target.value)}
                                            className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-neon-purple/50"
                                        >
                                            <option value="Low Angle">Low Angle</option>
                                            <option value="High Angle">High Angle</option>
                                            <option value="Dutch Angle">Dutch Angle</option>
                                            <option value="Eye Level">Eye Level</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-400 ml-1 mb-1 block">Lighting</label>
                                        <select
                                            value={lighting}
                                            onChange={(e) => setLighting(e.target.value)}
                                            className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-neon-purple/50"
                                        >
                                            <option value="Cinematic Lighting">Cinematic</option>
                                            <option value="Rim Lighting">Rim Lighting</option>
                                            <option value="Volumetric Lighting">Volumetric</option>
                                            <option value="Golden Hour">Golden Hour</option>
                                            <option value="Blue Hour">Blue Hour</option>
                                            <option value="Studio Lighting">Studio</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Background */}
                                <div>
                                    <label className="text-xs text-gray-400 ml-1 mb-1 block">Background</label>
                                    <input
                                        type="text"
                                        value={background}
                                        onChange={(e) => setBackground(e.target.value)}
                                        placeholder="e.g. Old library, Solid color"
                                        className="w-full glass-input rounded-xl px-4 py-2 text-sm"
                                    />
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
            <nav className="fixed bottom-6 left-0 right-0 mx-auto w-[90%] max-w-md glass-panel rounded-2xl p-2 flex justify-around z-50 backdrop-blur-xl bg-black/40 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
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
