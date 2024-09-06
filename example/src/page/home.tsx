import { Link } from "react-router-dom";

export default function home() {
  return (
    <>
      <Link to="/fetch">fetch</Link> <br />
      <Link to="/infinite-fetch">infinite fetch</Link>
    </>
  );
}
