export async function onRequestOptions(context) {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "https://creating.nadiabey.com",
      "Access-Control-Allow-Methods": "GET, PUT, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    },
  });
}

export async function onRequestPost({ request, env }) {
  const formData = await request.formData();
  const file = formData.get('file');

  if (!file) return new Response("No file uploaded", { status: 400 });

  // Create a unique filename (e.g., timestamp-filename.jpg)
  const filename = `${Date.now()}-${file.name}`;
  console.log(filename);

  // Save to R2
  const save = await env.BUCKET.put(filename, file.stream());
  console.log(save);

  // Return the public URL
  const publicUrl = `https://r2.nadiabey.com/${filename}`;
  console.log(publicUrl);

  return new Response(JSON.stringify({ url: publicUrl }), {
    headers: { "Content-Type": "application/json" }
  }, {status: 200});
}
