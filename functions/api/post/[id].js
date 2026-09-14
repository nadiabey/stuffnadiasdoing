export async function onRequestGet({ params, env }) {
  const postId = params.id; // This captures the ID from the URL

  // 1. Fetch the specific post
  const post = await env.posts.prepare("SELECT * FROM posts WHERE id = ?")
    .bind(postId)
    .first();

  if (!post) {
    return new Response("Post not found", { status: 404 });
  }

  // 2. Generate HTML manually
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
    <meta charset="utf-8"/>
      <title>${post.title} - Stuff Nadia's Doing</title>
      <link rel="stylesheet" href="/assets/css/layout.css">
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
    <body>
    <div class="main">
      <a href="/index.html">Back</a>

      <main class="post-container">
        <h1>${post.title}</h1>
        <div class="meta">Published: ${new Date(post.created_at * 1000).toLocaleString('en-US', {timeZone: 'America/New_York'})}</div>

        ${post.image_url ? `<img src="${post.image_url}" alt="${post.title}" width="50%"/>` : ''}

        <div class="content">
          ${post.content} </div>
          <br>
      </main>
      <hr>
      </div>
    </body>
    </html>
  `;

  return new Response(html, {
    headers: { "Content-Type": "text/html" }
  });
}
