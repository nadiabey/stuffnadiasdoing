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
      <title>Edit "${post.title}" - Stuff Nadia's Doing</title>
      <link rel="stylesheet" href="/assets/css/layout.css">
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
    <body>
    <div class="main">
      <p>View: <a href="/index.html">Home</a> | <a href="/admin.html">Dashboard</a> | <a href="/post/${[post.id]}">Post</a></p>

      <div class="main" style="display:grid;grid-template-columns: repeat(2, 1fr);">
    <div id="editor">
    <h3>Edit post</h3>
    <form id="blogForm" method="post">
    <input type="text" id="title" label="Title" value="${post.title}" required><br><br>
    <textarea id="content" label="Body" rows="10" cols="50" required></textarea><br><br>
    <input type="text" label="Image URL" id="imageFile" value="${post.image_url}"><br><br>
    <button type="submit">Save Edits</button>
    </form>
  </div>
  </div>
      <hr>
      </div>
      <script>document.getElementById("content").value = \`${post.content}\`</script>
  <script>
  document.getElementById('blogForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData();
      formData.append('title', document.getElementById('title').value);
      formData.append('content', document.getElementById('content').value);
      formData.append('image_url', document.getElementById('imageFile').value); //
      formData.append('id',${post.id});

      const response = await fetch('https://justforfun.nadiabey.com/api/admin/edit', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      console.log(response);

      if (response.ok) {
        alert("Edited!");
        window.location.href = "/post/${post.id}?edited";
      } else {
        console.log(response);
        alert("Error editing post");
      };});</script>
    </body>
    </html>
  `;

  return new Response(html, {
    headers: { "Content-Type": "text/html" }
  });
}
