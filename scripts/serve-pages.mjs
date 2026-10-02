// Test-only static server: deliberately does not rewrite missing paths to index.html.
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, join, extname, sep } from "node:path";

const root = resolve("dist");
const prefix = "/VehicleSite";
const port = Number(process.env.PORT || 4189);
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".json": "application/json",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".mp4": "video/mp4",
};
const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url || "/", "http://127.0.0.1");
    const pathname = decodeURIComponent(url.pathname);
    if (request.method !== "GET" && request.method !== "HEAD") {
      response.writeHead(405, { Allow: "GET, HEAD" }).end();
      return;
    }
    if (pathname === prefix) {
      response.writeHead(301, { Location: prefix + "/" + url.search }).end();
      return;
    }
    if (!pathname.startsWith(prefix + "/")) {
      response.writeHead(404).end("Not found");
      return;
    }
    let filename = resolve(root, "." + pathname.slice(prefix.length));
    if (filename !== root && !filename.startsWith(root + sep)) {
      response.writeHead(403).end();
      return;
    }
    let status = 200;
    try {
      if ((await stat(filename)).isDirectory()) {
        if (!pathname.endsWith("/")) {
          response
            .writeHead(301, { Location: pathname + "/" + url.search })
            .end();
          return;
        }
        filename = join(filename, "index.html");
      }
      await stat(filename);
    } catch {
      status = 404;
      filename = join(root, "404.html");
    }
    const body = await readFile(filename);
    response.writeHead(status, {
      "Content-Type": types[extname(filename)] || "application/octet-stream",
      "Content-Length": body.length,
      "Cache-Control": "no-store",
    });
    response.end(request.method === "HEAD" ? undefined : body);
  } catch {
    response.writeHead(500).end("Static preview error");
  }
});
server.listen(port, "127.0.0.1", () =>
  console.log(
    "Static Pages preview on http://127.0.0.1:" + port + prefix + "/",
  ),
);
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => server.close(() => process.exit(0)));
