import React, {
  useState,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

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
  const [ripple, setRipple] = useState({ x: 0, y: 0, active: false });
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
      const res = await fetch("http://localhost:3030/api/chat", {
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

  // Ripple effect saat diklik
  const handleCardClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setRipple({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      active: true,
    });
    setExpanded(!expanded);
    setTimeout(() => setRipple({ x: 0, y: 0, active: false }), 500);
  };

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
      className={`relative rounded-2xl p-4 mb-4 border shadow transition-all duration-300 ${
        expanded
          ? "bg-slate-800 border-blue-500/40 shadow-[0_0_25px_2px_rgba(56,189,248,0.3)]"
          : "bg-slate-900 border-slate-700"
      }`}
    >
      {/* Ripple animasi */}
      {ripple.active && (
        <span
          className="absolute rounded-full bg-blue-500/20 animate-ping"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: 100,
            height: 100,
            transform: "translate(-50%, -50%)",
          }}
        />
      )}

      {/* Header */}
      <div
        className="flex items-center justify-between cursor-pointer select-none relative overflow-hidden"
        onClick={handleCardClick}
      >
        <div>
          <div className="text-lg font-semibold">{modelName}</div>
          <div className="text-sm text-slate-400">{modelId}</div>
        </div>
        <ChevronDown
          className={`transition-transform duration-200 ${
            expanded ? "rotate-180" : ""
          }`}
        />
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
                  className={`mb-2 ${
                    m.role === "user" ? "text-blue-300" : "text-slate-200"
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
                className="flex-1 rounded px-3 py-2 bg-slate-700 text-white placeholder-slate-400"
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
