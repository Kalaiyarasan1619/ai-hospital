import { useCallback, useState } from 'react';
import { SparklesIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';

const buildAskUrls = (rawBase) => {
  if (!rawBase) return [];
  const base = rawBase.replace(/\/$/, '');
  if (base.endsWith('/ask')) return [base];
  if (base.includes('/api/ai')) return [`${base}/ask`];
  return [`${base}/api/ai/ask`, `${base}/ask`];
};

// const AI_SERVICE_URLS = [
//   ...buildAskUrls(import.meta.env.VITE_AI_SERVICE_URL),
//   'http://localhost:8000/ask',
//   'https://ai-hospital-python-ai-service.onrender.com/ask',
//   'https://ai-hospital-python-ai-service.onrender.com/api/ai/ask',
//   '/api/ai/ask',
// ].filter(Boolean);

const AI_SERVICE_URLS = [
  'https://ai-hospital-python-ai.onrender.com/ask'
];

export default function AiAssistant() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const ask = useCallback(async () => {
    const q = question.trim();
    if (!q) return;

    setLoading(true);
    setError('');
    setAnswer('');

    let lastErr = 'Could not reach the AI service.';
    for (const base of AI_SERVICE_URLS) {
      try {
        const res = await fetch(base, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: q }),
        });
        if (!res.ok) {
          const text = await res.text();
          lastErr = text || `HTTP ${res.status}`;
          continue;
        }
        const data = await res.json();
        setAnswer(typeof data.answer === 'string' ? data.answer : JSON.stringify(data));
        setLoading(false);
        return;
      } catch (e) {
        lastErr = e instanceof Error ? e.message : String(e);
      }
    }

    setError(
      `${lastErr} Check VITE_AI_SERVICE_URL, your API gateway path /api/ai/ask, and that the deployed ai-service is reachable.`,
    );
    setLoading(false);
  }, [question]);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-sky-500 via-pink-400 to-violet-500 p-[1px] shadow-lg">
        <div className="rounded-2xl bg-white p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-xl bg-gradient-to-br from-sky-100 to-pink-100 p-3">
              <SparklesIcon className="h-8 w-8 text-sky-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Hospital AI Assistant</h1>
              <p className="text-sm text-gray-600">
                RAG answers from your indexed hospital knowledge using the ai-service endpoint
                <code className="text-xs bg-gray-100 px-1 rounded">/ask</code>.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <label className="block text-sm font-medium text-gray-700 mb-2">Your question</label>
        <textarea
          className="w-full min-h-[120px] rounded-xl border border-gray-200 px-4 py-3 text-gray-900 shadow-inner focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
          placeholder="e.g. What are visiting hours for inpatients?"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          disabled={loading}
        />
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={ask}
            disabled={loading || !question.trim()}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-pink-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              'Thinking…'
            ) : (
              <>
                <PaperAirplaneIcon className="h-5 w-5" />
                Ask
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {answer && (
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 shadow-inner">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Answer
          </h2>
          <div className="prose prose-sky max-w-none whitespace-pre-wrap text-gray-900">{answer}</div>
        </div>
      )}
    </div>
  );
}
