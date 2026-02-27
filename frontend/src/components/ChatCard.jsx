import React, {
    useState,
    useRef,
    useEffect,
    forwardRef,
    useImperativeHandle,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

// const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "";
// const BACKEND_URL = "https://multi-ai-lab.zeabur.app";

const ChatCard = forwardRef(({ modelName, modelId, index = 0 }, ref) => {
    const [expanded, setExpanded] = useState(true);
    const [messages, setMessages] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem(`chat:${modelId}`)) || [];
        } catch {
            return [];
        }
    });
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        localStorage.setItem(`chat:${modelId}`, JSON.stringify(messages));
    }, [messages, modelId]);

    async function sendMessage(promptText) {
        const newMsg = { role: "user", content: promptText };
        const newMessages = [...messages, newMsg];
        setMessages(newMessages);
        setLoading(true);

        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ model: modelId, messages: newMessages }),
            });
            const data = await res.json();
            const assistant =
                data?.choices?.[0]?.message || {
                    role: "assistant",
                    content: "(no reply)",
                };
            setMessages((prev) => [...prev, assistant]);
        } catch (err) {
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: "Error: " + (err.message || "unknown") },
            ]);
        } finally {
            setLoading(false);
            setTimeout(() => {
                containerRef.current?.scrollTo({
                    top: containerRef.current.scrollHeight,
                    behavior: "smooth",
                });
            }, 100);
        }
    }

    useImperativeHandle(ref, () => ({
        sendMessage,
    }));

    const handleLocalSend = () => {
        if (!input.trim()) return;
        sendMessage(input.trim());
        setInput("");
    };

    function clearChat() {
        setMessages([])
        localStorage.removeItem(`chat:${modelId}`)
    }

    return (
        <motion.div
            layout="position"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                delay: index * 0.1,
                duration: 0.4,
                ease: [0.25, 0.1, 0.25, 1],
            }}
            className={`rounded-2xl p-4 mb-4 shadow border border-slate-700 ${expanded ? "bg-slate-800" : "bg-slate-900"
                }`}
        >
            {/* Header */}
            <div
                className="flex items-center justify-between cursor-pointer select-none"
                onClick={() => setExpanded(!expanded)}
            >
                <div>
                    <div className="text-lg font-semibold">{modelName}</div>
                    <div className="text-sm text-slate-400">{modelId}</div>
                </div>
                <div className="flex gap-2 items-center">
                    <button onClick={(e) => { e.stopPropagation(); clearChat(); }} className="text-sm px-2 py-1 rounded bg-slate-700">Clear</button>
                    <ChevronDown
                        className={`transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
                    />
                </div>
            </div>

            {/* Konten Expand/Collapse */}
            <AnimatePresence initial={false}>
                {expanded && (
                    <motion.div
                        key="content"
                        layout="position"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{
                            ease: [0.25, 0.1, 0.25, 1],
                            duration: 0.25,
                        }}
                        className="mt-3"
                    >
                        <div
                            ref={containerRef}
                            style={{ minHeight: 200 }}
                            className="max-h-64 overflow-y-auto bg-slate-900 p-3 rounded"
                        >
                            {messages.length === 0 && (
                                <div className="text-slate-500">Mulai percakapan...</div>
                            )}
                            {messages.map((m, i) => (
                                <div
                                    key={i}
                                    className={`mb-2 ${m.role === "user" ? "text-blue-300" : "text-slate-200"
                                        }`}
                                >
                                    <strong className="mr-2">{m.role}</strong>: {m.content}
                                </div>
                            ))}
                            {loading && (
                                <div className="text-slate-400 italic">Thinking...</div>
                            )}
                        </div>

                        {/* local input */}
                        <div className="mt-3 flex gap-2">
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleLocalSend()}
                                placeholder="Ketik pesan untuk AI ini..."
                                className="flex-1 rounded px-3 py-2 bg-slate-700"
                            />
                            <button
                                onClick={handleLocalSend}
                                disabled={loading}
                                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
                            >
                                Kirim
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
});

export default ChatCard;
