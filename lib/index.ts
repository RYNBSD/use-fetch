import { useCallback, useState } from "react";
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

  /**
   * support any type of request, focused on POST, PUT, DELETE...
   */
  useSend = <TError extends Error = Error>(
    options: Omit<FetchOptions<void>, "init">
  ) => {
    const [isSending, setIsSending] = useState(false);
    const [isError, setIsError] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const send = useCallback(
      async (init?: RequestInitOption) => {
        setIsSending(true);
        let requestInit: RequestInit | null | undefined = null;

        try {
          requestInit =
            typeof init === "function" ? await init(this.DEFAULT_INIT) : init;
          const response = await fetch(`${this.BASE_URL}${options.path}`, {
            ...this.DEFAULT_INIT,
            ...requestInit,
            headers: {
              ...this.DEFAULT_INIT?.headers,
              ...requestInit?.headers,
            },
          });
          await options.callback(response);
        } catch (error) {
          if (requestInit?.signal?.aborted) return;
          setIsError(true);
          setError(error as TError);
        }
        setIsSending(false);
      },
      [options.path, options.callback]
    );

    return {
      isSending,
      isError,
      error,
      send,
    };
  };

  /**
   * for GET requests
   */
  useFetch = <TError extends Error = Error>(options: FetchOptions<void>) => {
    const [isLoading, setIsLoading] = useState(false);

    const {
      isSending: isFetching,
      isError,
      error,
      send,
    } = this.useSend<TError>({ ...options });

    const request = useCallback(
      async (signal?: AbortSignal) => {
        await send(async (defaultInit) => {
          const requestInit =
            typeof options.init === "function"
              ? await options.init(defaultInit)
              : options.init;
          return { ...requestInit, method: "GET", signal };
        });
      },
      [send, options.init]
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

  /**
   * for GET requests
   */
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

type PathOption = string;

type CallbackOption<T> = (response: Response) => Promise<T> | T;

type RequestInitOption =
  | RequestInit
  | ((defaultInit?: RequestInit) => Promise<RequestInit> | RequestInit);

export type FetchOptions<T> = {
  path: PathOption;
  callback: CallbackOption<T>;
  init?: RequestInitOption;
};
