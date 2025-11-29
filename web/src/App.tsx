import { useState } from 'react'
import { motion } from 'framer-motion'
import { Bot, Image as ImageIcon, Video, Sparkles } from 'lucide-react'

function App() {
    const [activeTab, setActiveTab] = useState('chat')

    return (
        <div className="min-h-screen p-4 flex flex-col items-center justify-center text-white">

            {/* Header */}
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md mb-8 flex items-center justify-between glass-panel p-4 rounded-2xl"
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
            <main className="w-full max-w-md flex-1 relative">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="glass-panel rounded-3xl p-6 min-h-[400px] flex flex-col items-center justify-center text-center space-y-4"
                >
                    {activeTab === 'chat' && (
                        <>
                            <Bot size={64} className="text-neon-blue mb-4 drop-shadow-[0_0_10px_rgba(0,243,255,0.5)]" />
                            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neon-blue to-neon-purple">
                                AI Assistant
                            </h2>
                            <p className="text-gray-400 text-sm">
                                Ask me anything or upload a document for analysis.
                            </p>
                            <button className="glass-button px-6 py-3 rounded-xl w-full mt-8 font-semibold text-neon-blue">
                                Start New Chat
                            </button>
                        </>
                    )}

                    {activeTab === 'image' && (
                        <>
                            <ImageIcon size={64} className="text-neon-purple mb-4 drop-shadow-[0_0_10px_rgba(188,19,254,0.5)]" />
                            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neon-purple to-neon-pink">
                                Image Gen
                            </h2>
                            <p className="text-gray-400 text-sm">
                                Create stunning visuals with Gemini Vision.
                            </p>
                            <button className="glass-button px-6 py-3 rounded-xl w-full mt-8 font-semibold text-neon-purple">
                                Create Artwork
                            </button>
                        </>
                    )}

                    {activeTab === 'video' && (
                        <>
                            <Video size={64} className="text-neon-pink mb-4 drop-shadow-[0_0_10px_rgba(255,0,255,0.5)]" />
                            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neon-pink to-orange-500">
                                Video Studio
                            </h2>
                            <p className="text-gray-400 text-sm">
                                Generate videos from text or images.
                            </p>
                            <button className="glass-button px-6 py-3 rounded-xl w-full mt-8 font-semibold text-neon-pink">
                                Create Video
                            </button>
                        </>
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
            </nav>

        </div>
    )
}

export default App
