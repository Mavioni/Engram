import { cp, mkdir, readFile, writeFile, rm } from "node:fs/promises";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";

// Always build the device-vault variant, regardless of the caller's API config.
execFileSync(process.platform === "win32" ? "npm.cmd" : "npm", ["run", "build"], {
  stdio: "inherit",
  env: { ...process.env, VITE_API_URL: "" },
});
const index = await readFile("dist/index.html", "utf8");
const jsAsset = [...index.matchAll(/src="\.\/(assets\/[^"?]+\.js)"/gu)][0]?.[1];
if (!jsAsset) throw new Error("A built JavaScript asset was not found.");
const js = await readFile(`dist/${jsAsset}`, "utf8");
const version = createHash("sha256").update(js).digest("hex").slice(0, 12);
// This exact directory contains only generated assets from this script.
await rm("preview/alpha", { recursive: true, force: true });
await mkdir("preview/alpha", { recursive: true });
await cp("dist", "preview/alpha", { recursive: true });
const worker = await readFile("dist/sw.js", "utf8");
await writeFile(
  "preview/alpha/sw.js",
  worker.replace("`${PREFIX}v1`", "`${PREFIX}" + version + "`"),
);
process.stdout.write(`Device alpha packaged at preview/alpha (${version}).\n`);
