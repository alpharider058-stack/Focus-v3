import { useCallback, useEffect, useState } from "react";
import { loadSnapshot, type Snapshot } from "@/lib/focus-storage";

/** Loads all local data and reloads it on mount or when refresh is invoked. */
export function useSnapshot() {
  const [data, setData] = useState<Snapshot | null>(null);

  const refresh = useCallback(async () => {
    const next = await loadSnapshot();
    setData(next);
    return next;
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { data, refresh };
}
