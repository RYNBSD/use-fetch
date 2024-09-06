import { InitFetch } from "../../../lib/index";

const initFetch = new InitFetch("https://jsonplaceholder.typicode.com", {
  credentials: "include",
});

export const useFetch = initFetch.useFetch;
export const useInfiniteFetch = initFetch.useInfiniteFetch;
