import { useCallback, useMemo, useRef, useState } from "react";
import { useInfiniteFetch } from "../hook";

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
