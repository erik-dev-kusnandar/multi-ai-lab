export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { model, messages } = req.body;
    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

    if (!OPENROUTER_API_KEY) {
        return res.status(500).json({ error: 'server_error', details: 'API Key not configured on Vercel' });
    }

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY.trim()}`,
                'Content-Type': 'application/json',
                // 'HTTP-Referer': 'https://multi-ai-lab.vercel.app/',
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
            return res.status(response.status).json({ error: 'OpenRouter Error', details: data });
        }

        // Clean up response content
        if (data?.choices?.[0]?.message?.content) {
            data.choices[0].message.content = data.choices[0].message.content
                .replace(/<[^>]*>/g, "")
                .replace(/[｜▁]/g, " ")
                .replace(/\s+/g, " ")
                .trim();
        }

        return res.status(200).json(data);
    } catch (err) {
        return res.status(500).json({ error: 'proxy_error', details: err.message });
    }
}
