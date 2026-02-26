import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import ChatCard from "./components/ChatCard";

const MODELS = [
    { name: "GPT-5.1", id: "openai/gpt-5.1" },
    { name: "Gemini 3", id: "google/gemma-3-12b-it" },
    { name: "Llama 3.3", id: "meta-llama/llama-3.3-70b-instruct" },
    { name: "Mistral 3", id: "mistralai/mistral-small-creative" },
    { name: "Qwen 3.5", id: "qwen/qwen3.5-flash-02-23" },
    { name: "Z.ai", id: "z-ai/glm-4.5" },
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
