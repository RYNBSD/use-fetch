import { lazy } from "react";

export const Home = lazy(() => import("./home"));
export const Send = lazy(() => import("./send"));
export const Fetch = lazy(() => import("./fetch"));
export const InfiniteFetch = lazy(() => import("./infinite-fetch"));
