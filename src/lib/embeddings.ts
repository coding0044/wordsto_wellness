
let pipeline: any = null;

async function getEmbeddingPipeline() {
  if (!pipeline) {
    try {
      // Try to configure Transformers.js to use the WASM ONNX backend first.
      // This will point the library to the WASM assets served from `/onnx/`.
      try {
        const mod = await import('@xenova/transformers');
        if (mod && mod.env && mod.env.backends && mod.env.backends.onnx && mod.env.backends.onnx.wasm) {
          mod.env.backends.onnx.wasm.wasmPaths = '/onnx/';
          // prefer remote models when using wasm; optional
          mod.env.allowRemoteModels = true;
        }
      } catch (e) {
        // Non-fatal: if we can't configure env, proceed and handle import errors below
        console.warn('Could not configure transformers WASM env:', e);
      }

      const { pipeline: createPipeline } = await import('@xenova/transformers');
      pipeline = await createPipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    } catch (err: any) {
      // Provide a clearer error when the native ONNX runtime is missing (common on serverless hosts)
      const msg = String(err?.message || err);
      if (msg.includes('libonnxruntime') || msg.includes('onnxruntime-node')) {
        throw new Error(
          'Local ONNX runtime failed to load (missing native library). On Vercel/serverless environments this can occur because native libs are not available.\n' +
            'Recommended fixes: set `OPENAI_API_KEY` in your Vercel environment to use OpenAI embeddings, or configure Transformers.js to use the WASM backend (onnxruntime-web).'
        );
      }

      throw err;
    }
  }
  return pipeline;
}

function isTypedArray(value: unknown): value is ArrayBufferView {
  return (
    typeof value === 'object' &&
    value !== null &&
    ArrayBuffer.isView(value) &&
    !(value instanceof DataView)
  );
}

function normalizeEmbedding(value: unknown): number[] {
  if (!value && value !== 0) return [];

  if (typeof value === 'number') {
    return [value];
  }

  if (Array.isArray(value)) {
    return value
      .flatMap((item) => (typeof item === 'number' ? item : Array.isArray(item) ? item : []))
      .map(Number)
      .filter((item) => Number.isFinite(item));
  }

  if (isTypedArray(value)) {
    const typed = value as unknown as { length: number; [index: number]: number };
    return Array.from(typed).map(Number).filter((item) => Number.isFinite(item));
  }

  if (typeof value === 'object' && value !== null) {
    const obj = value as any;

    if ('embedding' in obj) {
      return normalizeEmbedding(obj.embedding);
    }

    if ('data' in obj) {
      return normalizeEmbedding(obj.data);
    }

    if ('values' in obj) {
      return normalizeEmbedding(obj.values);
    }

    if (typeof obj[Symbol.iterator] === 'function') {
      return Array.from(obj).map(Number).filter((item) => Number.isFinite(item));
    }
  }

  return [];
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const input = String(text || '').trim();
  if (!input) {
    return [];
  }

  const openAiKey = process.env.OPENAI_API_KEY?.trim();
  if (openAiKey) {
    try {
      const res = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openAiKey}`,
        },
        body: JSON.stringify({ input, model: 'text-embedding-3-small' }),
      });

      if (!res.ok) {
        const textResp = await res.text();
        throw new Error(`OpenAI embedding error: ${res.status} ${res.statusText} ${textResp}`);
      }

      const data = await res.json();
      const embedding = normalizeEmbedding(data?.data?.[0]?.embedding);
      if (embedding.length > 0) {
        return embedding;
      }

      throw new Error('OpenAI embedding response did not include a valid embedding');
    } catch (err) {
      console.error('OpenAI embedding failed, falling back to local model:', err);
    }
  }

  let output: unknown;
  try {
    const pipe = await getEmbeddingPipeline();
    output = await pipe(input, { pooling: 'mean', normalize: true });
  } catch (err: any) {
    // If pipeline creation failed due to missing native libs, surface a helpful message
    const msg = String(err?.message || err);
    if (msg.includes('Local ONNX runtime failed to load')) {
      console.error(msg);
      throw new Error(msg + ' Ensure `OPENAI_API_KEY` is set in production or switch to the WASM backend.');
    }
    throw err;
  }
  const embedding = normalizeEmbedding(output);

  if (embedding.length === 0) {
    console.error('Local embedding normalization failed', {
      output,
      normalized: normalizeEmbedding(output),
    });
    throw new Error('Local embedding model returned no valid embedding');
  }

  return embedding;
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export function buildLetterEmbeddingText(letter: {
  title?: string;
  content?: string;
  letter_type?: string;
  level?: string;
}): string {
  const parts = [
    letter.title || '',
    letter.content || '',
    letter.letter_type || '',
    letter.level || '',
  ].filter(Boolean);
  return parts.join(' ').slice(0, 512);
}
