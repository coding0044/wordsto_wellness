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

async function generateOpenAIEmbedding(input: string, apiKey: string): Promise<number[]> {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ 
      input, 
      model: 'text-embedding-3-small',
      dimensions: 384 // Match MiniLM-L6-v2 dimension
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const embedding = normalizeEmbedding(data?.data?.[0]?.embedding);
  
  if (embedding.length === 0) {
    throw new Error('No valid embedding returned from OpenAI');
  }

  // Ensure consistent dimension (384 for MiniLM-L6-v2)
  return embedding.length === 384 ? embedding : embedding.slice(0, 384);
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const input = String(text || '').trim();
  if (!input) {
    return [];
  }

  const openAiKey = process.env.OPENAI_API_KEY?.trim();
  if (!openAiKey) {
    throw new Error(
      'OpenAI API key is required. Set OPENAI_API_KEY in your environment variables to use embeddings.'
    );
  }

  console.log('Generating embedding using OpenAI...');
  const embedding = await generateOpenAIEmbedding(input, openAiKey);
  if (embedding.length === 0) {
    throw new Error('OpenAI embedding returned no valid vector.');
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