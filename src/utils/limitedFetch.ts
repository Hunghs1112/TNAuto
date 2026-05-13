// src/utils/limitedFetch.ts
// Lightweight fetch wrapper that limits concurrent requests and provides built-in back-off
// against 429 Too Many Requests responses.
//
// This helps protect the client from spamming the backend when many components mount
// simultaneously (e.g. after navigation changes or app start-up).
//
// The implementation purposefully avoids external dependencies to keep bundle size small.
//
// Usage:
//   import limitedFetch from '../utils/limitedFetch';
//   limitedFetch('https://example.com');
//
// The function adheres to the native `fetch` signature and returns a `Promise<Response>`.

/* eslint-disable @typescript-eslint/ban-types */
import { Platform } from 'react-native';

// Keep a reference to the native/global fetch so that we can delegate after
// queue/limiter logic completes. Depending on the environment (RN vs web) the
// global object differs.
const nativeFetch: typeof fetch =
  // @ts-ignore – React Native exposes global.fetch directly
  (global?.fetch || (typeof window !== 'undefined' ? window.fetch : undefined)) as typeof fetch;

if (!nativeFetch) {
  throw new Error('limitedFetch: native fetch not found in global scope');
}

// =========================
// Configuration parameters
// =========================
const MAX_CONCURRENT_REQUESTS = 6; // Adjust depending on backend limits
const MAX_429_RETRIES = 3; // Exponential back-off retries for HTTP 429
const INITIAL_BACKOFF_MS = 500; // Base delay before first retry

// =========================
// Internal state holders
// =========================
let activeCount = 0;
const queue: Array<() => void> = [];

// Utility to delay execution using setTimeout wrapped in a promise
const wait = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

async function runWith429Backoff(
  input: RequestInfo | URL,
  init?: RequestInit,
  attempt = 0,
): Promise<Response> {
  const response = await nativeFetch(input, init);

  if (response.status !== 429 || attempt >= MAX_429_RETRIES) {
    return response;
  }

  let retryAfterMs = INITIAL_BACKOFF_MS * 2 ** attempt;

  // Respect Retry-After header (seconds) if provided and longer than computed backoff
  const retryAfterHeader = response.headers.get('Retry-After');
  if (retryAfterHeader) {
    const parsedSeconds = Number(retryAfterHeader);
    if (!Number.isNaN(parsedSeconds)) {
      retryAfterMs = Math.max(retryAfterMs, parsedSeconds * 1000);
    }
  }

  await wait(retryAfterMs);
  return runWith429Backoff(input, init, attempt + 1);
}

function dequeue() {
  if (activeCount >= MAX_CONCURRENT_REQUESTS) return;
  const next = queue.shift();
  if (!next) return;
  activeCount += 1;
  next();
}

function limitedFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  return new Promise<Response>((resolve, reject) => {
    const task = () => {
      runWith429Backoff(input, init)
        .then((resp) => resolve(resp))
        .catch((err) => {
          // Suppress AbortController polyfill errors — these are benign and occur
          // when RTK Query cancels in-flight requests on component unmount.
          const msg = String(err?.message || err || '');
          if (msg.includes('AbortController') || msg.includes('abort') || err?.name === 'AbortError') {
            return; // silently ignore
          }
          reject(err);
        })
        .finally(() => {
          activeCount -= 1;
          dequeue();
        });
    };

    if (activeCount < MAX_CONCURRENT_REQUESTS) {
      activeCount += 1;
      task();
    } else {
      queue.push(task);
    }
  });
}

export default limitedFetch;
