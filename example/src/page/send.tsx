import { useCallback, useState } from "react";
import { useSend } from "../hook";

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
