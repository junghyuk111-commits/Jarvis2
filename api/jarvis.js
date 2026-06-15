// api/jarvis.js — Claude 두뇌 (서버리스, API 키는 여기서만 사용 → 노출 안 됨)
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "POST only" });
    return;
  }

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    res.status(500).json({ error: "ANTHROPIC_API_KEY 환경변수가 없습니다." });
    return;
  }

  try {
    const { messages } = req.body || {};
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5", // 더 똑똑하게: claude-opus-4-8 / 더 빠르게: claude-haiku-4-5
        max_tokens: 400,
        system:
          "너는 '자비스'라는 한국어 음성 비서다. 사용자를 '보스'라고 부르고, " +
          "짧고 자연스러운 구어체로 답한다. 음성으로 읽히므로 목록·기호 없이 1~3문장으로 말한다.",
        messages: messages || [],
      }),
    });

    const data = await r.json();
    if (data.error) {
      res.status(500).json({ error: data.error.message || "Claude 오류" });
      return;
    }
    const reply = (data.content || [])
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();
    res.status(200).json({ reply });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}
