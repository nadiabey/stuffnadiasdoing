export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page")) || 1;
  const limit = 10; // Posts per page
  const offset = (page - 1) * limit;

  // Fetch paginated results
  const { results } = await env.posts.prepare(
    "SELECT * FROM posts ORDER BY created_at DESC LIMIT ? OFFSET ?"
  )
  .bind(limit, offset)
  .all();

  return new Response(JSON.stringify(results), {
    headers: { "Content-Type": "application/json" }
  });
}
