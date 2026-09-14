import { env } from "cloudflare:workers";

export async function onRequestOptions(context) {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "https://justforfun.nadiabey.com",
      "Access-Control-Allow-Methods": "GET, PUT, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    },
  });
}

export async function onRequestPost({ request, env }) {
  const formData = await request.formData();
  const title = formData.get("title");
  const content = formData.get("content");
  const img = formData.get("image_url");

  try {
    const result = await env.blog.prepare(
      "INSERT INTO posts (title, content, image_url) VALUES (?, ?, ?)"
    )
      .bind(title, content, img)
      .run();
      console.log(result);
    return new Response("Post published", {status: 200});
  } catch (err) {
    console.log(err);
    return new Response("Error: " + err.message, { status: 500 });
  }
}
