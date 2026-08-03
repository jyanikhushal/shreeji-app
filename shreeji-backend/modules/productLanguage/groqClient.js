async function translateWithQwen(rawText) {
  const prompt = `You are helping build a translation dictionary for an Indian kirana (grocery) store app. Given an English or Hinglish word/phrase a shopkeeper typed for a product or common shop phrase, provide the correct, natural, grammatically correct Gujarati and Hindi translation — not a letter-by-letter phonetic transliteration, but how a native speaker would actually write it (correct gender agreement, correct particles like no/ni/nu in Gujarati).

Input: "${rawText}"

Respond with ONLY valid JSON, no other text, in this exact format:
{"gu": "<gujarati translation>", "hi": "<hindi translation>", "en": "<clean english meaning>"}`;

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'qwen/qwen3.6-27b',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
      max_tokens: 200,
    }),
  });

  if (!res.ok) {
  const errorBody = await res.text().catch(() => '');
  console.error(`Groq API error: ${res.status} — ${errorBody.slice(0, 300)}`);
  throw new Error(`Groq API error: ${res.status}`);
}

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error('Empty response from Groq');

  // Qwen sometimes wraps JSON in markdown fences — strip if present
  const cleaned = content.replace(/```json|```/g, '').trim();
  return JSON.parse(cleaned);
}

module.exports = { translateWithQwen };