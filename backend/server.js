import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

// Load and clean API Key
const apiKeyRaw = process.env.OPENROUTER_API_KEY || "";
const OPENROUTER_API_KEY = apiKeyRaw.trim().replace(/^["']|["']$/g, '');

if (!OPENROUTER_API_KEY) {
    console.warn("⚠️ [WARN] OPENROUTER_API_KEY is missing in .env");
} else {
    console.log(`✅ [INFO] API Key loaded (Prefix: ${OPENROUTER_API_KEY.substring(0, 10)}..., Length: ${OPENROUTER_API_KEY.length})`);
}

app.post('/api/chat', async (req, res) => {
    const { model, messages } = req.body;

    if (!model || !messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: 'invalid_request', details: 'model and messages (array) are required' });
    }

    if (!OPENROUTER_API_KEY) {
        return res.status(500).json({ error: 'server_error', details: 'API Key not configured on server' });
    }

    try {
        console.log(`🚀 [API] Calling OpenRouter for model: ${model}`);

        const response = await fetch(OPENROUTER_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://multi-ai-lab.vercel.app/', // Ganti dengan URL Vercel kamu
                'X-Title': 'Multi AI Lab'
            },
            body: JSON.stringify({
                model,
                messages,
                temperature: 0.7,
                max_tokens: 1000
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error(`❌ [ERROR] OpenRouter returned ${response.status}:`, JSON.stringify(data, null, 2));
            return res.status(response.status).json({ error: 'OpenRouter Error', details: data });
        }

        // Optional: Clean up response content if needed (same as before)
        if (data?.choices?.[0]?.message?.content) {
            data.choices[0].message.content = data.choices[0].message.content
                .replace(/<[^>]*>/g, "")
                .replace(/[｜▁]/g, " ")
                .replace(/\s+/g, " ")
                .trim();
        }

        res.json(data);
    } catch (err) {
        console.error("🔥 [PROXY ERROR]:", err);
        res.status(500).json({ error: 'proxy_error', details: err.message });
    }
});

const port = process.env.PORT || 3030;
app.listen(port, () => {
    console.log(`🚀 [SERVER] Backend running on port ${port}`);
    console.log(`� [URL] http://localhost:${port}`);
});

process.on("SIGINT", () => {
    console.log("🛑 Stopping server...");
    process.exit(0);
});