import { useState } from 'react'
import { motion } from 'framer-motion'
import { Bot, Image as ImageIcon, Video, Sparkles } from 'lucide-react'

function App() {
    const [activeTab, setActiveTab] = useState('chat')
    const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)

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
                <div className="px-3 py-1 rounded-full bg-black/30 text-xs font-mono text-neon-blue border border-neon-blue/30">
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
                                    className="flex-1 bg-black/30 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-neon-blue/50 transition-colors"
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
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <ImageIcon size={64} className="text-neon-purple mb-4 drop-shadow-[0_0_10px_rgba(188,19,254,0.5)]" />
                            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neon-purple to-neon-pink">
                                Image Gen
                            </h2>
                            <p className="text-gray-400 text-sm mb-8">
                                Create stunning visuals with Gemini Vision.
                            </p>
                            <button className="glass-button px-6 py-3 rounded-xl w-full font-semibold text-neon-purple">
                                Create Artwork
                            </button>
                        </div>
                    )}

                    {activeTab === 'video' && (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <Video size={64} className="text-neon-pink mb-4 drop-shadow-[0_0_10px_rgba(255,0,255,0.5)]" />
                            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neon-pink to-orange-500">
                                Video Studio
                            </h2>
                            <p className="text-gray-400 text-sm mb-8">
                                Generate videos from text or images.
                            </p>
                            <button className="glass-button px-6 py-3 rounded-xl w-full font-semibold text-neon-pink">
                                Create Video
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
