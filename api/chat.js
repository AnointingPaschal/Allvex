// Vercel Serverless Function — keeps the OpenRouter API key server-side.
// The key must be set as an environment variable named OPENROUTER_API_KEY
// in the Vercel project settings (Settings -> Environment Variables).
// It must NEVER be placed in frontend code or committed to the repo.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "method_not_allowed" });
    return;
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    res.status(500).json({
      error: "missing_api_key",
      message:
        "OPENROUTER_API_KEY is not configured on the server. Add it in Vercel: Project Settings -> Environment Variables, then redeploy.",
    });
    return;
  }

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      res.status(400).json({ error: "invalid_json" });
      return;
    }
  }

  const { messages } = body || {};
  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: "invalid_request", message: "messages array is required." });
    return;
  }

  try {
    const upstream = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://allvex.app",
        "X-Title": "Allvex Assistant",
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b",
        messages,
        temperature: 0.4,
        max_tokens: 700,
      }),
    });

    if (!upstream.ok) {
      const text = await upstream.text();
      res.status(upstream.status).json({ error: "upstream_error", message: text });
      return;
    }

    const data = await upstream.json();
    const reply = data?.choices?.[0]?.message?.content?.trim() || "I couldn't generate a response. Please try again.";
    res.status(200).json({ reply });
  } catch (err) {
    res.status(500).json({ error: "server_error", message: err.message });
  }
}
