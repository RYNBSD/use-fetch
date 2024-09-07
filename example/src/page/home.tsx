import { Link } from "react-router-dom";

export default function home() {
  return (
    <>
      <Link to="/send">send</Link> <br />
      <Link to="/fetch">fetch</Link> <br />
      <Link to="/infinite-fetch">infinite fetch</Link> <br />
      <a
        href="https://www.npmjs.com/package/@ryn-bsd/use-fetch"
        target="_blank"
      >
        npm package
      </a>
    </>
  );
}
