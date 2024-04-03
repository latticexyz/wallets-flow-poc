import { usePromise } from "@latticexyz/react";
import { useCallback, useState } from "react";

export function useCreatePromise<value, createPromiseArgs extends unknown[]>(
  createPromise: (...args: createPromiseArgs) => PromiseLike<value>,
) {
  const [promise, setPromise] = useState<PromiseLike<value> | null>(null);
  const result = usePromise(promise);
  return [
    result,
    useCallback(
      (...args: createPromiseArgs) => {
        const p = createPromise(...args);
        setPromise(p);
        return p;
      },
      [createPromise],
    ),
  ] as const;
}
