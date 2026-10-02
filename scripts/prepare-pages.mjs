import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve, join } from "node:path";

const output = resolve("dist");
const html = await readFile(join(output, "index.html"), "utf8");
const routes = JSON.parse(
  await readFile(new URL("./pages-routes.json", import.meta.url), "utf8"),
);
if (!html.includes("/VehicleSite/assets/"))
  throw new Error("Build with npm run build:pages first.");
const escape = (text) =>
  text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
const page = (title) =>
  html.replace(
    /<title>[^<]*<\/title>/,
    "<title>" + escape(title) + " ? VehicleSite</title>",
  );
for (const route of routes) {
  if (!/^[a-z0-9/-]*$/.test(route.path) || route.path.startsWith("/"))
    throw new Error("Invalid static route");
  const folder = join(output, route.path);
  await mkdir(folder, { recursive: true });
  await writeFile(join(folder, "index.html"), page(route.title));
}
await writeFile(join(output, "404.html"), page("Not found"));
await writeFile(join(output, ".nojekyll"), "");
await writeFile(
  join(output, "deployment.json"),
  JSON.stringify(
    {
      revision: process.env.GITHUB_SHA ?? "local-preview",
      builtAt: new Date().toISOString(),
      routes: routes.map(
        (route) => "/VehicleSite/" + (route.path ? route.path + "/" : ""),
      ),
    },
    null,
    2,
  ) + "\n",
);
console.log(
  "Prepared " +
    routes.length +
    " static page entry points, a 404 page, and deployment metadata.",
);
