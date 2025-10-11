import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import ChatCard from "./components/ChatCard";

const MODELS = [
    { name: "GPT-4o (OpenAI)", id: "openai/gpt-oss-20b:free" },
    //   { name: "Claude 3", id: "anthropic/claude-3-sonnet" },
    { name: "Gemini 3 12b", id: "google/gemma-3-12b-it:free" },
    { name: "Meta: Llama 3.2 3b", id: "meta-llama/llama-3.2-3b-instruct:free" },
    { name: "Mistral 7B", id: "mistralai/mistral-7b-instruct:free" },
    //   { name: "Grok 2", id: "xai/grok-2" },
    { name: "Qwen 3-8b", id: "qwen/qwen3-8b:free" },
    { name: "DeepSeek V3.1", id: "deepseek/deepseek-chat-v3.1:free" },
];

export default function App() {
    const [prompt, setPrompt] = useState("");
    const refs = useRef([]);

    const handleSend = () => {
        if (!prompt.trim()) return;
        refs.current.forEach((ref) => ref?.sendMessage(prompt));
        setPrompt("");
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white pb-24 p-6">
            <h1 className="text-3xl font-bold text-center mb-8">
                🚀 Multi AI Playground
            </h1>

            {/* Card Container */}
            <div className="flex flex-wrap gap-6 justify-center">
                {MODELS.map((m, i) => (
                    <motion.div
                        key={m.id}
                        layout="position"
                        className="w-full md:w-[48%] lg:w-[30%]"
                    >
                        <ChatCard
                            ref={(el) => (refs.current[i] = el)}
                            modelName={m.name}
                            modelId={m.id}
                            index={i}
                        />
                    </motion.div>
                ))}
            </div>

            {/* Sticky Input Global */}
            <div className="fixed bottom-0 left-0 w-full bg-gray-800 border-t border-gray-700 p-3 flex gap-2 items-center">
                <input
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Ketik prompt global untuk semua AI..."
                    className="flex-1 bg-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-400"
                />
                <button
                    onClick={handleSend}
                    className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg"
                >
                    Kirim
                </button>
            </div>
        </div>
    );
}
