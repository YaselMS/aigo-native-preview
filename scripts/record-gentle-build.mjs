import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";

const manifestPath = process.argv[2];
assert.ok(manifestPath, "Pass the unsigned build manifest path.");
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
assert.equal(manifest.signed, false);
assert.equal(manifest.remotePushEnabled, false);
manifest.integration = {
  name: "gentle-live-client",
  sourceCommit: "5b37809c16fe284070dc1e632c04d44d0921214a",
  baselineCommit: "7b8e73b06b3f95463209b532e3e67fa77c97416b",
  patchSha256: createHash("sha256")
    .update(readFileSync("patches/gentle-live-client.patch"))
    .digest("hex"),
  qualification: "Client build only. Requires the matching opt-in development PC host. Physical iPhone acceptance remains pending.",
};
writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
