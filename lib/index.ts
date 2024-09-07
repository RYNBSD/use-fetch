import { useCallback, useMemo, useState } from "react";
import useEffectOnce from "react-use/lib/useEffectOnce";
import useUpdateEffect from "react-use/lib/useUpdateEffect";

export class InitFetch {
  private readonly BASE_URL: string;
  private readonly DEFAULT_INIT?: RequestInit;

  constructor(baseUrl: string, init?: RequestInit) {
    if (baseUrl.length === 0) console.warn("The provided base url is empty");
    this.BASE_URL = baseUrl;
    this.DEFAULT_INIT = init;
  }

  useFetch = <TError extends Error = Error>(options: FetchOptions<void>) => {
    const [isFetching, setIsFetching] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const [error, setError] = useState<TError | null>(null);

    const requestInit = useMemo(() => {
      if (typeof options.init === "undefined") return this.DEFAULT_INIT;
      if (typeof options.init === "function")
        return options.init(this.DEFAULT_INIT);
      return {
        ...this.DEFAULT_INIT,
        ...options.init,
        headers: {
          ...this.DEFAULT_INIT?.headers,
          ...options.init?.headers,
        },
      } satisfies RequestInit;
    }, [options.init]);

    const request = useCallback(
      async (signal?: AbortSignal) => {
        setIsFetching(true);
        try {
          const ri = await requestInit;
          const res = await fetch(`${this.BASE_URL}${options.path}`, {
            ...ri,
            signal,
          });
          await options.callback(res);
        } catch (error) {
          if (signal?.aborted) return;
          setIsError(true);
          setError(error as TError);
        }
        setIsFetching(false);
      },
      [options.path, options.callback, requestInit]
    );

    useEffectOnce(() => {
      const controller = new AbortController();
      (async () => {
        setIsLoading(true);
        await request(controller.signal);
        setIsLoading(false);
      })();
      return () => {
        controller.abort();
      };
    });

    return {
      isFetching,
      isLoading,
      isError,
      error,
      refetch: request,
    };
  };

  useInfiniteFetch = <TError extends Error = Error>(
    options: FetchOptions<boolean>
  ) => {
    const [hasNextPage, setHasNextPage] = useState(true);
    const [allResponses, setAllResponses] = useState<Response[]>([]);
    const [lastResponse, setLastResponse] = useState<Response | null>(null);

    const { isFetching, isLoading, isError, error, refetch } =
      this.useFetch<TError>({
        ...options,
        async callback(response) {
          setAllResponses((prev) => [...prev, response]);
          setLastResponse(response);
          const checkNextPage = await options.callback(response);
          setHasNextPage(checkNextPage);
        },
      });

    useUpdateEffect(() => {
      if (!hasNextPage || isFetching || isLoading) return;
      const controller = new AbortController();
      refetch(controller.signal);
      return () => {
        controller.abort();
      };
    }, [options.path]);

    return {
      allResponses,
      lastResponse,
      hasNextPage,
      isFetching,
      isLoading,
      isError,
      error,
    };
  };
}

export type FetchOptions<T> = {
  path: string;
  init?:
    | RequestInit
    | ((defaultInit?: RequestInit) => Promise<RequestInit> | RequestInit);
  callback: (response: Response) => Promise<T> | T;
};
