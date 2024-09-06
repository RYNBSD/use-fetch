import { useState } from "react";
import { useFetch } from "../hook";

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
