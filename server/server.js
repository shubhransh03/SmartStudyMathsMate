
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_CHAT_URL = 'https://api.openai.com/v1/chat/completions';

// Simple in-memory cache
const cache = new Map();
const CACHE_DURATION = 1000 * 60 * 30; // 30 minutes
// Backoff map to avoid hammering Gemini after 429s per subject-topic
const backoff = new Map(); // key -> timestamp (ms) when calls are allowed again

async function getCachedOrFetch(key, fetchFunction) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  const data = await fetchFunction();
  cache.set(key, { data, timestamp: Date.now() });
  return data;
}

function parseRetryAfterSeconds(resp, bodyText) {
  // Try header first
  const header = resp.headers?.get?.('retry-after');
  if (header) {
    const s = parseInt(header, 10);
    if (!Number.isNaN(s)) return s;
  }
  // Try body as JSON
  try {
    const obj = typeof bodyText === 'string' ? JSON.parse(bodyText) : bodyText;
    // Google RPC RetryInfo
    const details = obj?.error?.details || obj?.details || [];
    for (const d of details) {
      if (d['@type']?.includes('RetryInfo') && d.retryDelay) {
        // e.g., "42s" or "42.6s"
        const m = String(d.retryDelay).match(/([0-9]+)(?:\.[0-9]+)?s/);
        if (m && m[1]) return parseInt(m[1], 10);
      }
    }
  } catch {}
  return null;
}

function localExplain(subject, topic) {
  const s = String(subject || '').toLowerCase();
  const t = String(topic || 'this topic');
  if (s.includes('math')) {
    return `Here’s a quick overview of ${t}.
- What it is: A core concept in mathematics for Class 10.
- Why it matters: Builds intuition and skills used in other chapters and exams.
- How to learn: Start with definitions and simple examples, then try a few practice problems.
- Tip: Focus on understanding the rules/formulas and when to apply them.

Sorry, the AI explanation hit a temporary rate limit. This fallback is provided so you can keep learning. Try again in a minute for a richer AI-generated explanation.`;
  }
  return `Here’s a brief overview of ${t}.
This is a placeholder while the AI explanation is temporarily unavailable due to rate limits. Please try again shortly for a detailed explanation.`;
}

async function callGemini(promptText) {
  if (!GEMINI_API_KEY) throw Object.assign(new Error('NO_GEMINI_KEY'), { code: 'NO_KEY' });
  const body = {
    contents: [{ parts: [{ text: promptText }]}]
  };
  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
  });
  const raw = await response.text();
  if (!response.ok) {
    if (response.status === 429) {
      const retryAfterSeconds = parseRetryAfterSeconds(response, raw) ?? 60;
      throw Object.assign(new Error('RATE_LIMIT'), { code: 429, retryAfterSeconds, raw });
    }
    if (response.status === 503) {
      const retryAfterSeconds = parseRetryAfterSeconds(response, raw) ?? 45;
      throw Object.assign(new Error('OVERLOADED'), { code: 503, retryAfterSeconds, raw });
    }
    throw Object.assign(new Error(`Gemini HTTP ${response.status}`), { code: response.status, raw });
  }
  const result = JSON.parse(raw);
  const text = result?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (!text) throw Object.assign(new Error('Gemini empty response'), { code: 'EMPTY', raw: result });
  return text;
}

async function callOpenAIChat(systemPrompt, userPrompt) {
  if (!OPENAI_API_KEY) throw Object.assign(new Error('NO_OPENAI_KEY'), { code: 'NO_KEY' });
  const body = {
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.2,
  };
  const response = await fetch(OPENAI_CHAT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify(body),
  });
  const raw = await response.text();
  if (!response.ok) {
    throw Object.assign(new Error(`OpenAI HTTP ${response.status}`), { code: response.status, raw });
  }
  const result = JSON.parse(raw);
  const text = result?.choices?.[0]?.message?.content?.trim();
  if (!text) throw Object.assign(new Error('OpenAI empty response'), { code: 'EMPTY', raw: result });
  return text;
}

// Local rule-based solvers for simple math prompts
function tryLocalSolve(promptText) {
  if (!promptText) return null;
  const text = String(promptText).toLowerCase();
  // Handle: "Check whether a/b has a terminating decimal expansion"
  const compact = text.replace(/\s+/g, '');
  if (
    text.includes('terminating decimal') ||
    text.includes('terminating decimal expansion') ||
    (text.includes('terminating') && text.includes('decimal')) ||
    compact.includes('terminatingdecimalexpansion')
  ) {
    // Find first fraction a/b
    const m = text.match(/(\d+)\s*\/\s*(\d+)/);
    if (m) {
      let num = parseInt(m[1], 10);
      let den = parseInt(m[2], 10);
      if (den === 0) {
        return { solution: 'Undefined: denominator is 0.' };
      }
      // Reduce fraction to lowest terms
      const gcd = (a, b) => b === 0 ? Math.abs(a) : gcd(b, a % b);
      const g = gcd(num, den);
      num = Math.floor(num / g);
      den = Math.floor(den / g);
      // Remove all 2s and 5s from denominator
      let d = den;
      const remove = (p) => { while (d % p === 0) d = Math.floor(d / p); };
      remove(2); remove(5);
      const isTerminating = d === 1;
      const steps = [
        `Given fraction: ${m[1]}/${m[2]}`,
        `Reduce to lowest terms: ${num}/${den} (gcd = ${g})`,
        `Prime factors of the reduced denominator should be only 2 and/or 5 for a terminating decimal.`,
        `Remove factors 2 and 5 from ${den}: remaining = ${d}.`,
        isTerminating
          ? `Since remaining = 1, the decimal expansion terminates.`
          : `Since remaining ≠ 1, the decimal expansion is non-terminating repeating.`,
      ];
      return { solution: steps.join('\n') };
    }
  }

  // Handle: "Is ... rational or irrational?"
  if ((text.includes('rational') && text.includes('irrational')) || compact.includes('rationalorirrational')) {
    const steps = [];
    // sqrt(a/b)
  let m = text.match(/sqrt\s*\(\s*(\d+)\s*\/\s*(\d+)\s*\)/) || compact.match(/sqrt\((\d+)\/(\d+)\)/);
    const isPerfectSquare = (n) => {
      if (n < 0) return false;
      const r = Math.floor(Math.sqrt(n));
      return r * r === n;
    };
    const gcd = (a, b) => b === 0 ? Math.abs(a) : gcd(b, a % b);
    if (m) {
      let a = parseInt(m[1], 10);
      let b = parseInt(m[2], 10);
      const g = gcd(a, b);
      const ar = Math.floor(a / g);
      const br = Math.floor(b / g);
      steps.push(`Given: sqrt(${a}/${b})`);
      steps.push(`Reduce the fraction inside the root: ${a}/${b} = ${ar}/${br} (gcd = ${g}).`);
      const numSquare = isPerfectSquare(ar);
      const denSquare = isPerfectSquare(br);
      steps.push(`Check perfect squares: numerator ${ar} ${numSquare ? 'is' : 'is not'} a perfect square; denominator ${br} ${denSquare ? 'is' : 'is not'} a perfect square.`);
      if (numSquare && denSquare) {
        const rn = Math.sqrt(ar);
        const rd = Math.sqrt(br);
        steps.push(`sqrt(${ar}/${br}) = sqrt(${ar})/sqrt(${br}) = ${rn}/${rd}, which is rational.`);
        return { solution: steps.join('\n') };
      }
      steps.push(`Since both numerator and denominator are not perfect squares after reduction, sqrt(${ar}/${br}) is irrational.`);
      return { solution: steps.join('\n') };
    }

    // sqrt(n)
    m = text.match(/sqrt\s*\(\s*(\d+)\s*\)/) || compact.match(/sqrt\((\d+)\)/) || text.match(/[√]\s*(\d+)/);
    if (m) {
      const n = parseInt(m[1], 10);
      steps.push(`Given: sqrt(${n})`);
      const r = Math.floor(Math.sqrt(n));
      if (r * r === n) {
        steps.push(`${n} is a perfect square (${r}×${r}). Hence sqrt(${n}) = ${r}, which is rational.`);
        return { solution: steps.join('\n') };
      }
      steps.push(`${n} is not a perfect square. Therefore sqrt(${n}) is irrational.`);
      return { solution: steps.join('\n') };
    }

    // Constants and straightforward forms
    if (text.includes('pi') || text.includes('π')) {
      steps.push(`π (pi) is a known irrational number. Therefore it is irrational.`);
      return { solution: steps.join('\n') };
    }
    if (/\be\b/.test(text)) {
      steps.push(`e (Euler's number) is a known irrational number. Therefore it is irrational.`);
      return { solution: steps.join('\n') };
    }
    // Fraction a/b
    m = text.match(/\b(\d+)\s*\/\s*(\d+)\b/);
    if (m) {
      steps.push(`Given: ${m[1]}/${m[2]}. Any ratio of integers (with non-zero denominator) is rational.`);
      return { solution: steps.join('\n') };
    }
    // Integer or decimal
    m = text.match(/(-?\d+)(?:\.(\d+))?/);
    if (m) {
      if (m[2]) steps.push(`Finite decimal ${m[0]} can be written as a fraction over a power of 10, hence rational.`);
      else steps.push(`Integer ${m[1]} is rational (equal to ${m[1]}/1).`);
      return { solution: steps.join('\n') };
    }
  }
  return null;
}

// API endpoint to explain topics using Gemini
app.get('/api/explain/:subject/:topic', async (req, res) => {
  try {
    const { subject, topic } = req.params;
    const cacheKey = `${subject}-${topic}`;
    const forceGemini = String(req.query.force || '').toLowerCase() === 'gemini';

    if (!GEMINI_API_KEY) {
      return res.json({
        explanation: `This is a placeholder explanation for ${topic} in ${subject}. To get AI-generated explanations, please configure your Gemini API key in the server/.env file as GEMINI_API_KEY.`,
        cached: false
      });
    }

    // Respect any active backoff for this key (unless forceGemini is set)
    const until = backoff.get(cacheKey);
    if (!forceGemini && until && Date.now() < until) {
      const retryAfterSeconds = Math.max(1, Math.ceil((until - Date.now()) / 1000));
      return res.json({ explanation: localExplain(subject, topic), cached: false, rateLimited: true, retryAfterSeconds });
    }

    const explanation = await getCachedOrFetch(cacheKey, async () => {
      const prompt = `Explain "${topic}" in ${subject} for Class 10 students in 4-5 simple, clear sentences. Use easy-to-understand language and include a practical example if possible.`;
      try {
        return await callGemini(prompt);
      } catch (error) {
        if (error?.code === 429 || error?.code === 503) {
          const seconds = error.retryAfterSeconds ?? 60;
          backoff.set(cacheKey, Date.now() + seconds * 1000);
          console.warn('Explain API temporary unavailable', { cacheKey, status: error?.code, retryAfterSeconds: seconds });
          // Try OpenAI fallback if available
          if (OPENAI_API_KEY) {
            try {
              return await callOpenAIChat(
                'You are a helpful Class 10 tutor. Keep it simple and clear.',
                prompt
              );
            } catch (e2) {
              // Fall through to rate-limit handling below
              throw Object.assign(error, { openaiFallbackFailed: true, openaiError: e2 });
            }
          }
        }
        // Re-throw and let outer handler deliver fallback/local
        throw error;
      }
    });

    res.json({ explanation, cached: cache.has(cacheKey) });
  } catch (error) {
    // If rate-limited, we return a local fallback; keep logs at warn level
    if (error?.code === 429 || error?.code === 503) {
      // Serve a local fallback instead of surfacing an error; include retry hint
      const { subject, topic } = req.params;
      const cacheKey = `${subject}-${topic}`;
      const seconds = error.retryAfterSeconds ?? 60;
      backoff.set(cacheKey, Date.now() + seconds * 1000);
      // If OpenAI fallback worked above, we wouldn't be here. If it failed and caller insisted on Gemini-only (no alt provider), return 429.
      if (error.forceGemini && !OPENAI_API_KEY) {
        const status = error?.code === 503 ? 503 : 429;
        return res.status(status).json({ error: status === 503 ? 'OVERLOADED' : 'RATE_LIMIT', message: 'Model is temporarily unavailable. Please try again later.', retryAfterSeconds: seconds, detail: error.raw || undefined });
      }
      return res.json({ explanation: localExplain(subject, topic), cached: false, rateLimited: true, retryAfterSeconds: seconds });
    }
    console.error('Error fetching explanation:', error);
    res.status(500).json({ error: 'Failed to fetch explanation', message: error.message });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running!', timestamp: new Date().toISOString() });
});

// AI Problem Solver endpoint
app.post('/api/solve', async (req, res) => {
  try {
    const { prompt } = req.body || {};
    const forceGemini = String(req.query.force || '').toLowerCase() === 'gemini' || process.env.SOLVER_FORCE_GEMINI === 'true';
    if (!prompt) {
      return res.status(400).json({ error: 'Missing prompt' });
    }

    // Try local solver for simple, known patterns to avoid external API failures
    if (!forceGemini) {
      const local = tryLocalSolve(prompt);
      if (local) {
        return res.json(local);
      }
    }

    if (!GEMINI_API_KEY) {
      return res.json({
        solution: `Placeholder solution. Configure GEMINI_API_KEY in server/.env to enable AI solving.\n\nProblem: ${prompt}`,
      });
    }

    const body = {
      contents: [{
        parts: [{
          text: `Solve the following math problem step-by-step. Use concise, student-friendly explanations and include formulas in LaTeX when appropriate. Problem: ${prompt}`
        }]
      }]
    };

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
    });

    if (!response.ok) {
      const t = await response.text();
      if (response.status === 429 || response.status === 503) {
        const retryAfterSeconds = parseRetryAfterSeconds(response, t) ?? (response.status === 503 ? 45 : 60);
        console.warn('Solve API temporarily unavailable', { status: response.status, retryAfterSeconds });
        return res.status(response.status).json({
          error: response.status === 503 ? 'OVERLOADED' : 'RATE_LIMIT',
          message: 'Model is temporarily unavailable. Please wait and try again.',
          retryAfterSeconds,
          detail: t,
        });
      }
      console.error('Solve API error', t);
      return res.status(500).json({ error: 'Failed to get solution', detail: t });
    }
    const result = await response.json();
    const solution = result?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    res.json({ solution: solution || 'No solution returned' });
  } catch (err) {
    console.error('Solve endpoint error', err);
    res.status(500).json({ error: 'Unexpected error', message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Study Helper Backend running on port ${PORT}`);
  console.log(`📚 Ready to help students learn!`);
});