import { Route, Routes } from "react-router-dom";
import { Fetch, Home, InfiniteFetch } from "./page";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/fetch" element={<Fetch />} />
      <Route path="/infinite-fetch" element={<InfiniteFetch />} />
    </Routes>
  );
}
