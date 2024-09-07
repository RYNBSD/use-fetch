React/React Native fetching library, build on top of the web fetch api, and it comme with a lot of optimizations and simplifications, so you do not need to think how to manage your requests.

# Note: you can check the example project in github (do not forget a 🌟)

Live example: https://use-fetch-three.vercel.app/

# Usage

## Step 1: Import

```ts
// Add your base url and default request init
const initFetch = new InitFetch("https://jsonplaceholder.typicode.com", {
  credentials: "include",
});

export const useSend = initFetch.useSend;
export const useFetch = initFetch.useFetch;
export const useInfiniteFetch = initFetch.useInfiniteFetch;
```

## Step 2: Use

### Example 1: useSend

```tsx
export default function Send() {
  const [fields, setFields] = useState({});

  const { isSending, isError, error, send } = useSend({
    path: "/posts",
    callback(response) {
      alert(response.ok ? "Success" : "Failed");
    },
  });

  const onChange = useCallback((name: string, value: string) => {
    setFields((prev) => ({ ...prev, [name]: value }));
  }, []);

  if (isError) alert(error?.message ?? "Error");

  return (
    <div>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          await send({
            method: "POST",
            body: JSON.stringify({ ...fields, userId: 1 }),
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
          });
        }}
      >
        <input
          name="title"
          type="text"
          placeholder="title"
          onChange={(e) => onChange(e.target.name, e.target.value)}
        />
        <input
          name="body"
          type="text"
          placeholder="body"
          onChange={(e) => onChange(e.target.name, e.target.value)}
        />
        <button type="submit" disabled={isSending}>
          Submit
        </button>
      </form>
    </div>
  );
}
```

useSend: pass the endpoint (path), and a callback to handle the response. In send function pass request init object (optional).

### Example 2: useFetch

```tsx
export default function Fetch() {
  const [posts, setPosts] = useState<unknown[]>([]);

  const { isFetching, isLoading, isError, error, refetch } = useFetch({
    path: "/posts",
    async callback(response) {
      if (!response.ok) throw new Error("Request failed");
      const json = await response.json();
      setPosts(json);
    },
  });

  if (isFetching) return <h1>Fetching...</h1>;
  if (isLoading) return <h1>Loading...</h1>;
  if (isError) return <h1>{error?.message ?? "Error"}</h1>;

  return (
    <>
      <button onClick={() => refetch()} type="button">
        Refetch
      </button>
      <pre>{JSON.stringify(posts, null, 2)}</pre>
    </>
  );
}
```

useFetch: pass an object with the endpoint and a callback to handle the response, optional: pass request init object.

### Example 3: useInfiniteFetch

```tsx
type FetchPost = { id: number; title: string };

export default function InfiniteFetch() {
  const [posts, setPosts] = useState<FetchPost[]>([]);
  const [page, setPage] = useState(1);

  const path = useMemo(() => {
    // Your complex param logic
    return `/posts?_page=${encodeURIComponent(page)}&_sort=id&_order=desc`;
  }, [page]);

  const { hasNextPage, isFetching, isLoading, isError, error } =
    useInfiniteFetch({
      path,
      async callback(response) {
        if (!response.ok) throw new Error("Response failed");
        if (response.status === 204) return false; // Indicate that you reach the last page
        const json = await response.json();
        if (json?.length === 0) return false;
        setPosts((prev) => [...prev, ...json]);
        return true; // Indicate that you did not reach the last page
      },
    });

  const observer = useRef<IntersectionObserver | null>(null);
  const lastPostRef = useCallback(
    (p: HTMLParagraphElement | null) => {
      if (!hasNextPage || isFetching || isLoading) return;
      if (observer.current !== null) observer.current.disconnect();

      observer.current = new IntersectionObserver((posts) => {
        if (posts[0].isIntersecting && hasNextPage) setPage((prev) => prev + 1);
      });

      if (p !== null) observer.current.observe(p);
    },
    [hasNextPage, isFetching, isLoading]
  );

  if (isLoading) return <h1>Loading...</h1>;
  if (isError) return <h1>{error?.message ?? "Error"}</h1>;

  return (
    <>
      {posts.map((post, i) => (
        <p key={post.id} ref={posts.length === i + 1 ? lastPostRef : undefined}>
          {post.id}. {post.title}
        </p>
      ))}
      {hasNextPage && isFetching && <h1>Fetching posts</h1>}
      {!hasNextPage && <h1>No more posts</h1>}
    </>
  );
}
```

useInfiniteFetch: it use useFetch in it core with more functionalities, it detect when the path changed to fire a new request, in the callback you have to return a boolean value to indicate if you reached the last page, optional: pass request init object.

# Customization:

- You can pass a callback to custom you handling to response.
- In case you have custom request init options you can pass a function.
