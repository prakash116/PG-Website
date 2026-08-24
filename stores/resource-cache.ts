import { useCallback, useEffect, useRef } from "react";
import { create } from "zustand";
import { ApiError } from "@/lib/api/client";

/**
 * How long a cached answer is served without checking again. Long enough that
 * moving between pages feels instant, short enough that a value someone else
 * changed does not sit there all session.
 */
const DEFAULT_FRESH_FOR_MS = 60_000;

interface CacheEntry {
  data: unknown;
  /** When the data last came back from the API. */
  loadedAt: number;
  isLoading: boolean;
  error: string | null;
}

interface ResourceCacheState {
  entries: Record<string, CacheEntry>;
  patch: (key: string, entry: Partial<CacheEntry>) => void;
  clear: () => void;
}

const EMPTY: CacheEntry = {
  data: undefined,
  loadedAt: 0,
  isLoading: false,
  error: null,
};

const useResourceCache = create<ResourceCacheState>()((set) => ({
  entries: {},

  patch: (key, entry) =>
    set((state) => ({
      entries: {
        ...state.entries,
        [key]: { ...(state.entries[key] ?? EMPTY), ...entry },
      },
    })),

  clear: () => set({ entries: {} }),
}));

/**
 * Requests already in the air, so two components mounting at once share one
 * round trip instead of racing each other. Promises are not state, so they live
 * here rather than in the store.
 */
const inFlight = new Map<string, Promise<void>>();

/**
 * When each of the hand-written stores last loaded.
 *
 * Those stores keep their own data; all they were missing was a memory of
 * *when* they got it, so every mount refetched. This gives them that without
 * changing how they hold state.
 */
const lastLoadedAt = new Map<string, number>();

export function isFresh(key: string, freshForMs = DEFAULT_FRESH_FOR_MS): boolean {
  const at = lastLoadedAt.get(key);

  return at !== undefined && Date.now() - at < freshForMs;
}

export function markLoaded(key: string): void {
  lastLoadedAt.set(key, Date.now());
}

/**
 * Everything cached is scoped to whoever is signed in, so this MUST be called
 * on login and on logout. Without it the next person to use the browser would
 * be shown the previous account's data — the one thing a cache must never do.
 */
export function clearResourceCache(): void {
  inFlight.clear();
  lastLoadedAt.clear();
  useResourceCache.getState().clear();
}

function messageFor(error: unknown): string {
  return error instanceof ApiError
    ? error.message
    : "Something went wrong. Please try again.";
}

async function load(
  key: string,
  fetcher: () => Promise<unknown>,
): Promise<void> {
  const existing = inFlight.get(key);
  if (existing) return existing;

  const { patch } = useResourceCache.getState();
  patch(key, { isLoading: true, error: null });

  const request = (async () => {
    try {
      patch(key, {
        data: await fetcher(),
        loadedAt: Date.now(),
        isLoading: false,
        error: null,
      });
    } catch (error: unknown) {
      patch(key, { isLoading: false, error: messageFor(error) });
    } finally {
      inFlight.delete(key);
    }
  })();

  inFlight.set(key, request);

  return request;
}

interface CachedResource<T> {
  data: T | undefined;
  /** Only true when there is nothing cached to show yet. */
  isLoading: boolean;
  error: string | null;
  /** Fetch again now, regardless of freshness. */
  refresh: () => Promise<void>;
  /** Write straight into the cache, for when a mutation already returned the new state. */
  set: (data: T) => void;
}

/**
 * A fetch whose answer survives navigation.
 *
 * Data held in a component's own `useState` dies with the component, so every
 * route change started from nothing: a spinner and another request. Here the
 * answer lives in one store, and moving between pages reads it back instantly.
 *
 * Stale data is shown while it revalidates rather than replaced by a spinner —
 * seeing the previous figures for a moment is better than seeing nothing.
 */
export function useCachedResource<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: { freshForMs?: number } = {},
): CachedResource<T> {
  const { freshForMs = DEFAULT_FRESH_FOR_MS } = options;
  const entry = useResourceCache((state) => state.entries[key]);
  const patch = useResourceCache((state) => state.patch);

  // Kept in a ref so an inline arrow — which is a new function every render —
  // cannot retrigger the effect below. Written in an effect rather than during
  // render, which React does not allow: the ref already holds the first
  // fetcher, and effects run in declaration order, so the one below always
  // sees a current value.
  const fetcherRef = useRef(fetcher);

  useEffect(() => {
    fetcherRef.current = fetcher;
  });

  useEffect(() => {
    const current = useResourceCache.getState().entries[key];
    const isFresh =
      current?.data !== undefined &&
      Date.now() - current.loadedAt < freshForMs;

    if (isFresh) return;

    void load(key, () => fetcherRef.current());
  }, [key, freshForMs]);

  const refresh = useCallback(
    () => load(key, () => fetcherRef.current()),
    [key],
  );

  const set = useCallback(
    (data: T) =>
      patch(key, {
        data,
        loadedAt: Date.now(),
        isLoading: false,
        error: null,
      }),
    [key, patch],
  );

  return {
    data: entry?.data as T | undefined,
    /**
     * "Nothing has resolved yet" rather than "a request is running".
     *
     * It has to cover the first render too — before the effect below has fired
     * there is no entry at all, and reporting `false` there would flash the
     * empty state for a frame before the data arrived. Once anything has
     * landed, data or an error, this is false even while revalidating: there
     * is something to show, so the page should show it.
     */
    isLoading: entry?.data === undefined && !entry?.error,
    error: entry?.error ?? null,
    refresh,
    set,
  };
}
