import { serve } from "https://deno.land/std@0.202.0/http/server.ts";
import { serveFile } from "https://deno.land/std@0.202.0/http/file_server.ts";

const port = 8000;

async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const path = url.pathname;

  if (path === "/") {
    return await serveFile(req, "./public/index.html");
  } else if (path.startsWith("/public/")) {
    return await serveFile(req, `.${path}`);
  } else {
    return new Response("Not found", { status: 404 });
  }
}

console.log(`Server running at http://localhost:${port}`);
await serve(handler, { port });