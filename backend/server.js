import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();


const app = express();
app.use(cors());
app.use(express.json());

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "";

if (!OPENROUTER_API_KEY) {
    console.warn("[WARN] OPENROUTER_API_KEY not set. Set it via env var.");
}


app.post('/api/chat', async (req, res) => {
    const { model, messages } = req.body;
    if (!model || !messages) {
        return res.status(400).json({ error: 'invalid_request', details: 'model and messages are required' });
    }

    // Basic validation of messages
    if (!Array.isArray(messages) || !messages.every(msg => msg.role && msg.content)) {
        return res.status(400).json({ error: 'invalid_request', details: 'messages must be an array of {role, content}' });
    }

    // Forward the request to OpenRouter
    try {
        const resp = await fetch(OPENROUTER_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://multi-ai-lab.vercel.app/', //'http://localhost:5173', // ubah nanti sesuai domain
                "X-Title": "Multi AI Lab",
            },
            body: JSON.stringify(
                { model, messages, temperature: 0.7, top_p: 0.9, stream: false, max_tokens: 1000 }
            )
        });


        const data = await resp.json();
        if (data?.choices?.[0]?.message?.content) {
            data.choices[0].message.content = data.choices[0].message.content
                .replace(/<[^>]*>/g, "") // hapus semua markup <...>
                .replace(/[｜▁]/g, " ")   // hapus simbol aneh unicode
                .replace(/\s+/g, " ")
                .trim();
        }

        if (!data?.choices?.length) {
            console.warn(`⚠️ No choices returned for model: ${model}`);
            console.warn("Raw response:", JSON.stringify(data, null, 2));
        }

        if (!resp.ok) {
            return res.status(resp.status).json({ error: 'OpenRouter Error:', details: data });
        }

        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'proxy_error', details: err.message });
    }
});


const port = process.env.PORT || 3030;
app.listen(port, () => console.log(`✅ Backend proxy running on http://localhost:${port}`));

function gracefulShutdown(signal) {
    console.log(`🛑 Server received ${signal}, shutting down...`);
    process.exit(0);
}

process.on("SIGINT", () => gracefulShutdown("SIGINT (manual stop)"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM (system stop)"));