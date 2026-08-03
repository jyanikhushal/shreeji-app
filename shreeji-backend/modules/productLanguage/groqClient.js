async function callGroq(model, prompt, reasoningEffort = 'none') {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
      max_tokens: 300,
      reasoning_effort: reasoningEffort,
    }),
  });

  if (!res.ok) {
    const errorBody = await res.text().catch(() => '');
    console.error(`Groq API error (${model}): ${res.status} — ${errorBody.slice(0, 300)}`);
    throw new Error(`Groq API error: ${res.status}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error('Empty response from Groq');

  const cleaned = content
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .replace(/```json|```/g, '')
    .trim();

  return JSON.parse(cleaned);
}

function translationPrompt(rawText) {
  return `You are helping build a translation dictionary for an Indian kirana (grocery) store app. Given an English or Hinglish word/phrase a shopkeeper typed for a product or common shop phrase, provide the correct, natural, grammatically correct Gujarati and Hindi translation — not a letter-by-letter phonetic transliteration, but how a native speaker would actually write it (correct gender agreement, correct particles like no/ni/nu in Gujarati).

Input: "${rawText}"

Respond with ONLY valid JSON, no other text, in this exact format:
{"gu": "<gujarati translation>", "hi": "<hindi translation>", "en": "<clean english meaning>"}`;
}

async function getEnsembleTranslation(rawText) {
  const prompt = translationPrompt(rawText);

  const results = await Promise.allSettled([
    callGroq('qwen/qwen3.6-27b', prompt),
    callGroq('openai/gpt-oss-120b', prompt),
  ]);

  const candidates = results
    .filter(r => r.status === 'fulfilled')
    .map(r => r.value);

  if (candidates.length === 0) {
    throw new Error('Both candidate models failed');
  }
  if (candidates.length === 1) {
    return candidates[0]; // only one succeeded, no judging needed
  }

  const judgePrompt = `Two AI models translated the same Indian kirana-shop word/phrase into Gujarati and Hindi. Pick the more natural, grammatically correct option, or combine the best parts of both if one got Gujarati right and the other got Hindi right.

Original input: "${rawText}"

Candidate A: ${JSON.stringify(candidates[0])}
Candidate B: ${JSON.stringify(candidates[1])}

Respond with ONLY valid JSON, no other text, in this exact format:
{"gu": "<best gujarati>", "hi": "<best hindi>", "en": "<best english meaning>"}`;

  try {
    return await callGroq('openai/gpt-oss-120b', judgePrompt);
  } catch (err) {
    console.error('Judge call failed, falling back to first candidate:', err.message);
    return candidates[0];
  }
}

module.exports = { getEnsembleTranslation };