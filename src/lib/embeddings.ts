import { Pipeline } from '@xenova/transformers';

// Use a promise to handle race conditions
let pipelinePromise: Promise<Pipeline> | null = null;
let pipeline: Pipeline | null = null;

// Cache for embeddings
const embeddingCache = new Map<string, { embedding: number[]; timestamp: number }>();
const CACHE_TTL = 3600000; // 1 hour

// Track OpenAI API key and rate-limit status to avoid repeated failures
let openAIKeyStatus: { valid: boolean; lastChecked: number; rateLimitedUntil: number } = {
  valid: false,
  lastChecked: 0,
  rateLimitedUntil: 0,
};

async function getEmbeddingPipeline(): Promise<Pipeline> {
  if (pipeline) return pipeline;
  
  if (!pipelinePromise) {
    pipelinePromise = (async () => {
      try {
        // Try to configure Transformers.js to use the WASM ONNX backend first.
        try {
          const mod = await import('@xenova/transformers');
          if (mod?.env?.backends?.onnx?.wasm) {
            mod.env.backends.onnx.wasm.wasmPaths = '/onnx/';
            mod.env.allowRemoteModels = true;
            mod.env.localModelPath = '/models/';
          }
        } catch (e) {
          console.warn('Could not configure transformers WASM env:', e);
        }

        const { pipeline: createPipeline } = await import('@xenova/transformers');
        pipeline = await createPipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
        return pipeline;
      } catch (err: any) {
        pipelinePromise = null; // Reset on failure so next attempt can retry
        const msg = String(err?.message || err);
        
        if (msg.includes('libonnxruntime') || msg.includes('onnxruntime-node')) {
          throw new Error(
            'Local ONNX runtime failed to load (missing native library). ' +
            'On Vercel/serverless environments this can occur because native libs are not available.\n' +
            'Recommended fixes: set `OPENAI_API_KEY` in your Vercel environment to use OpenAI embeddings, ' +
            'or configure Transformers.js to use the WASM backend (onnxruntime-web).'
          );
        }
        throw err;
      }
    })();
  }
  
  return pipelinePromise;
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
  if (value === null || value === undefined) return [];
  
  // Handle primitive number
  if (typeof value === 'number') {
    return Number.isFinite(value) ? [value] : [];
  }
  
  // Handle arrays (including nested)
  if (Array.isArray(value)) {
    const result: number[] = [];
    for (const item of value) {
      if (typeof item === 'number' && Number.isFinite(item)) {
        result.push(item);
      } else if (Array.isArray(item)) {
        result.push(...normalizeEmbedding(item));
      }
    }
    return result;
  }
  
  // Handle TypedArrays
  if (isTypedArray(value)) {
    const typed = value as unknown as { length: number; [index: number]: number };
    const result: number[] = [];
    for (let i = 0; i < typed.length; i++) {
      const val = typed[i];
      if (typeof val === 'number' && Number.isFinite(val)) {
        result.push(val);
      }
    }
    return result;
  }
  
  // Handle objects
  if (typeof value === 'object' && value !== null) {
    const obj = value as any;
    
    // Check common property names for embeddings
    const possibleKeys = ['embedding', 'data', 'values', 'embeddings', 'vector'];
    for (const key of possibleKeys) {
      if (key in obj && obj[key] !== undefined && obj[key] !== null) {
        const result = normalizeEmbedding(obj[key]);
        if (result.length > 0) return result;
      }
    }
    
    // Handle iterable objects
    if (typeof obj[Symbol.iterator] === 'function') {
      try {
        const result: number[] = [];
        for (const item of obj) {
          if (typeof item === 'number' && Number.isFinite(item)) {
            result.push(item);
          } else if (Array.isArray(item)) {
            result.push(...normalizeEmbedding(item));
          }
        }
        return result;
      } catch {
        // Not iterable or iteration failed
      }
    }
  }
  
  return [];
}

function validateEmbedding(embedding: number[], expectedLength?: number): boolean {
  if (!Array.isArray(embedding) || embedding.length === 0) return false;
  if (expectedLength && embedding.length !== expectedLength) return false;
  return embedding.every(val => typeof val === 'number' && Number.isFinite(val));
}

function isValidOpenAIKey(key: string): boolean {
  // Check if key has the correct format (starts with sk- and is long enough)
  return key.startsWith('sk-') && key.length > 20;
}

async function generateOpenAIEmbedding(text: string, apiKey: string): Promise<number[]> {
  // Validate API key format first
  if (!isValidOpenAIKey(apiKey)) {
    throw new Error('Invalid OpenAI API key format. Key should start with "sk-"');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
  
  try {
    const res = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ 
        input: text, 
        model: 'text-embedding-3-small',
        encoding_format: 'float'
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Handle specific error codes
    if (res.status === 401) {
      const errorText = await res.text();
      let errorMessage = 'Invalid OpenAI API key. ';
      
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error?.message) {
          errorMessage += errorJson.error.message;
        }
      } catch {
        errorMessage += 'Please check your API key at https://platform.openai.com/account/api-keys';
      }
      
      // Mark key as invalid
      openAIKeyStatus.valid = false;
      openAIKeyStatus.lastChecked = Date.now();
      openAIKeyStatus.rateLimitedUntil = 0;
      
      throw new Error(errorMessage);
    }

    if (res.status === 429) {
      const now = Date.now();
      openAIKeyStatus.valid = false;
      openAIKeyStatus.lastChecked = now;
      openAIKeyStatus.rateLimitedUntil = now + 60000; // wait 60 seconds before retrying OpenAI
      throw new Error('OpenAI API rate limit exceeded. Please try again later.');
    }

    if (res.status === 500 || res.status === 503) {
      throw new Error('OpenAI API service unavailable. Please try again later.');
    }

    if (!res.ok) {
      const textResp = await res.text();
      let errorMsg = `OpenAI embedding error: ${res.status} ${res.statusText}`;
      try {
        const errorJson = JSON.parse(textResp);
        if (errorJson.error?.message) {
          errorMsg += ` - ${errorJson.error.message}`;
        }
      } catch {
        errorMsg += ` - ${textResp}`;
      }
      throw new Error(errorMsg);
    }

    // If we get here, the key is valid
    openAIKeyStatus.valid = true;
    openAIKeyStatus.lastChecked = Date.now();

    const data = await res.json();
    const embedding = normalizeEmbedding(data?.data?.[0]?.embedding);
    
    if (!validateEmbedding(embedding, 1536)) { // text-embedding-3-small returns 1536 dimensions
      throw new Error('OpenAI embedding response did not include a valid embedding');
    }
    
    return embedding;
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('OpenAI embedding request timed out after 30 seconds');
    }
    throw err;
  }
}

async function generateLocalEmbedding(text: string): Promise<number[]> {
  const pipe = await getEmbeddingPipeline();
  const output = await pipe(text, { pooling: 'mean', normalize: true });
  const embedding = normalizeEmbedding(output);
  
  if (!validateEmbedding(embedding)) {
    console.error('Local embedding normalization failed', {
      outputType: typeof output,
      outputSample: Array.isArray(output) ? output.slice(0, 5) : output,
      normalizedLength: embedding.length,
    });
    throw new Error('Local embedding model returned no valid embedding');
  }
  
  return embedding;
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const input = String(text || '').trim();
  if (!input) {
    return [];
  }

  // Check cache first
  const cached = embeddingCache.get(input);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.embedding;
  }

  let embedding: number[] = [];
  let usedOpenAI = false;

  // Try OpenAI first if key is available
  const openAiKey = process.env.OPENAI_API_KEY?.trim();
  const useLocalModel = process.env.USE_LOCAL_MODEL !== 'false';

  // Check if we should try OpenAI
  let shouldTryOpenAI = false;
  if (openAiKey) {
    const now = Date.now();
    if (now < openAIKeyStatus.rateLimitedUntil) {
      console.warn(
        `Skipping OpenAI because the key is rate-limited until ${new Date(openAIKeyStatus.rateLimitedUntil).toISOString()}`
      );
    } else {
      const keyCheckAge = now - openAIKeyStatus.lastChecked;
      if (openAIKeyStatus.valid || keyCheckAge > 300000) { // Re-check every 5 minutes
        shouldTryOpenAI = true;
      } else {
        console.warn('Skipping OpenAI (key previously invalid, waiting for re-check)');
      }
    }
  }

  if (!openAiKey && !useLocalModel) {
    throw new Error(
      'No embedding service is configured. Set OPENAI_API_KEY in environment variables or enable the local model with USE_LOCAL_MODEL=true.'
    );
  }

  if (shouldTryOpenAI) {
    try {
      embedding = await generateOpenAIEmbedding(input, openAiKey);
      usedOpenAI = true;
    } catch (err) {
      const error = err as Error;
      const errorMsg = error.message || '';
      
      // Log specific error types
      if (errorMsg.includes('Invalid OpenAI API key')) {
        console.error('OpenAI API key is invalid. Please check your environment variables.');
      } else if (errorMsg.includes('rate limit')) {
        console.warn('OpenAI rate limit hit, falling back to local model');
      } else {
        console.error('OpenAI embedding failed, falling back to local model:', errorMsg);
      }
      
      // Don't fallback if it's a key validation error (we know it won't work)
      if (errorMsg.includes('Invalid OpenAI API key')) {
        // Skip fallback and try local directly
        embedding = [];
      }
    }
  }

  // Fall back to local model if OpenAI failed or not available
  if (embedding.length === 0) {
    if (!useLocalModel) {
      throw new Error(
        'OpenAI embeddings are unavailable and the local model is disabled. ' +
        'Set OPENAI_API_KEY or enable the local model with USE_LOCAL_MODEL=true.'
      );
    }

    try {
      embedding = await generateLocalEmbedding(input);
    } catch (err) {
      const error = err as Error;
      const msg = String(error?.message || err);
      
      // Provide helpful error messages
      if (msg.includes('Local ONNX runtime failed to load')) {
        throw new Error(
          `Local embedding model failed: ${msg}. ` +
          `Please set OPENAI_API_KEY in your environment or install the WASM backend.`
        );
      } else {
        throw error;
      }
    }
  }

  // Cache the result
  if (embedding.length > 0) {
    embeddingCache.set(input, {
      embedding,
      timestamp: Date.now(),
    });
  }

  return embedding;
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const validTexts = texts.filter(text => String(text || '').trim().length > 0);
  if (validTexts.length === 0) return [];
  
  // Try to batch process if all texts are valid and OpenAI is available
  const openAiKey = process.env.OPENAI_API_KEY?.trim();
  let shouldTryOpenAI = false;
  
  if (openAiKey && isValidOpenAIKey(openAiKey)) {
    const keyCheckAge = Date.now() - openAIKeyStatus.lastChecked;
    if (openAIKeyStatus.valid || keyCheckAge > 300000) {
      shouldTryOpenAI = true;
    }
  }
  
  if (shouldTryOpenAI && validTexts.length <= 100) { // OpenAI batch limit
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout for batch
      
      const res = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openAiKey}`,
        },
        body: JSON.stringify({ 
          input: validTexts, 
          model: 'text-embedding-3-small',
          encoding_format: 'float'
        }),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (res.ok) {
        const data = await res.json();
        const embeddings: number[][] = [];
        let allValid = true;
        
        for (const item of data.data || []) {
          const emb = normalizeEmbedding(item.embedding);
          if (validateEmbedding(emb, 1536)) {
            embeddings.push(emb);
          } else {
            allValid = false;
            break;
          }
        }
        
        if (allValid && embeddings.length === validTexts.length) {
          return embeddings;
        }
      }
    } catch (err) {
      console.error('OpenAI batch embedding failed, falling back to individual processing:', err);
    }
  }
  
  // Fall back to individual processing
  const results: number[][] = [];
  for (const text of validTexts) {
    try {
      const embedding = await generateEmbedding(text);
      results.push(embedding);
    } catch (err) {
      console.error(`Failed to generate embedding for text: "${text.slice(0, 50)}..."`, err);
      results.push([]);
    }
  }
  return results;
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length === 0 || b.length === 0) {
    return 0;
  }
  
  if (a.length !== b.length) {
    console.warn(`Vector length mismatch: ${a.length} vs ${b.length}, using minimum length`);
    const minLength = Math.min(a.length, b.length);
    a = a.slice(0, minLength);
    b = b.slice(0, minLength);
  }
  
  let dot = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    const valA = a[i] || 0;
    const valB = b[i] || 0;
    dot += valA * valB;
    normA += valA * valA;
    normB += valB * valB;
  }
  
  if (normA === 0 || normB === 0) return 0;
  
  const similarity = dot / (Math.sqrt(normA) * Math.sqrt(normB));
  // Clamp to handle floating point errors
  return Math.max(-1, Math.min(1, similarity));
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
  
  const text = parts.join(' ').slice(0, 512);
  return text.trim();
}

export async function healthCheck(): Promise<{ 
  status: 'healthy' | 'unhealthy' | 'degraded'; 
  details: string;
  openAI?: { available: boolean; valid: boolean };
  local?: { available: boolean };
}> {
  const result: any = {
    status: 'healthy',
    details: 'All systems operational',
    openAI: { available: false, valid: false },
    local: { available: false }
  };
  
  // Check OpenAI
  const openAiKey = process.env.OPENAI_API_KEY?.trim();
  if (openAiKey && isValidOpenAIKey(openAiKey)) {
    result.openAI.available = true;
    result.openAI.valid = openAIKeyStatus.valid;
    
    // Test OpenAI if we haven't recently
    if (Date.now() - openAIKeyStatus.lastChecked > 300000) {
      try {
        await generateOpenAIEmbedding('health check', openAiKey);
        result.openAI.valid = true;
      } catch (err) {
        result.openAI.valid = false;
        result.details = 'OpenAI key invalid or failed';
        result.status = 'degraded';
      }
    }
  }
  
  // Check local model
  try {
    const useLocalModel = process.env.USE_LOCAL_MODEL !== 'false';
    if (useLocalModel) {
      const pipe = await getEmbeddingPipeline();
      result.local.available = !!pipe;
    }
  } catch (err) {
    result.local.available = false;
    if (!result.openAI.valid) {
      result.status = 'unhealthy';
      result.details = 'Neither OpenAI nor local model is available';
    }
  }
  
  if (!result.openAI.valid && !result.local.available) {
    result.status = 'unhealthy';
    result.details = 'No embedding method available';
  }
  
  return result;
}

export function clearCache(): void {
  embeddingCache.clear();
}

export function cleanCache(maxAge: number = CACHE_TTL): void {
  const now = Date.now();
  for (const [key, value] of embeddingCache.entries()) {
    if (now - value.timestamp > maxAge) {
      embeddingCache.delete(key);
    }
  }
}

// For serverless environments, clean cache on cold start
if (typeof process !== 'undefined' && process.env.NODE_ENV === 'production') {
  cleanCache();
}

// Export helper to check if OpenAI is configured
export function isOpenAIConfigured(): boolean {
  const key = process.env.OPENAI_API_KEY?.trim();
  return !!(key && isValidOpenAIKey(key));
}

// Export helper to check if local model is available
export async function isLocalModelAvailable(): Promise<boolean> {
  try {
    const pipe = await getEmbeddingPipeline();
    return !!pipe;
  } catch {
    return false;
  }
}