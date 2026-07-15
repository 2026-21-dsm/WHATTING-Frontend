import { useCallback, useEffect, useState } from "react";

export function useAsyncResource<T>(loader: () => Promise<T>, deps: unknown[] = [], intervalMs?: number) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    try {
      setError(null);
      const result = await loader();
      setData(result);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "요청에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, deps);

  useEffect(() => {
    void reload();
    if (!intervalMs) return;

    const timer = window.setInterval(() => {
      void reload();
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [reload, intervalMs]);

  return { data, error, loading, reload, setData };
}
