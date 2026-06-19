let pipeline: any = null;
let isWasmConfigured = false;

async function configureWasmBackend() {
  if (isWasmConfigured) return;
  
  try {
    const { env } = await import('@xenova/transformers');
    
    // Configure WASM backend for serverless environments
    if (env && env.backends && env.backends.onnx) {
      // Set WASM paths - use CDN for reliability
      env.backends.onnx.wasm = {
        ...env.backends.onnx.wasm,
        wasmPaths: 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.14.0/dist/',
        numThreads: 1, // Reduce memory usage in serverless
      };
      
      // Force WASM backend
      env.backends.onnx.backend = 'wasm';
    }
    
    if (env) {
      env.allowRemoteModels = true;
      env.localModelPath = 'https://huggingface.co/models/';
    }
    
    isWasmConfigured = true;
  } catch (e) {
    console.warn('Could not configure WASM backend:', e);
  }
}

async function getEmbeddingPipeline() {
  if (!pipeline) {
    try {
      // Configure WASM first
      await configureWasmBackend();
      
      const { pipeline: createPipeline } = await import('@xenova/transformers');
      
      // Create pipeline with WASM configuration
      pipeline = await createPipeline(
        'feature-extraction', 
        'Xenova/all-MiniLM-L6-v2',
        {
          pooling: 'mean',
          normalize: true,
          device: 'wasm',
          backend: 'wasm',
          progressCallback: (progress: any) => {
            if (progress.status === 'downloading') {
              console.log(`Downloading model: ${Math.round(progress.progress || 0)}%`);
            }
          }
        }
      );
    } catch (err: any) {
      const msg = String(err?.message || err);
      if (msg.includes('libonnxruntime') || msg.includes('onnxruntime-node')) {
        console.error('Local ONNX runtime failed. Falling back to WASM with retry...');
        
        // Retry with explicit WASM configuration
        try {
          const { env, pipeline: createPipeline } = await import('@xenova/transformers');
          
          // Force WASM configuration
          if (env && env.backends && env.backends.onnx) {
            env.backends.onnx.wasm = {
              wasmPaths: 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.14.0/dist/',
              numThreads: 1,
            };
            env.backends.onnx.backend = 'wasm';
            env.allowRemoteModels = true;
          }
          
          pipeline = await createPipeline(
            'feature-extraction', 
            'Xenova/all-MiniLM-L6-v2',
            {
              pooling: 'mean',
              normalize: true,
              device: 'wasm',
              backend: 'wasm',
            }
          );
          
          return pipeline;
        } catch (retryErr) {
          throw new Error(
            'Failed to load embedding model. Please set OPENAI_API_KEY in your environment variables.\n' +
            'Error: ' + String(retryErr)
          );
        }
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

async function generateLocalEmbedding(input: string): Promise<number[]> {
  let output: unknown;
  
  try {
    const pipe = await getEmbeddingPipeline();
    output = await pipe(input, { pooling: 'mean', normalize: true });
  } catch (err: any) {
    const msg = String(err?.message || err);
    if (msg.includes('libonnxruntime') || msg.includes('onnxruntime-node')) {
      throw new Error(
        'Local ONNX runtime failed to load in serverless environment.\n' +
        'Please set OPENAI_API_KEY in your environment variables to use OpenAI embeddings instead.\n' +
        'Error details: ' + msg
      );
    }
    throw err;
  }

  const embedding = normalizeEmbedding(output);

  if (embedding.length === 0) {
    console.error('Local embedding normalization failed', { output });
    throw new Error('Local embedding model returned no valid embedding');
  }

  return embedding;
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const input = String(text || '').trim();
  if (!input) {
    return [];
  }

  const openAiKey = process.env.OPENAI_API_KEY?.trim();
  const useLocalModel = process.env.USE_LOCAL_MODEL !== 'false';

  if (!openAiKey && !useLocalModel) {
    throw new Error(
      'No embedding service is configured. Set OPENAI_API_KEY in environment variables or enable the local model with USE_LOCAL_MODEL=true.'
    );
  }

  if (openAiKey) {
    try {
      console.log('Generating embedding using OpenAI...');
      const embedding = await generateOpenAIEmbedding(input, openAiKey);
      if (embedding.length > 0) {
        return embedding;
      }
    } catch (err) {
      console.warn('OpenAI embedding failed, falling back to local model:', err);
    }
  }

  if (!useLocalModel) {
    throw new Error(
      'OpenAI embeddings failed and local model is disabled. ' +
      'Set OPENAI_API_KEY or enable local model with USE_LOCAL_MODEL=true.'
    );
  }

  console.log('Generating embedding using local model...');
  return generateLocalEmbedding(input);
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