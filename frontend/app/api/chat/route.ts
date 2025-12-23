export async function GET() {
  const res = await fetch("http://127.0.0.1:8000/chat/stream", {
    headers: { Accept: "text/event-stream" },
  });

  return new Response(res.body, {
    headers: { "Content-Type": "text/event-stream" },
  });
}
