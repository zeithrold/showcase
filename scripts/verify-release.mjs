import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const commit = process.env.GITHUB_SHA;
assert.match(commit ?? "", /^[a-f0-9]{40}$/, "GITHUB_SHA must identify the commit being deployed");
const execute = promisify(execFile);
async function wranglerJSON(args) {
  const { stdout } = await execute("pnpm", [
    "exec", "wrangler", ...args, "--config", "dist/server/wrangler.json", "--json",
  ], { timeout: 60000, maxBuffer: 2 * 1024 * 1024 });
  return JSON.parse(stdout);
}

const deployment = await wranglerJSON(["deployments", "status"]);
assert.equal(deployment.versions.length, 1, "Expected a single active Worker version");
const active = deployment.versions[0];
assert.equal(active.percentage, 100, "The new Worker version must serve 100% of traffic");
const version = await wranglerJSON(["versions", "view", active.version_id]);
assert.equal(version.id, active.version_id, "Active version identity does not match");
assert.equal(version.annotations?.["workers/tag"], commit, "Active Worker version belongs to a different Git commit");
console.log(`Verified release ${commit}: Worker ${version.id} serves 100% of traffic.`);
